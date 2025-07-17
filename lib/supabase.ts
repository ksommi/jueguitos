import { createClient } from "@supabase/supabase-js";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { handleGlobalError } from "./errorHandler";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
	console.error("Missing Supabase environment variables:", {
		url: !!supabaseUrl,
		key: !!supabaseAnonKey,
		env:
			typeof process !== "undefined"
				? Object.keys(process.env).filter((k) => k.includes("SUPABASE"))
				: "No process env",
	});
	throw new Error(
		"Missing Supabase configuration. Please check your environment variables."
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de la base de datos
export interface DailyCountry {
	id: number;
	date: string; // formato YYYY-MM-DD
	country_name: string;
	country_code: string;
	created_at: string;
}

export interface DailyPlayer {
	id: number;
	date: string; // formato YYYY-MM-DD
	player_name: string;
	player_surname: string;
	surname_is_unique: boolean;
	player_id: string;
	clubs: string[];
	created_at: string;
}

export interface User {
	id: string;
	username: string;
	total_games: number;
	total_wins: number;
	current_streak: number;
	best_streak: number;
	average_attempts: number;
	created_at: string;
	updated_at: string;
}

export interface GameResult {
	id: number;
	user_id: string;
	daily_country_id: number;
	won: boolean;
	attempts: number;
	guesses: string[]; // JSON array de países adivinados
	completed_at: string;
}

export interface PlayerGameResult {
	id: number;
	user_id: string;
	daily_player_id: number;
	won: boolean;
	attempts: number;
	guesses: string[]; // JSON array de jugadores adivinados
	completed_at: string;
}

export interface RankingEntry {
	user_id: string;
	username: string;
	total_wins: number;
	current_streak: number;
	best_streak: number;
	average_attempts: number;
	total_games: number;
	win_percentage: number;
}

// Funciones para manejar países diarios
export async function getTodayCountry(): Promise<DailyCountry | null> {
	try {
		const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

		const { data: existing, error: existingError } = await supabase
			.from("daily_countries")
			.select("*")
			.eq("date", today)
			.single();

		if (existing && !existingError) {
			return existing;
		}

		// Usar la API route para crear el país del día
		const response = await fetch("/api/daily-country");
		const result = await response.json();

		if (!result.success) {
			throw new Error(`Error de API: ${result.error}`);
		}

		return result.data;
	} catch (error) {
		handleGlobalError(error, "obtener país del día");
		return null;
	}
}

// Funciones para manejar jugadores diarios
export async function getTodayPlayer(): Promise<DailyPlayer | null> {
	try {
		const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

		const { data: existing, error: existingError } = await supabase
			.from("daily_players")
			.select("*")
			.eq("date", today)
			.single();

		if (existing && !existingError) {
			return existing;
		}

		// Usar la API route para crear el jugador del día
		const response = await fetch("/api/daily-player");
		const result = await response.json();

		if (result.error) {
			throw new Error(`Error de API: ${result.error}`);
		}

		// Construir el objeto DailyPlayer con los datos recibidos
		return {
			id: result.id,
			date: result.date,
			player_name: "", // No se revela hasta que se adivine
			player_surname: "", // No se revela hasta que se adivine
			surname_is_unique: false, // No se revela hasta que se adivine
			player_id: result.player_id,
			clubs: result.clubs,
			created_at: new Date().toISOString(),
		};
	} catch (error) {
		handleGlobalError(error, "obtener jugador del día");
		return null;
	}
}

// Funciones para manejar usuarios con Supabase Auth
export async function signUpUser(
	email: string,
	password: string,
	username: string
): Promise<{ user: SupabaseUser | null; userRecord: User | null }> {
	try {
		// Crear usuario en Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
		});

		if (authError || !authData.user) {
			throw new Error(
				`Error creando usuario: ${
					authError?.message || "Usuario no creado"
				}`
			);
		}

		// Si email confirmation está habilitado, el usuario necesita confirmar email primero
		if (
			!authData.user.email_confirmed_at &&
			authData.user.confirmation_sent_at
		) {
			return {
				user: authData.user,
				userRecord: null,
			};
		}

		// Crear perfil de usuario en nuestra tabla solo si está confirmado o confirmación deshabilitada
		const { data, error } = await supabase
			.from("users")
			.insert([
				{
					id: authData.user.id,
					username,
					total_games: 0,
					total_wins: 0,
					current_streak: 0,
					best_streak: 0,
					average_attempts: 0,
				},
			])
			.select()
			.single();

		if (error) {
			throw new Error(`Error creando perfil de usuario: ${error.message}`);
		}

		return { user: authData.user, userRecord: data };
	} catch (error) {
		handleGlobalError(error, "registro de usuario");
		return { user: null, userRecord: null };
	}
}

export async function signInUser(
	email: string,
	password: string
): Promise<{ user: SupabaseUser | null; userRecord: User | null }> {
	try {
		// Autenticar con Supabase Auth
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email,
				password,
			});

		if (authError || !authData.user) {
			throw new Error(
				`Error de autenticación: ${
					authError?.message || "Credenciales inválidas"
				}`
			);
		}

		// Obtener perfil de usuario
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", authData.user.id)
			.single();

		if (error) {
			throw new Error(
				`Error obteniendo perfil de usuario: ${error.message}`
			);
		}

		return { user: authData.user, userRecord: data };
	} catch (error) {
		handleGlobalError(error, "inicio de sesión");
		return { user: null, userRecord: null };
	}
}

export async function signInAnonymously(): Promise<{
	user: SupabaseUser | null;
	userRecord: User | null;
}> {
	try {
		// Crear usuario anónimo en Supabase Auth
		const { data: authData, error: authError } =
			await supabase.auth.signInAnonymously();

		if (authError || !authData.user) {
			throw new Error(
				`Error creando usuario anónimo: ${
					authError?.message || "No se pudo crear usuario anónimo"
				}`
			);
		}

		// Verificar si ya existe un perfil de usuario
		const { data: existingProfile, error: profileError } = await supabase
			.from("users")
			.select("*")
			.eq("id", authData.user.id)
			.single();

		if (profileError || !existingProfile) {
			// Crear perfil de usuario en nuestra tabla
			const { data, error } = await supabase
				.from("users")
				.insert([
					{
						id: authData.user.id, // Usar el ID de Supabase Auth
						username: `Anónimo_${authData.user.id.substring(0, 8)}`,
						total_games: 0,
						total_wins: 0,
						current_streak: 0,
						best_streak: 0,
						average_attempts: 0,
					},
				])
				.select()
				.single();

			if (error) {
				throw new Error(
					`Error creando perfil de usuario anónimo: ${error.message}`
				);
			}

			return { user: authData.user, userRecord: data };
		}

		return { user: authData.user, userRecord: existingProfile };
	} catch (error) {
		handleGlobalError(error, "inicio de sesión anónimo");
		return { user: null, userRecord: null };
	}
}

export async function getCurrentUser(): Promise<{
	user: SupabaseUser | null;
	userRecord: User | null;
}> {
	try {
		// Obtener usuario autenticado
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			return { user: null, userRecord: null };
		}

		// Obtener perfil de usuario
		const { data, error } = await supabase
			.from("users")
			.select("*")
			.eq("id", user.id)
			.single();

		if (error) {
			throw new Error(
				`Error obteniendo perfil de usuario actual: ${error.message}`
			);
		}

		return { user, userRecord: data };
	} catch (error) {
		handleGlobalError(error, "obtener usuario actual");
		return { user: null, userRecord: null };
	}
}

export async function signOut(): Promise<boolean> {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) {
			throw new Error(`Error cerrando sesión: ${error.message}`);
		}
		return true;
	} catch (error) {
		handleGlobalError(error, "cerrar sesión");
		return false;
	}
}

// Funciones para manejar resultados de juegos
export async function saveGameResult(
	dailyCountryId: number,
	won: boolean,
	attempts: number,
	guesses: Array<{ country: string; distance: number }>
): Promise<boolean> {
	try {
		// Obtener el usuario autenticado actual
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error(
				`No hay usuario autenticado: ${authError?.message || "Sin usuario"}`
			);
		}

		const userId = user.id;

		// Verificar si ya existe un registro
		const { data: existing, error: selectError } = await supabase
			.from("game_results")
			.select("id")
			.eq("user_id", userId)
			.eq("daily_country_id", dailyCountryId)
			.single();

		if (existing && !selectError) {
			// Ya existe, actualizar el registro

			const { error: updateError } = await supabase
				.from("game_results")
				.update({
					won,
					attempts,
					guesses: JSON.stringify(guesses),
				})
				.eq("user_id", userId)
				.eq("daily_country_id", dailyCountryId)
				.select();

			if (updateError) {
				throw new Error(
					`Error actualizando resultado del juego: ${updateError.message}`
				);
			}
		} else {
			// No existe, insertar nuevo registro
			const { error: insertError } = await supabase
				.from("game_results")
				.insert([
					{
						user_id: userId,
						daily_country_id: dailyCountryId,
						won,
						attempts,
						guesses: JSON.stringify(guesses),
					},
				])
				.select();

			if (insertError) {
				throw new Error(
					`Error insertando resultado del juego: ${insertError.message}`
				);
			}
		}

		// Actualizar estadísticas del usuario solo si ganó (para evitar múltiples actualizaciones)
		if (won) {
			// TODO: Implementar función para actualizar estadísticas del juego de países
			// await updateUserStatsFromCountryGame(userId);
		}

		return true;
	} catch (error) {
		handleGlobalError(error, "guardar resultado del juego");
		return false;
	}
}

export async function getUserGameResult(
	dailyCountryId: number
): Promise<GameResult | null> {
	try {
		// Obtener el usuario autenticado actual
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error(
				`No hay usuario autenticado: ${authError?.message || "Sin usuario"}`
			);
		}

		const { data, error } = await supabase
			.from("game_results")
			.select("*")
			.eq("user_id", user.id)
			.eq("daily_country_id", dailyCountryId)
			.single();

		if (error) {
			return null;
		}

		return data;
	} catch (error) {
		handleGlobalError(error, "obtener resultado del juego del usuario");
		return null;
	}
}

// Funciones para manejar resultados del juego de jugadores
export async function savePlayerGameResult(
	userId: string,
	dailyPlayerId: number,
	won: boolean,
	attempts: number,
	guesses: string[]
): Promise<boolean> {
	try {
		// Verificar si ya existe un resultado para este usuario y jugador diario
		const { data: existingResult, error: existingError } = await supabase
			.from("player_game_results")
			.select("*")
			.eq("user_id", userId)
			.eq("daily_player_id", dailyPlayerId)
			.single();

		if (existingError && existingError.code !== "PGRST116") {
			throw new Error(
				`Error verificando resultado existente: ${existingError.message}`
			);
		}

		if (existingResult) {
			// Ya existe, actualizar si es necesario
			const { error: updateError } = await supabase
				.from("player_game_results")
				.update({
					won,
					attempts,
					guesses: JSON.stringify(guesses),
				})
				.eq("user_id", userId)
				.eq("daily_player_id", dailyPlayerId)
				.select();

			if (updateError) {
				throw new Error(
					`Error actualizando resultado del juego: ${updateError.message}`
				);
			}
		} else {
			// No existe, insertar nuevo registro
			const { error: insertError } = await supabase
				.from("player_game_results")
				.insert([
					{
						user_id: userId,
						daily_player_id: dailyPlayerId,
						won,
						attempts,
						guesses: JSON.stringify(guesses),
					},
				])
				.select();

			if (insertError) {
				throw new Error(
					`Error insertando resultado del juego: ${insertError.message}`
				);
			}
		}

		// Actualizar estadísticas del usuario solo si ganó
		if (won) {
			await updatePlayerUserStats(userId);
		}

		return true;
	} catch (error) {
		handleGlobalError(error, "guardar resultado del juego de jugadores");
		return false;
	}
}

export async function getUserPlayerGameResult(
	dailyPlayerId: number
): Promise<PlayerGameResult | null> {
	try {
		// Obtener el usuario autenticado actual
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();

		if (authError || !user) {
			throw new Error("Usuario no autenticado");
		}

		const { data, error } = await supabase
			.from("player_game_results")
			.select("*")
			.eq("user_id", user.id)
			.eq("daily_player_id", dailyPlayerId)
			.single();

		if (error && error.code !== "PGRST116") {
			throw new Error(
				`Error obteniendo resultado del juego: ${error.message}`
			);
		}

		if (!data) {
			return null;
		}

		return {
			...data,
			guesses: Array.isArray(data.guesses)
				? data.guesses
				: JSON.parse(data.guesses || "[]"),
		};
	} catch (error) {
		handleGlobalError(error, "obtener resultado del juego de jugadores");
		return null;
	}
}

// Función para actualizar estadísticas del usuario para el juego de jugadores
async function updatePlayerUserStats(userId: string): Promise<void> {
	try {
		const { data, error } = await supabase.rpc("get_player_game_stats", {
			user_uuid: userId,
		});

		if (error) {
			throw new Error(`Error obteniendo estadísticas: ${error.message}`);
		}

		if (!data || data.length === 0) {
			throw new Error("No se obtuvieron estadísticas");
		}

		const stats = data[0];

		// Actualizar la tabla de usuarios con las nuevas estadísticas
		const { error: updateError } = await supabase
			.from("users")
			.update({
				total_games: stats.total_games,
				total_wins: stats.total_wins,
				current_streak: stats.current_streak,
				best_streak: stats.best_streak,
				average_attempts: stats.average_attempts,
				updated_at: new Date().toISOString(),
			})
			.eq("id", userId);

		if (updateError) {
			throw new Error(`Error actualizando usuario: ${updateError.message}`);
		}
	} catch (error) {
		handleGlobalError(error, "actualizar estadísticas del usuario");
	}
}

// Funciones para ranking
export async function getRanking(limit = 50): Promise<RankingEntry[]> {
	try {
		const { data, error } = await supabase
			.from("ranking_view")
			.select("*")
			.limit(limit);

		if (error) {
			throw new Error(`Error obteniendo ranking: ${error.message}`);
		}

		return data || [];
	} catch (error) {
		handleGlobalError(error, "obtener ranking");
		return [];
	}
}

export async function getUserRanking(userId: string): Promise<number | null> {
	try {
		const { data, error } = await supabase.rpc("get_user_ranking", {
			user_id: userId,
		});

		if (error) {
			throw new Error(
				`Error obteniendo ranking del usuario: ${error.message}`
			);
		}

		return data;
	} catch (error) {
		handleGlobalError(error, "obtener ranking del usuario");
		return null;
	}
}

// Función para inicializar país del día (llamar una vez al día)
export async function initializeDailyCountry(): Promise<DailyCountry | null> {
	return await getTodayCountry();
}

// Función de diagnóstico para probar la conexión
export async function testSupabaseConnection(): Promise<boolean> {
	try {
		const { error } = await supabase
			.from("daily_countries")
			.select("id")
			.limit(1);

		if (error) {
			throw new Error(`Error de conexión: ${error.message}`);
		}

		return true;
	} catch (error) {
		handleGlobalError(error, "prueba de conexión a Supabase");
		return false;
	}
}

export async function getPlayerGameRanking(): Promise<RankingEntry[]> {
	try {
		const { data, error } = await supabase
			.from("player_game_ranking_view")
			.select("*")
			.limit(50);

		if (error) {
			throw new Error(`Error obteniendo ranking: ${error.message}`);
		}

		if (!data) {
			return [];
		}

		return data.map(
			(entry: {
				username: string;
				total_games: number;
				total_wins: number;
				win_rate: number;
				current_streak: number;
				best_streak: number;
				average_attempts: number;
			}) => ({
				user_id: "", // No disponible directamente desde la vista
				username: entry.username,
				total_wins: entry.total_wins,
				current_streak: entry.current_streak,
				best_streak: entry.best_streak,
				average_attempts: entry.average_attempts,
				total_games: entry.total_games,
				win_percentage: entry.win_rate,
			})
		);
	} catch (error) {
		console.error("Error detallado:", error);
		handleGlobalError(error, "obtener ranking del juego de jugadores");
		return [];
	}
}
