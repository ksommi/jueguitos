export interface Country {
	name: string;
	lat: number;
	lng: number;
	code: string;
}

export const COUNTRIES: Country[] = [
	// América del Sur
	{ name: "Argentina", lat: -34.6118, lng: -58.396, code: "AR" },
	{ name: "Brasil", lat: -15.7942, lng: -47.8822, code: "BR" },
	{ name: "Chile", lat: -33.4489, lng: -70.6693, code: "CL" },
	{ name: "Colombia", lat: 4.711, lng: -74.0721, code: "CO" },
	{ name: "Perú", lat: -12.0464, lng: -77.0428, code: "PE" },
	{ name: "Uruguay", lat: -34.9011, lng: -56.1645, code: "UY" },
	{ name: "Paraguay", lat: -25.2637, lng: -57.5759, code: "PY" },
	{ name: "Bolivia", lat: -16.2902, lng: -63.5887, code: "BO" },
	{ name: "Venezuela", lat: 10.4806, lng: -66.9036, code: "VE" },
	{ name: "Ecuador", lat: -0.1807, lng: -78.4678, code: "EC" },
	{ name: "Guyana", lat: 6.8013, lng: -58.1551, code: "GY" },
	{ name: "Surinam", lat: 5.8664, lng: -55.1668, code: "SR" },
	{ name: "Guayana Francesa", lat: 3.9339, lng: -53.1258, code: "GF" },

	// América del Norte
	{ name: "Estados Unidos", lat: 38.9072, lng: -77.0369, code: "US" },
	{ name: "Canadá", lat: 45.4215, lng: -75.6972, code: "CA" },
	{ name: "México", lat: 19.4326, lng: -99.1332, code: "MX" },
	{ name: "Groenlandia", lat: 71.7069, lng: -42.6043, code: "GL" },

	// América Central y Caribe
	{ name: "Guatemala", lat: 14.6349, lng: -90.5069, code: "GT" },
	{ name: "Belice", lat: 17.1899, lng: -88.4976, code: "BZ" },
	{ name: "Honduras", lat: 14.0723, lng: -87.1921, code: "HN" },
	{ name: "El Salvador", lat: 13.6929, lng: -89.2182, code: "SV" },
	{ name: "Nicaragua", lat: 12.1364, lng: -86.2514, code: "NI" },
	{ name: "Costa Rica", lat: 9.9281, lng: -84.0907, code: "CR" },
	{ name: "Panamá", lat: 8.9824, lng: -79.5199, code: "PA" },
	{ name: "Cuba", lat: 23.1136, lng: -82.3666, code: "CU" },
	{ name: "Jamaica", lat: 17.9712, lng: -76.7936, code: "JM" },
	{ name: "Haití", lat: 18.5392, lng: -72.335, code: "HT" },
	{ name: "República Dominicana", lat: 18.4861, lng: -69.9312, code: "DO" },
	{ name: "Puerto Rico", lat: 18.2208, lng: -66.5901, code: "PR" },
	{ name: "Trinidad y Tobago", lat: 10.6918, lng: -61.2225, code: "TT" },
	{ name: "Barbados", lat: 13.1939, lng: -59.5432, code: "BB" },
	{ name: "Bahamas", lat: 25.0343, lng: -77.3963, code: "BS" },

	// Europa Occidental
	{ name: "España", lat: 40.4168, lng: -3.7038, code: "ES" },
	{ name: "Francia", lat: 48.8566, lng: 2.3522, code: "FR" },
	{ name: "Italia", lat: 41.9028, lng: 12.4964, code: "IT" },
	{ name: "Alemania", lat: 52.52, lng: 13.405, code: "DE" },
	{ name: "Reino Unido", lat: 51.5074, lng: -0.1278, code: "GB" },
	{ name: "Portugal", lat: 38.7223, lng: -9.1393, code: "PT" },
	{ name: "Holanda", lat: 52.3676, lng: 4.9041, code: "NL" },
	{ name: "Bélgica", lat: 50.8503, lng: 4.3517, code: "BE" },
	{ name: "Suiza", lat: 46.948, lng: 7.4474, code: "CH" },
	{ name: "Austria", lat: 48.2082, lng: 16.3738, code: "AT" },
	{ name: "Irlanda", lat: 53.4084, lng: -8.2439, code: "IE" },
	{ name: "Luxemburgo", lat: 49.8153, lng: 6.1296, code: "LU" },
	{ name: "Mónaco", lat: 43.7384, lng: 7.4246, code: "MC" },
	{ name: "Andorra", lat: 42.5462, lng: 1.6016, code: "AD" },
	{ name: "San Marino", lat: 43.9424, lng: 12.4578, code: "SM" },
	{ name: "Vaticano", lat: 41.9029, lng: 12.4534, code: "VA" },
	{ name: "Malta", lat: 35.9375, lng: 14.3754, code: "MT" },
	{ name: "Chipre", lat: 35.1264, lng: 33.4299, code: "CY" },
	{ name: "Islandia", lat: 64.1466, lng: -21.9426, code: "IS" },

	// Europa Nórdica
	{ name: "Suecia", lat: 59.3293, lng: 18.0686, code: "SE" },
	{ name: "Noruega", lat: 59.9139, lng: 10.7522, code: "NO" },
	{ name: "Dinamarca", lat: 55.6761, lng: 12.5683, code: "DK" },
	{ name: "Finlandia", lat: 60.1695, lng: 24.9354, code: "FI" },

	// Europa Oriental
	{ name: "Polonia", lat: 52.2297, lng: 21.0122, code: "PL" },
	{ name: "República Checa", lat: 50.0755, lng: 14.4378, code: "CZ" },
	{ name: "Eslovaquia", lat: 48.669, lng: 19.699, code: "SK" },
	{ name: "Hungría", lat: 47.4979, lng: 19.0402, code: "HU" },
	{ name: "Rumania", lat: 44.4268, lng: 26.1025, code: "RO" },
	{ name: "Bulgaria", lat: 42.6977, lng: 23.3219, code: "BG" },
	{ name: "Croacia", lat: 45.1, lng: 15.2, code: "HR" },
	{ name: "Serbia", lat: 44.0165, lng: 21.0059, code: "RS" },
	{ name: "Bosnia y Herzegovina", lat: 43.9159, lng: 17.6791, code: "BA" },
	{ name: "Montenegro", lat: 42.7087, lng: 19.3744, code: "ME" },
	{ name: "Macedonia del Norte", lat: 41.9973, lng: 21.428, code: "MK" },
	{ name: "Albania", lat: 41.1533, lng: 19.8172, code: "AL" },
	{ name: "Eslovenia", lat: 46.1512, lng: 14.9955, code: "SI" },
	{ name: "Estonia", lat: 59.437, lng: 24.7536, code: "EE" },
	{ name: "Letonia", lat: 56.8796, lng: 24.6032, code: "LV" },
	{ name: "Lituania", lat: 54.9027, lng: 23.9097, code: "LT" },
	{ name: "Bielorrusia", lat: 53.7098, lng: 27.9534, code: "BY" },
	{ name: "Ucrania", lat: 50.4501, lng: 30.5234, code: "UA" },
	{ name: "Moldavia", lat: 47.4116, lng: 28.3699, code: "MD" },

	// Europa Balcánica y Mediterránea
	{ name: "Grecia", lat: 37.9838, lng: 23.7275, code: "GR" },
	{ name: "Turquía", lat: 39.9334, lng: 32.8597, code: "TR" },

	// Asia
	{ name: "Rusia", lat: 55.7558, lng: 37.6176, code: "RU" },
	{ name: "China", lat: 39.9042, lng: 116.4074, code: "CN" },
	{ name: "Japón", lat: 35.6762, lng: 139.6503, code: "JP" },
	{ name: "Corea del Sur", lat: 37.5665, lng: 126.978, code: "KR" },
	{ name: "Corea del Norte", lat: 39.0392, lng: 125.7625, code: "KP" },
	{ name: "India", lat: 28.6139, lng: 77.209, code: "IN" },
	{ name: "Pakistán", lat: 33.6844, lng: 73.0479, code: "PK" },
	{ name: "Bangladesh", lat: 23.685, lng: 90.3563, code: "BD" },
	{ name: "Sri Lanka", lat: 6.9271, lng: 79.8612, code: "LK" },
	{ name: "Nepal", lat: 27.7172, lng: 85.324, code: "NP" },
	{ name: "Bután", lat: 27.5142, lng: 90.4336, code: "BT" },
	{ name: "Maldivas", lat: 3.2028, lng: 73.2207, code: "MV" },
	{ name: "Afganistán", lat: 34.5553, lng: 69.2075, code: "AF" },
	{ name: "Irán", lat: 35.6892, lng: 51.389, code: "IR" },
	{ name: "Irak", lat: 33.2232, lng: 43.6793, code: "IQ" },
	{ name: "Siria", lat: 33.5138, lng: 36.2765, code: "SY" },
	{ name: "Líbano", lat: 33.8547, lng: 35.8623, code: "LB" },
	{ name: "Jordania", lat: 31.9454, lng: 35.9284, code: "JO" },
	{ name: "Israel", lat: 31.0461, lng: 34.8516, code: "IL" },
	{ name: "Palestina", lat: 31.9522, lng: 35.2332, code: "PS" },
	{ name: "Arabia Saudí", lat: 24.7136, lng: 46.6753, code: "SA" },
	{ name: "Emiratos Árabes Unidos", lat: 24.2992, lng: 54.697, code: "AE" },
	{ name: "Qatar", lat: 25.3548, lng: 51.1839, code: "QA" },
	{ name: "Kuwait", lat: 29.3117, lng: 47.4818, code: "KW" },
	{ name: "Bahréin", lat: 26.0667, lng: 50.5577, code: "BH" },
	{ name: "Omán", lat: 23.5859, lng: 58.4059, code: "OM" },
	{ name: "Yemen", lat: 15.5527, lng: 48.5164, code: "YE" },
	{ name: "Georgia", lat: 41.7151, lng: 44.8271, code: "GE" },
	{ name: "Armenia", lat: 40.0691, lng: 45.0382, code: "AM" },
	{ name: "Azerbaiyán", lat: 40.1431, lng: 47.5769, code: "AZ" },
	{ name: "Kazajistán", lat: 51.1694, lng: 71.4491, code: "KZ" },
	{ name: "Uzbekistán", lat: 41.3775, lng: 64.5853, code: "UZ" },
	{ name: "Turkmenistán", lat: 37.9601, lng: 58.3261, code: "TM" },
	{ name: "Tayikistán", lat: 38.861, lng: 71.2761, code: "TJ" },
	{ name: "Kirguistán", lat: 42.7335, lng: 74.5664, code: "KG" },
	{ name: "Mongolia", lat: 47.8864, lng: 106.9057, code: "MN" },
	{ name: "Tailandia", lat: 13.7563, lng: 100.5018, code: "TH" },
	{ name: "Vietnam", lat: 21.0285, lng: 105.8542, code: "VN" },
	{ name: "Laos", lat: 19.8563, lng: 102.4955, code: "LA" },
	{ name: "Camboya", lat: 11.5449, lng: 104.8922, code: "KH" },
	{ name: "Myanmar", lat: 19.7633, lng: 96.0785, code: "MM" },
	{ name: "Filipinas", lat: 14.5995, lng: 120.9842, code: "PH" },
	{ name: "Indonesia", lat: -6.2088, lng: 106.8456, code: "ID" },
	{ name: "Malasia", lat: 3.139, lng: 101.6869, code: "MY" },
	{ name: "Singapur", lat: 1.3521, lng: 103.8198, code: "SG" },
	{ name: "Brunéi", lat: 4.5353, lng: 114.7277, code: "BN" },
	{ name: "Timor Oriental", lat: -8.8742, lng: 125.7275, code: "TL" },

	// África
	{ name: "Sudáfrica", lat: -25.7461, lng: 28.1881, code: "ZA" },
	{ name: "Egipto", lat: 30.0444, lng: 31.2357, code: "EG" },
	{ name: "Marruecos", lat: 34.0209, lng: -6.8416, code: "MA" },
	{ name: "Nigeria", lat: 9.0765, lng: 7.3986, code: "NG" },
	{ name: "Kenia", lat: -1.2921, lng: 36.8219, code: "KE" },
	{ name: "Etiopía", lat: 9.145, lng: 40.4897, code: "ET" },
	{ name: "Ghana", lat: 5.6037, lng: -0.187, code: "GH" },
	{ name: "Tanzania", lat: -6.369, lng: 34.8888, code: "TZ" },
	{ name: "Uganda", lat: 0.3476, lng: 32.5825, code: "UG" },
	{ name: "Mozambique", lat: -18.6657, lng: 35.5296, code: "MZ" },
	{ name: "Madagascar", lat: -18.7669, lng: 46.8691, code: "MG" },
	{ name: "Camerún", lat: 7.3697, lng: 12.3547, code: "CM" },
	{ name: "Angola", lat: -11.2027, lng: 17.8739, code: "AO" },
	{ name: "Sudán", lat: 12.8628, lng: 30.2176, code: "SD" },
	{ name: "Argelia", lat: 28.0339, lng: 1.6596, code: "DZ" },
	{
		name: "República Democrática del Congo",
		lat: -4.4419,
		lng: 15.2663,
		code: "CD",
	},
	{ name: "Libia", lat: 26.3351, lng: 17.2283, code: "LY" },
	{ name: "Túnez", lat: 33.8869, lng: 9.5375, code: "TN" },
	{ name: "Zimbabue", lat: -17.8292, lng: 31.0522, code: "ZW" },
	{ name: "Zambia", lat: -13.1339, lng: 27.8493, code: "ZM" },
	{ name: "Senegal", lat: 14.4974, lng: -14.4524, code: "SN" },
	{ name: "Mali", lat: 17.5707, lng: -3.9962, code: "ML" },
	{ name: "Burkina Faso", lat: 12.2383, lng: -1.5616, code: "BF" },
	{ name: "Níger", lat: 17.6078, lng: 8.0817, code: "NE" },
	{ name: "Chad", lat: 15.4542, lng: 18.7322, code: "TD" },
	{ name: "Mauritania", lat: 21.0079, lng: -10.9408, code: "MR" },
	{ name: "Costa de Marfil", lat: 7.54, lng: -5.5471, code: "CI" },
	{ name: "Guinea", lat: 9.9456, lng: -9.6966, code: "GN" },
	{ name: "Benín", lat: 9.3077, lng: 2.3158, code: "BJ" },
	{ name: "Togo", lat: 8.6195, lng: 0.8248, code: "TG" },
	{ name: "Sierra Leona", lat: 8.4606, lng: -11.7799, code: "SL" },
	{ name: "Liberia", lat: 6.4281, lng: -9.4295, code: "LR" },
	{ name: "República Centroafricana", lat: 6.6111, lng: 20.9394, code: "CF" },
	{ name: "Gabón", lat: 0.4162, lng: 9.4673, code: "GA" },
	{ name: "Congo", lat: -0.228, lng: 15.8277, code: "CG" },
	{ name: "Guinea Ecuatorial", lat: 2.154, lng: 10.2676, code: "GQ" },
	{ name: "Ruanda", lat: -1.9403, lng: 29.8739, code: "RW" },
	{ name: "Burundi", lat: -3.3731, lng: 29.9189, code: "BI" },
	{ name: "Yibuti", lat: 11.8251, lng: 42.5903, code: "DJ" },
	{ name: "Somalia", lat: 5.1521, lng: 46.1996, code: "SO" },
	{ name: "Eritrea", lat: 15.7394, lng: 38.9637, code: "ER" },
	{ name: "Botsuana", lat: -22.3285, lng: 24.6849, code: "BW" },
	{ name: "Namibia", lat: -22.9576, lng: 18.4904, code: "NA" },
	{ name: "Lesoto", lat: -29.61, lng: 28.2336, code: "LS" },
	{ name: "Esuatini", lat: -26.5225, lng: 31.4659, code: "SZ" },
	{ name: "Malaui", lat: -13.2543, lng: 34.3015, code: "MW" },
	{ name: "Comoras", lat: -11.6455, lng: 43.3333, code: "KM" },
	{ name: "Mauricio", lat: -20.3484, lng: 57.5522, code: "MU" },
	{ name: "Seychelles", lat: -4.6796, lng: 55.492, code: "SC" },
	{ name: "Cabo Verde", lat: 16.5388, lng: -24.0132, code: "CV" },
	{ name: "Santo Tomé y Príncipe", lat: 0.1864, lng: 6.6131, code: "ST" },
	{ name: "Gambia", lat: 13.4432, lng: -15.3101, code: "GM" },
	{ name: "Guinea-Bisáu", lat: 11.8037, lng: -15.1804, code: "GW" },

	// Oceanía
	{ name: "Australia", lat: -35.2809, lng: 149.13, code: "AU" },
	{ name: "Nueva Zelanda", lat: -41.2924, lng: 174.7787, code: "NZ" },
	{ name: "Fiyi", lat: -16.5782, lng: 179.4144, code: "FJ" },
	{ name: "Papúa Nueva Guinea", lat: -6.314993, lng: 143.95555, code: "PG" },
	{ name: "Islas Salomón", lat: -9.64571, lng: 160.156194, code: "SB" },
	{ name: "Vanuatu", lat: -15.376706, lng: 166.959158, code: "VU" },
	{ name: "Nueva Caledonia", lat: -20.904305, lng: 165.618042, code: "NC" },
	{
		name: "Polinesia Francesa",
		lat: -17.679742,
		lng: -149.406843,
		code: "PF",
	},
	{ name: "Samoa", lat: -13.759029, lng: -172.104629, code: "WS" },
	{ name: "Tonga", lat: -21.178986, lng: -175.198242, code: "TO" },
	{ name: "Kiribati", lat: -3.370417, lng: -168.734039, code: "KI" },
	{ name: "Tuvalu", lat: -7.109535, lng: 177.64933, code: "TV" },
	{ name: "Nauru", lat: -0.522778, lng: 166.931503, code: "NR" },
	{ name: "Palau", lat: 7.51498, lng: 134.58252, code: "PW" },
	{ name: "Islas Marshall", lat: 7.131474, lng: 171.184478, code: "MH" },
	{
		name: "Estados Federados de Micronesia",
		lat: 7.425554,
		lng: 150.550812,
		code: "FM",
	},
];

// Configuración del juego
export const GAME_CONFIG = {
	MAX_ATTEMPTS: null, // Sin límite de intentos
	MIN_DISTANCE_FOR_WIN: 50, // km - si está a menos de 50km, cuenta como ganado
};

// Función para calcular la distancia entre dos puntos usando la fórmula Haversine
export function calculateDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6371; // Radio de la Tierra en kilómetros
	const dLat = deg2rad(lat2 - lat1);
	const dLng = deg2rad(lng2 - lng1);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) *
			Math.cos(deg2rad(lat2)) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c; // Distancia en kilómetros
	return Math.round(d);
}

function deg2rad(deg: number): number {
	return deg * (Math.PI / 180);
}

// Función para obtener el color basado en la distancia (estilo Worldle)
export function getColorByDistance(distance: number): string {
	// Escala de colores basada en distancias específicas:
	// 0-300km: Rojo muy intenso
	// 300-800km: Rojo
	// 800-1500km: Naranja
	// 1500km+: Amarillo progresivo
	if (distance < 300) return "#7f1d1d"; // Rojo muy intenso (0-300km)
	if (distance < 800) return "#dc2626"; // Rojo (300-800km)
	if (distance < 1500) return "#fb923c"; // Naranja (800-1500km)
	if (distance < 2500) return "#fbbf24"; // Amarillo-naranja (1500-2500km)
	if (distance < 4000) return "#fde047"; // Amarillo claro (2500-4000km)
	if (distance < 6000) return "#facc15"; // Amarillo (4000-6000km)
	return "#fefce8"; // Amarillo casi blanco (>6000km)
}

// Función para obtener un país aleatorio
export function getRandomCountry(): Country {
	return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
}

// Función para obtener el país del día (determinístico basado en la fecha)
export function getDailyCountry(): Country {
	// Obtener fecha en UTC - día juliano desde época Unix
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const utcDate = new Date(utcTime);

	// Calcular días desde el 1 de enero de 1970 (época Unix)
	const daysSinceEpoch = Math.floor(utcDate.getTime() / (1000 * 60 * 60 * 24));

	// Usar el día como semilla para un generador pseudoaleatorio simple
	// Esto asegura mejor distribución que solo módulo
	let seed = daysSinceEpoch;

	// Algoritmo de hash simple para mejorar distribución
	seed = ((seed * 1103515245 + 12345) & 0x7fffffff) % 2147483647;

	// Obtener índice con mejor distribución
	const index = Math.abs(seed) % COUNTRIES.length;

	return COUNTRIES[index];
}

// Función para obtener la fecha del próximo país (para mostrar countdown)
export function getNextCountryDate(): Date {
	// Usar UTC para que el cambio sea a medianoche UTC para todos
	const now = new Date();
	const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
	const tomorrow = new Date(utcNow);
	tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
	tomorrow.setUTCHours(0, 0, 0, 0); // Medianoche UTC del día siguiente

	// Convertir de vuelta a hora local para mostrar al usuario
	return new Date(tomorrow.getTime() - now.getTimezoneOffset() * 60000);
}

// Funciones para manejar el estado del juego diario
export interface GuessData {
	countryName: string;
	distance: number;
}

export interface DailyGameState {
	date: string;
	completed: boolean;
	attempts: number;
	won: boolean;
	guesses: GuessData[];
}

export function getTodayDateString(): string {
	// Usar UTC para consistencia global
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const utcDate = new Date(utcTime);

	// Formato argentino: d-m-Y
	return (
		String(utcDate.getDate()).padStart(2, "0") +
		"-" +
		String(utcDate.getMonth() + 1).padStart(2, "0") +
		"-" +
		utcDate.getFullYear()
	);
}

export function getDailyGameState(): DailyGameState {
	// Verificar si estamos en el navegador
	if (typeof window === "undefined") {
		return {
			date: getTodayDateString(),
			completed: false,
			attempts: 0,
			won: false,
			guesses: [],
		};
	}

	const todayString = getTodayDateString();

	try {
		const stored = localStorage.getItem("dailyGameState");

		if (stored) {
			const state = JSON.parse(stored);
			// Si es del mismo día, devolver el estado guardado
			if (state.date === todayString) {
				// Migrar datos antiguos si es necesario
				if (
					state.guesses &&
					state.guesses.length > 0 &&
					typeof state.guesses[0] === "string"
				) {
					// Formato antiguo: array de strings
					// Convertir a nuevo formato pero perdemos las distancias (se recalcularán)
					state.guesses = state.guesses.map((countryName: string) => ({
						countryName,
						distance: 0, // Se recalculará en el componente
					}));
				}
				return state;
			}
		}

		// Si no hay estado o es de otro día, crear nuevo estado
		const newState: DailyGameState = {
			date: todayString,
			completed: false,
			attempts: 0,
			won: false,
			guesses: [],
		};

		localStorage.setItem("dailyGameState", JSON.stringify(newState));
		return newState;
	} catch (error) {
		console.error("Error al acceder al localStorage:", error);
		// Devolver estado por defecto si hay error
		return {
			date: todayString,
			completed: false,
			attempts: 0,
			won: false,
			guesses: [],
		};
	}
}

export function saveDailyGameState(state: DailyGameState): void {
	// Verificar si estamos en el navegador
	if (typeof window === "undefined") {
		console.warn(
			"Intentando guardar estado del juego en servidor, ignorando."
		);
		return;
	}

	try {
		const stateToSave = {
			...state,
			date: getTodayDateString(), // Asegurar que siempre tenga la fecha correcta
		};

		localStorage.setItem("dailyGameState", JSON.stringify(stateToSave));
	} catch (error) {
		console.error("Error al guardar estado del juego:", error);
		// Intentar limpiar localStorage si está lleno
		if (error instanceof Error && error.name === "QuotaExceededError") {
			try {
				localStorage.removeItem("dailyGameState");
				localStorage.setItem("dailyGameState", JSON.stringify(state));
			} catch (secondError) {
				console.error("Error crítico al guardar estado:", secondError);
			}
		}
	}
}

export function hasPlayedToday(): boolean {
	const state = getDailyGameState();
	return state.completed;
}

// Función de debug para verificar el país del día y la fecha
export function debugDailyCountry(): {
	country: Country;
	date: string;
	index: number;
	daysSinceEpoch: number;
	seed: number;
} {
	const dateString = getTodayDateString();
	const country = getDailyCountry();
	const index = COUNTRIES.findIndex((c) => c.name === country.name);

	// Calcular días desde época para debug
	const now = new Date();
	const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
	const daysSinceEpoch = Math.floor(utcTime / (1000 * 60 * 60 * 24));

	// Calcular la semilla usada
	let seed = daysSinceEpoch;
	seed = ((seed * 1103515245 + 12345) & 0x7fffffff) % 2147483647;

	return {
		country,
		date: dateString,
		index,
		daysSinceEpoch,
		seed,
	};
}

// Función de debug para verificar el estado del localStorage
export function debugLocalStorage(): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		const dailyState = localStorage.getItem("dailyGameState");

		if (dailyState) {
			JSON.parse(dailyState);
		}

		const gameStats = localStorage.getItem("gameStats");

		if (gameStats) {
			JSON.parse(gameStats);
		}
	} catch (error) {
		console.error("Error en debug de localStorage:", error);
	}
}

// Función para limpiar localStorage en caso de corrupción
export function clearGameData(): void {
	if (typeof window === "undefined") {
		console.warn("Intentando limpiar datos en servidor, ignorando.");
		return;
	}

	try {
		localStorage.removeItem("dailyGameState");
		localStorage.removeItem("gameStats");
	} catch (error) {
		console.error("Error al limpiar datos del juego:", error);
	}
}

// Función para normalizar texto removiendo tildes y caracteres especiales
function normalizeText(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFD") // Descompone caracteres con tildes
		.replace(/[\u0300-\u036f]/g, "") // Remueve las marcas diacríticas (tildes)
		.replace(/ñ/g, "n") // Reemplaza ñ por n
		.replace(/ç/g, "c") // Reemplaza ç por c
		.trim();
}

// Función para buscar países por nombre (autocompletado)
export function searchCountries(query: string): Country[] {
	const normalizedQuery = normalizeText(query);

	return COUNTRIES.filter((country) => {
		const normalizedCountryName = normalizeText(country.name);
		return normalizedCountryName.includes(normalizedQuery);
	}).slice(0, 10); // Limitar a 10 resultados
}

// Interfaces para estadísticas
export interface GameStats {
	gamesPlayed: number;
	gamesWon: number;
	currentStreak: number;
	maxStreak: number;
	winPercentage: number;
	averageGuesses: number;
	lastPlayDate: string;
}

// Funciones para manejar estadísticas
export function getGameStats(): GameStats {
	if (typeof window === "undefined") {
		return {
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			winPercentage: 0,
			averageGuesses: 0,
			lastPlayDate: "",
		};
	}

	try {
		const stored = localStorage.getItem("gameStats");
		if (stored) {
			const stats = JSON.parse(stored);
			// Validar que el objeto tiene todas las propiedades necesarias
			return {
				gamesPlayed: stats.gamesPlayed || 0,
				gamesWon: stats.gamesWon || 0,
				currentStreak: stats.currentStreak || 0,
				maxStreak: stats.maxStreak || 0,
				winPercentage: stats.winPercentage || 0,
				averageGuesses: stats.averageGuesses || 0,
				lastPlayDate: stats.lastPlayDate || "",
			};
		}

		const defaultStats: GameStats = {
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			winPercentage: 0,
			averageGuesses: 0,
			lastPlayDate: "",
		};

		localStorage.setItem("gameStats", JSON.stringify(defaultStats));
		return defaultStats;
	} catch (error) {
		console.error("Error al obtener estadísticas:", error);
		return {
			gamesPlayed: 0,
			gamesWon: 0,
			currentStreak: 0,
			maxStreak: 0,
			winPercentage: 0,
			averageGuesses: 0,
			lastPlayDate: "",
		};
	}
}

export function updateGameStats(won: boolean, attempts: number): GameStats {
	if (typeof window === "undefined") {
		console.warn(
			"Intentando actualizar estadísticas en servidor, ignorando."
		);
		return getGameStats();
	}

	try {
		const stats = getGameStats();
		const today = getTodayDateString();

		stats.gamesPlayed++;
		stats.lastPlayDate = today;

		if (won) {
			stats.gamesWon++;
			stats.currentStreak++;
			stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
		} else {
			stats.currentStreak = 0;
		}

		stats.winPercentage = Math.round(
			(stats.gamesWon / stats.gamesPlayed) * 100
		);
		stats.averageGuesses = Math.round(
			(stats.averageGuesses * (stats.gamesPlayed - 1) + attempts) /
				stats.gamesPlayed
		);

		localStorage.setItem("gameStats", JSON.stringify(stats));
		return stats;
	} catch (error) {
		console.error("Error al actualizar estadísticas:", error);
		return getGameStats();
	}
}

// Función para generar el resultado en emojis para compartir
export function generateShareText(
	guesses: GuessData[],
	won: boolean,
	attempts: number
): string {
	const today = getTodayDateString();

	let result = `🌍 Guiate ${today}\n`;
	result += won ? `✅ ${attempts} intentos` : `❌ ${attempts} intentos`;
	result += "\n\n";

	// Generar emojis basados en distancias
	guesses.forEach((guess, index) => {
		// Si ganó y es el último intento, siempre verde
		if (won && index === guesses.length - 1) {
			result += "🟩";
		} else {
			const emoji = getDistanceEmoji(guess.distance);
			result += emoji;
		}
	});

	result += "\n\n🎮 ¡Jugá en: https://jueguitos-psi.vercel.app/guiate";
	return result;
}

function getDistanceEmoji(distance: number): string {
	if (distance < 800) return "🟥";
	if (distance < 1500) return "🟧";
	if (distance < 4000) return "🟨";
	return "⬜";
}
