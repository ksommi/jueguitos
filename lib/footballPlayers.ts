// Procesador de datos para cargar jugadores argentinos
// Este archivo procesa el JSON local de jugadores y clubes

export interface LocalPlayerData {
	nombre: string;
	clubes: string[];
}

export interface ProcessedPlayer {
	id: string; // ID generado basado en el nombre
	name: string;
	surname: string; // Apellido extraído
	surnameIsUnique: boolean; // Si el apellido es único
	clubs: string[]; // Lista de clubes del jugador
}

/**
 * Genera un ID único para un jugador basado en su nombre
 */
export function generatePlayerId(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]/g, "")
		.substring(0, 20);
}

/**
 * Procesa los datos del JSON local de jugadores
 */
export function processPlayersData(
	jsonData: LocalPlayerData[]
): ProcessedPlayer[] {
	if (!Array.isArray(jsonData)) {
		console.error("Invalid JSON structure: expected array");
		return [];
	}

	const players: ProcessedPlayer[] = [];

	for (const playerData of jsonData) {
		try {
			const name = playerData.nombre;
			const clubs = playerData.clubes;

			if (name && clubs && Array.isArray(clubs) && clubs.length >= 3) {
				const id = generatePlayerId(name);
				const surname = extractSurname(name);

				players.push({
					id: id,
					name: name,
					surname: surname,
					surnameIsUnique: false, // Se calculará después
					clubs: clubs,
				});
			}
		} catch (error) {
			console.error("Error processing player:", playerData, error);
		}
	}

	// Calcular la unicidad de los apellidos
	return checkSurnameUniqueness(players);
}

/**
 * Obtiene los clubes de un jugador desde los datos ya procesados
 */
export function getPlayerClubs(player: ProcessedPlayer): string[] {
	return player.clubs || [];
}

/**
 * Filtra jugadores que tengan al menos 3 clubes
 */
export function getPlayersWithClubs(
	players: ProcessedPlayer[]
): ProcessedPlayer[] {
	return players.filter((player) => player.clubs && player.clubs.length >= 3);
}

/**
 * Función para validar que un jugador tenga los datos necesarios
 */
export function validatePlayer(player: unknown): player is ProcessedPlayer {
	if (typeof player !== "object" || player === null) {
		return false;
	}

	const p = player as Record<string, unknown>;

	return (
		typeof p.id === "string" &&
		typeof p.name === "string" &&
		typeof p.surname === "string" &&
		typeof p.surnameIsUnique === "boolean" &&
		Array.isArray(p.clubs) &&
		p.clubs.length >= 3 &&
		p.clubs.every((club) => typeof club === "string")
	);
}

/**
 * Extrae el apellido de un nombre completo
 * Maneja casos como "Lionel Messi" -> "Messi"
 * También casos como "Carlos Alberto Tevez" -> "Tevez"
 */
export function extractSurname(fullName: string): string {
	const nameParts = fullName.trim().split(" ");

	// Si solo hay una palabra, es el apellido
	if (nameParts.length === 1) {
		return nameParts[0];
	}

	// El apellido suele ser la última palabra
	// Excepto en casos como "Di María" donde son dos palabras
	const lastName = nameParts[nameParts.length - 1];

	// Casos especiales para apellidos compuestos
	if (nameParts.length > 2) {
		const secondToLast = nameParts[nameParts.length - 2];

		// Prefijos comunes en apellidos argentinos
		const prefixes = ["Di", "De", "Del", "Da", "Van", "Von", "Mac", "Mc"];

		if (prefixes.includes(secondToLast)) {
			return `${secondToLast} ${lastName}`;
		}
	}

	return lastName;
}

/**
 * Verifica si un apellido es único en la lista de jugadores
 */
export function checkSurnameUniqueness(
	players: ProcessedPlayer[]
): ProcessedPlayer[] {
	const surnameCount: { [key: string]: number } = {};

	// Contar ocurrencias de cada apellido
	players.forEach((player) => {
		const surname = player.surname.toLowerCase();
		surnameCount[surname] = (surnameCount[surname] || 0) + 1;
	});

	// Marcar si cada apellido es único
	return players.map((player) => ({
		...player,
		surnameIsUnique: surnameCount[player.surname.toLowerCase()] === 1,
	}));
}

/**
 * Normaliza un string para comparación (quita acentos, convierte a minúsculas)
 */
export function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Quitar acentos
		.replace(/[^a-z0-9\s]/g, "") // Quitar caracteres especiales
		.trim();
}

/**
 * Verifica si una respuesta coincide con un jugador
 * Acepta tanto nombre completo como apellido (si es único)
 */
export function isCorrectAnswer(
	guess: string,
	playerName: string,
	playerSurname: string,
	surnameIsUnique: boolean
): boolean {
	const normalizedGuess = normalizeString(guess);
	const normalizedFullName = normalizeString(playerName);
	const normalizedSurname = normalizeString(playerSurname);

	// Verificar nombre completo exacto
	if (normalizedGuess === normalizedFullName) {
		return true;
	}

	// Verificar apellido solo si es único
	if (surnameIsUnique && normalizedGuess === normalizedSurname) {
		return true;
	}

	// Separar las palabras para análisis adicional
	const guessWords = normalizedGuess
		.split(" ")
		.filter((word) => word.length > 0);
	const nameWords = normalizedFullName
		.split(" ")
		.filter((word) => word.length > 0);

	// Si solo ingresó una palabra y no es el apellido único, verificar si es solo el nombre de pila
	if (guessWords.length === 1) {
		// Si no es el apellido único, rechazar
		if (!surnameIsUnique) {
			return false;
		}

		// Si es el apellido único, ya se verificó arriba
		return false;
	}

	// Para múltiples palabras, verificar que contenga el apellido
	// y que no sea solo el nombre de pila
	const containsSurname = guessWords.some(
		(word) =>
			normalizedSurname.includes(word) || word.includes(normalizedSurname)
	);

	if (!containsSurname) {
		return false;
	}

	// Verificar que todas las palabras de la respuesta estén en el nombre
	return guessWords.every((word) =>
		nameWords.some(
			(nameWord) => nameWord.includes(word) || word.includes(nameWord)
		)
	);
}

/**
 * Genera la fecha de hoy en formato string
 */
function getTodayDateString(): string {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const year = today.getFullYear();
	return `${day}/${month}/${year}`;
}

/**
 * Función para generar el resultado en emojis para compartir
 */
export function generateShareText(
	guesses: string[],
	won: boolean,
	attempts: number
): string {
	const today = getTodayDateString();

	let result = `⚽ Adivina el Futbolista ${today}\n`;
	result += won ? `✅ ${attempts} intentos` : `❌ ${attempts} intentos`;
	result += "\n\n";

	// Generar emojis basados en los intentos
	guesses.forEach((guess, index) => {
		// Si ganó y es el último intento, siempre verde
		if (won && index === guesses.length - 1) {
			result += "🟩";
		} else {
			// Intento fallido
			result += "🟥";
		}
	});

	// Agregar cuadrados grises para los intentos restantes si no ganó
	if (!won) {
		const remainingAttempts = 6 - attempts;
		for (let i = 0; i < remainingAttempts; i++) {
			result += "⬜";
		}
	}

	result += "\n\n🎮 ¡Jugá en: https://jueguitos-psi.vercel.app/futbolista";
	return result;
}
