// Procesador de datos para cargar jugadores argentinos
// Este archivo procesa el JSON de Wikidata y carga los jugadores en la base de datos

export interface WikidataPlayer {
	jugador: {
		type: string;
		value: string; // URL completa como "http://www.wikidata.org/entity/Q615"
	};
	jugadorLabel: {
		"xml:lang": string;
		type: string;
		value: string; // Nombre del jugador
	};
}

export interface WikidataResponse {
	head: {
		vars: string[];
	};
	results: {
		bindings: WikidataPlayer[];
	};
}

export interface WikidataClubBinding {
	clubLabel: {
		value: string;
	};
}

export interface ProcessedPlayer {
	id: string; // ID de Wikidata (ej: Q615)
	name: string;
	surname: string; // Apellido extraído
	surnameIsUnique: boolean; // Si el apellido es único
	wikidataUrl: string;
}

/**
 * Extrae el ID de Wikidata de la URL completa
 */
export function extractWikidataId(url: string): string {
	const matches = url.match(/Q\d+$/);
	return matches ? matches[0] : "";
}

/**
 * Procesa los datos del JSON de jugadores
 */
export function processPlayersData(
	jsonData: WikidataResponse
): ProcessedPlayer[] {
	if (!jsonData.results || !jsonData.results.bindings) {
		console.error("Invalid JSON structure");
		return [];
	}

	const players: ProcessedPlayer[] = [];

	for (const binding of jsonData.results.bindings) {
		try {
			const wikidataUrl = binding.jugador.value;
			const wikidataId = extractWikidataId(wikidataUrl);
			const name = binding.jugadorLabel.value;

			if (wikidataId && name) {
				const surname = extractSurname(name);

				players.push({
					id: wikidataId,
					name: name,
					surname: surname,
					surnameIsUnique: false, // Se calculará después
					wikidataUrl: wikidataUrl,
				});
			}
		} catch (error) {
			console.error("Error processing player:", binding, error);
		}
	}

	// Calcular la unicidad de los apellidos
	return checkSurnameUniqueness(players);
}

/**
 * Obtiene los clubes de un jugador específico usando Wikidata
 */
export async function getPlayerClubs(wikidataId: string): Promise<string[]> {
	const query = `
    SELECT DISTINCT ?clubLabel WHERE {
      wd:${wikidataId} p:P54 ?afiliacion.
      ?afiliacion ps:P54 ?club.
      ?club wdt:P31 wd:Q476028.
      SERVICE wikibase:label { bd:serviceParam wikibase:language "es". }
    }
    LIMIT 5
  `;

	const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
		query
	)}&format=json`;

	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent":
					"AdiviaElFutbolista/1.0 (https://github.com/ksommi/jueguitos)",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (!data.results || !data.results.bindings) {
			return [];
		}

		const clubs = data.results.bindings
			.map((binding: WikidataClubBinding) => binding.clubLabel?.value)
			.filter((club: string) => club && club.trim() !== "");

		return clubs;
	} catch (error) {
		console.error(`Error fetching clubs for ${wikidataId}:`, error);
		return [];
	}
}

/**
 * Obtiene jugadores con al menos 3 clubes
 */
export async function getPlayersWithClubs(
	players: ProcessedPlayer[]
): Promise<Array<ProcessedPlayer & { clubs: string[] }>> {
	const playersWithClubs = [];

	for (const player of players) {
		try {
			console.log(`Fetching clubs for ${player.name} (${player.id})`);

			const clubs = await getPlayerClubs(player.id);

			if (clubs.length >= 3) {
				playersWithClubs.push({
					...player,
					clubs: clubs.slice(0, 3), // Tomar solo los primeros 3
				});

				console.log(`✓ ${player.name}: ${clubs.slice(0, 3).join(", ")}`);
			} else {
				console.log(`✗ ${player.name}: Only ${clubs.length} clubs found`);
			}

			// Pausa para no saturar la API de Wikidata
			await new Promise((resolve) => setTimeout(resolve, 500));
		} catch (error) {
			console.error(`Error processing ${player.name}:`, error);
		}
	}

	return playersWithClubs;
}

/**
 * Función para validar que un jugador tenga los datos necesarios
 */
export function validatePlayer(
	player: unknown
): player is ProcessedPlayer & { clubs: string[] } {
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

	// Verificar nombre completo
	if (normalizedGuess === normalizedFullName) {
		return true;
	}

	// Verificar apellido solo si es único
	if (surnameIsUnique && normalizedGuess === normalizedSurname) {
		return true;
	}

	// Verificar si la respuesta contiene las palabras clave del nombre
	const guessWords = normalizedGuess
		.split(" ")
		.filter((word) => word.length > 0);
	const nameWords = normalizedFullName
		.split(" ")
		.filter((word) => word.length > 0);

	// Si ingresó solo el apellido pero no es único, no es válido
	if (guessWords.length === 1 && !surnameIsUnique) {
		return false;
	}

	// Verificar si todas las palabras de la respuesta están en el nombre
	return guessWords.every((word) =>
		nameWords.some(
			(nameWord) => nameWord.includes(word) || word.includes(nameWord)
		)
	);
}
