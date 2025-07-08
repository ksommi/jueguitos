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
			await updateUserStats(userId);
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

async function updateUserStats(userId: string): Promise<void> {
	try {
		// Obtener todas las estadísticas del usuario
		const { data: results, error } = await supabase
			.from("game_results")
			.select("won, attempts")
			.eq("user_id", userId)
			.order("completed_at", { ascending: false });

		if (error || !results) {
			throw new Error(
				`Error obteniendo resultados del usuario: ${
					error?.message || "Sin resultados"
				}`
			);
		}

		const totalGames = results.length;
		const totalWins = results.filter((r) => r.won).length;
		const averageAttempts =
			totalGames > 0
				? Math.round(
						(results.reduce((sum, r) => sum + r.attempts, 0) /
							totalGames) *
							100
				  ) / 100
				: 0;

		// Calcular racha actual
		let currentStreak = 0;
		for (const result of results) {
			if (result.won) {
				currentStreak++;
			} else {
				break;
			}
		}

		// Calcular mejor racha
		let bestStreak = 0;
		let tempStreak = 0;
		for (const result of results.reverse()) {
			if (result.won) {
				tempStreak++;
				bestStreak = Math.max(bestStreak, tempStreak);
			} else {
				tempStreak = 0;
			}
		}

		// Actualizar usuario
		const { error: updateError } = await supabase
			.from("users")
			.update({
				total_games: totalGames,
				total_wins: totalWins,
				current_streak: currentStreak,
				best_streak: bestStreak,
				average_attempts: averageAttempts,
			})
			.eq("id", userId);

		if (updateError) {
			throw new Error(
				`Error actualizando estadísticas del usuario: ${updateError.message}`
			);
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
