import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { processPlayersData, isCorrectAnswer } from "@/lib/footballPlayers";
import playersData from "@/database/jugadores_2000_2020.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

interface DailyPlayer {
	id: number;
	date: string;
	player_name: string;
	player_surname: string;
	surname_is_unique: boolean;
	player_id: string;
	clubs: string[];
	created_at: string;
}

/**
 * Selecciona 3 clubes al azar de una lista
 */
function selectRandomClubs(clubs: string[], count: number = 3): string[] {
	const shuffled = [...clubs].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

/**
 * Genera un jugador aleatorio con al menos 3 clubes
 */
async function generateRandomPlayer(): Promise<DailyPlayer | null> {
	try {
		const processedPlayers = processPlayersData(playersData);

		if (!processedPlayers || processedPlayers.length === 0) {
			console.error("No players found in JSON data");
			return null;
		}

		// Obtener jugadores ya utilizados en los últimos 30 días
		const { data: recentPlayers } = await supabaseAdmin
			.from("daily_players")
			.select("player_id")
			.order("date", { ascending: false })
			.limit(30);

		const usedPlayerIds = recentPlayers?.map((p) => p.player_id) || [];

		// Filtrar jugadores no utilizados recientemente
		const availablePlayers = processedPlayers.filter(
			(player) => !usedPlayerIds.includes(player.id)
		);

		// Si no hay jugadores disponibles, usar todos
		const playersToChooseFrom =
			availablePlayers.length > 0 ? availablePlayers : processedPlayers;

		let attempts = 0;
		const maxAttempts = 10;

		while (attempts < maxAttempts) {
			// Seleccionar jugador al azar
			const randomIndex = Math.floor(
				Math.random() * playersToChooseFrom.length
			);
			const selectedPlayer = playersToChooseFrom[randomIndex];

			if (!selectedPlayer) {
				attempts++;
				continue;
			}

			console.log(
				`Checking player: ${selectedPlayer.name} (${selectedPlayer.id})`
			);

			// Los clubes ya están disponibles en el jugador
			const playerClubs = selectedPlayer.clubs;

			if (playerClubs.length >= 3) {
				// Seleccionar 3 clubes al azar
				const selectedClubs = selectRandomClubs(playerClubs, 3);

				console.log(
					`✓ Selected: ${
						selectedPlayer.name
					} with clubs: ${selectedClubs.join(", ")}`
				);

				return {
					id: 0, // Se asignará en la base de datos
					date: new Date().toISOString().split("T")[0],
					player_name: selectedPlayer.name,
					player_surname: selectedPlayer.surname,
					surname_is_unique: selectedPlayer.surnameIsUnique,
					player_id: selectedPlayer.id,
					clubs: selectedClubs,
					created_at: new Date().toISOString(),
				};
			} else {
				console.log(
					`✗ ${selectedPlayer.name}: Only ${playerClubs.length} clubs found`
				);

				// Remover este jugador de la lista para no intentarlo de nuevo
				playersToChooseFrom.splice(randomIndex, 1);

				if (playersToChooseFrom.length === 0) {
					console.error("No more players to try");
					break;
				}
			}

			attempts++;
		}

		console.error("Could not find a suitable player after maximum attempts");
		return null;
	} catch (error) {
		console.error("Error in generateRandomPlayer:", error);
		return null;
	}
}

/**
 * Obtiene o crea el jugador del día
 */
async function getOrCreateDailyPlayer(): Promise<DailyPlayer | null> {
	try {
		const today = new Date().toISOString().split("T")[0];

		// Verificar si ya existe un jugador para hoy
		const { data: existingPlayer } = await supabaseAdmin
			.from("daily_players")
			.select("*")
			.eq("date", today)
			.single();

		if (existingPlayer) {
			console.log(
				"Found existing player for today:",
				existingPlayer.player_name
			);
			return existingPlayer;
		}

		// Si no existe, generar uno nuevo
		console.log("Generating new daily player...");
		const newPlayer = await generateRandomPlayer();

		if (!newPlayer) {
			console.error("Failed to generate new player");
			return null;
		}

		// Guardar en la base de datos
		const { data: savedPlayer, error } = await supabaseAdmin
			.from("daily_players")
			.insert([
				{
					date: today,
					player_name: newPlayer.player_name,
					player_surname: newPlayer.player_surname,
					surname_is_unique: newPlayer.surname_is_unique,
					player_id: newPlayer.player_id,
					clubs: newPlayer.clubs,
				},
			])
			.select()
			.single();

		if (error) {
			console.error("Error saving daily player:", error);
			return null;
		}

		console.log(
			"Successfully created daily player:",
			savedPlayer.player_name
		);
		return savedPlayer;
	} catch (error) {
		console.error("Error in getOrCreateDailyPlayer:", error);
		return null;
	}
}

// GET: Obtener el jugador del día
export async function GET() {
	try {
		const dailyPlayer = await getOrCreateDailyPlayer();

		if (!dailyPlayer) {
			return NextResponse.json(
				{ error: "No se pudo obtener el jugador del día" },
				{ status: 500 }
			);
		}

		// Retornar solo la información necesaria para el juego (sin revelar el nombre)
		return NextResponse.json({
			id: dailyPlayer.id,
			date: dailyPlayer.date,
			clubs: dailyPlayer.clubs,
			player_id: dailyPlayer.player_id,
		});
	} catch (error) {
		console.error("Error in GET /api/daily-player:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 }
		);
	}
}

// POST: Verificar respuesta del jugador
export async function POST(request: Request) {
	try {
		const { guess, userId, previousGuesses = [] } = await request.json();

		if (!guess || !userId) {
			return NextResponse.json(
				{ error: "Faltan datos requeridos" },
				{ status: 400 }
			);
		}

		// Obtener el jugador del día
		const dailyPlayer = await getOrCreateDailyPlayer();

		if (!dailyPlayer) {
			return NextResponse.json(
				{ error: "No se pudo obtener el jugador del día" },
				{ status: 500 }
			);
		}

		// Verificar si el usuario ya tiene un registro para este jugador
		const { data: existingResult } = await supabaseAdmin
			.from("player_game_results")
			.select("*")
			.eq("user_id", userId)
			.eq("daily_player_id", dailyPlayer.id)
			.single();

		// Si ya ganó o completó los 6 intentos, no puede seguir jugando
		if (
			existingResult &&
			(existingResult.won || existingResult.attempts >= 6)
		) {
			return NextResponse.json({
				alreadyPlayed: true,
				won: existingResult.won,
				attempts: existingResult.attempts,
				correctAnswer: dailyPlayer.player_name,
				guesses: Array.isArray(existingResult.guesses)
					? existingResult.guesses
					: JSON.parse(existingResult.guesses || "[]"),
			});
		}

		// Verificar si la respuesta es correcta usando la nueva lógica
		const isCorrect = isCorrectAnswer(
			guess.trim(),
			dailyPlayer.player_name,
			dailyPlayer.player_surname,
			dailyPlayer.surname_is_unique
		);

		// Actualizar el historial de intentos
		const newGuesses = [...previousGuesses, guess.trim()];
		const attempts = newGuesses.length;

		if (existingResult) {
			// Actualizar el registro existente
			const { error: updateError } = await supabaseAdmin
				.from("player_game_results")
				.update({
					won: isCorrect, // Solo true si acierta en este intento
					attempts: attempts,
					guesses: newGuesses,
				})
				.eq("user_id", userId)
				.eq("daily_player_id", dailyPlayer.id);

			if (updateError) {
				console.error("Error updating game result:", updateError);
				return NextResponse.json(
					{ error: "Error al actualizar el resultado" },
					{ status: 500 }
				);
			}
		} else {
			// Crear nuevo registro (primer intento)
			const { error: insertError } = await supabaseAdmin
				.from("player_game_results")
				.insert([
					{
						user_id: userId,
						daily_player_id: dailyPlayer.id,
						won: isCorrect, // Solo true si acierta en el primer intento
						attempts: attempts,
						guesses: newGuesses,
					},
				]);

			if (insertError) {
				console.error("Error creating game result:", insertError);
				return NextResponse.json(
					{ error: "Error al crear el resultado" },
					{ status: 500 }
				);
			}
		}

		return NextResponse.json({
			correct: isCorrect,
			attempts: attempts,
			correctAnswer:
				isCorrect || attempts >= 6 ? dailyPlayer.player_name : undefined,
			guesses: newGuesses,
		});
	} catch (error) {
		console.error("Error in POST /api/daily-player:", error);
		return NextResponse.json(
			{ error: "Error interno del servidor" },
			{ status: 500 }
		);
	}
}
