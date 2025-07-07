import { Feature, Polygon, MultiPolygon } from "geojson";

export interface CountryData {
	id: string;
	name: string;
	nameEs: string;
	geometry: Polygon | MultiPolygon;
	centroid?: { lat: number; lng: number }; // Agregar centroide calculado
}

// Mapeo de nombres en español a códigos ISO de 2 letras para consistencia
const countryCodeMap: Record<string, string> = {
	Afganistán: "AF",
	Albania: "AL",
	Argelia: "DZ",
	Angola: "AO",
	Antártida: "AQ",
	Argentina: "AR",
	Armenia: "AM",
	Australia: "AU",
	Austria: "AT",
	Azerbaiyán: "AZ",
	Bahamas: "BS",
	Bangladés: "BD",
	Bielorrusia: "BY",
	Bélgica: "BE",
	Belice: "BZ",
	Benín: "BJ",
	Bután: "BT",
	Bolivia: "BO",
	"Bosnia y Herzegovina": "BA",
	Botsuana: "BW",
	Brasil: "BR",
	Brunéi: "BN",
	Bulgaria: "BG",
	"Burkina Faso": "BF",
	Burundi: "BI",
	Camboya: "KH",
	Camerún: "CM",
	Canadá: "CA",
	"República Centroafricana": "CF",
	Chad: "TD",
	Chile: "CL",
	China: "CN",
	Colombia: "CO",
	Comoras: "KM",
	"República Democrática del Congo": "CD",
	"República del Congo": "CG",
	"Costa Rica": "CR",
	Croacia: "HR",
	Cuba: "CU",
	Chipre: "CY",
	"República Checa": "CZ",
	"Costa de Marfil": "CI",
	Dinamarca: "DK",
	Yibuti: "DJ",
	Dominica: "DM",
	"República Dominicana": "DO",
	"Timor Oriental": "TL",
	Ecuador: "EC",
	Egipto: "EG",
	"El Salvador": "SV",
	"Guinea Ecuatorial": "GQ",
	Eritrea: "ER",
	Estonia: "EE",
	Etiopía: "ET",
	Fiyi: "FJ",
	Finlandia: "FI",
	Francia: "FR",
	"Tierras Australes y Antárticas Francesas": "TF",
	Gabón: "GA",
	Gambia: "GM",
	Georgia: "GE",
	Alemania: "DE",
	Ghana: "GH",
	Grecia: "GR",
	Groenlandia: "GL",
	Granada: "GD",
	Guatemala: "GT",
	Guinea: "GN",
	"Guinea-Bisáu": "GW",
	Guyana: "GY",
	Haití: "HT",
	Honduras: "HN",
	Hungría: "HU",
	Islandia: "IS",
	India: "IN",
	Indonesia: "ID",
	Irán: "IR",
	Irak: "IQ",
	Irlanda: "IE",
	Israel: "IL",
	Italia: "IT",
	Jamaica: "JM",
	Japón: "JP",
	Jordania: "JO",
	Kazajistán: "KZ",
	Kenia: "KE",
	Kiribati: "KI",
	Kuwait: "KW",
	Kirguistán: "KG",
	Laos: "LA",
	Letonia: "LV",
	Líbano: "LB",
	Lesoto: "LS",
	Liberia: "LR",
	Libia: "LY",
	Liechtenstein: "LI",
	Lituania: "LT",
	Luxemburgo: "LU",
	"Macedonia del Norte": "MK",
	Madagascar: "MG",
	Malaui: "MW",
	Malasia: "MY",
	Maldivas: "MV",
	Malí: "ML",
	Malta: "MT",
	"Islas Marshall": "MH",
	Mauritania: "MR",
	Mauricio: "MU",
	México: "MX",
	Micronesia: "FM",
	Moldavia: "MD",
	Mónaco: "MC",
	Mongolia: "MN",
	Montenegro: "ME",
	Marruecos: "MA",
	Mozambique: "MZ",
	Birmania: "MM",
	Namibia: "NA",
	Nauru: "NR",
	Nepal: "NP",
	"Países Bajos": "NL",
	"Nueva Zelanda": "NZ",
	Nicaragua: "NI",
	Níger: "NE",
	Nigeria: "NG",
	"Corea del Norte": "KP",
	Noruega: "NO",
	Omán: "OM",
	Pakistán: "PK",
	Palaos: "PW",
	Palestina: "PS",
	Panamá: "PA",
	"Papúa Nueva Guinea": "PG",
	Paraguay: "PY",
	Perú: "PE",
	Filipinas: "PH",
	Polonia: "PL",
	Portugal: "PT",
	Catar: "QA",
	Rumania: "RO",
	Rusia: "RU",
	Ruanda: "RW",
	"San Cristóbal y Nieves": "KN",
	"Santa Lucía": "LC",
	"San Vicente y las Granadinas": "VC",
	Samoa: "WS",
	"San Marino": "SM",
	"Santo Tomé y Príncipe": "ST",
	"Arabia Saudí": "SA",
	Senegal: "SN",
	Serbia: "RS",
	Seychelles: "SC",
	"Sierra Leona": "SL",
	Singapur: "SG",
	Eslovaquia: "SK",
	Eslovenia: "SI",
	"Islas Salomón": "SB",
	Somalia: "SO",
	Sudáfrica: "ZA",
	"Corea del Sur": "KR",
	"Sudán del Sur": "SS",
	España: "ES",
	"Sri Lanka": "LK",
	Sudán: "SD",
	Surinam: "SR",
	Esuatini: "SZ",
	Suecia: "SE",
	Suiza: "CH",
	Siria: "SY",
	Taiwán: "TW",
	Tayikistán: "TJ",
	Tanzania: "TZ",
	Tailandia: "TH",
	Togo: "TG",
	Tonga: "TO",
	"Trinidad y Tobago": "TT",
	Túnez: "TN",
	Turquía: "TR",
	Turkmenistán: "TM",
	Tuvalu: "TV",
	Uganda: "UG",
	Ucrania: "UA",
	"Emiratos Árabes Unidos": "AE",
	"Reino Unido": "GB",
	"Estados Unidos": "US",
	Uruguay: "UY",
	Uzbekistán: "UZ",
	Vanuatu: "VU",
	"Ciudad del Vaticano": "VA",
	Venezuela: "VE",
	Vietnam: "VN",
	Yemen: "YE",
	Zambia: "ZM",
	Zimbabue: "ZW",
};

// Mapeo de nombres en inglés a español
const countryNameMap: Record<string, string> = {
	Afghanistan: "Afganistán",
	Albania: "Albania",
	Algeria: "Argelia",
	Angola: "Angola",
	Antarctica: "Antártida",
	Argentina: "Argentina",
	Armenia: "Armenia",
	Australia: "Australia",
	Austria: "Austria",
	Azerbaijan: "Azerbaiyán",
	"The Bahamas": "Bahamas",
	Bangladesh: "Bangladés",
	Belarus: "Bielorrusia",
	Belgium: "Bélgica",
	Belize: "Belice",
	Benin: "Benín",
	Bhutan: "Bután",
	Bolivia: "Bolivia",
	"Bosnia and Herzegovina": "Bosnia y Herzegovina",
	Botswana: "Botsuana",
	Brazil: "Brasil",
	Brunei: "Brunéi",
	Bulgaria: "Bulgaria",
	"Burkina Faso": "Burkina Faso",
	Burundi: "Burundi",
	Cambodia: "Camboya",
	Cameroon: "Camerún",
	Canada: "Canadá",
	"Central African Republic": "República Centroafricana",
	Chad: "Chad",
	Chile: "Chile",
	China: "China",
	Colombia: "Colombia",
	Comoros: "Comoras",
	"Democratic Republic of the Congo": "República Democrática del Congo",
	"Republic of the Congo": "República del Congo",
	"Costa Rica": "Costa Rica",
	Croatia: "Croacia",
	Cuba: "Cuba",
	Cyprus: "Chipre",
	"Czech Republic": "República Checa",
	"Côte d'Ivoire": "Costa de Marfil",
	Denmark: "Dinamarca",
	Djibouti: "Yibuti",
	Dominica: "Dominica",
	"Dominican Republic": "República Dominicana",
	"East Timor": "Timor Oriental",
	Ecuador: "Ecuador",
	Egypt: "Egipto",
	"El Salvador": "El Salvador",
	"Equatorial Guinea": "Guinea Ecuatorial",
	Eritrea: "Eritrea",
	Estonia: "Estonia",
	Ethiopia: "Etiopía",
	Fiji: "Fiyi",
	Finland: "Finlandia",
	France: "Francia",
	"French Southern and Antarctic Lands":
		"Tierras Australes y Antárticas Francesas",
	Gabon: "Gabón",
	"The Gambia": "Gambia",
	Georgia: "Georgia",
	Germany: "Alemania",
	Ghana: "Ghana",
	Greece: "Grecia",
	Greenland: "Groenlandia",
	Grenada: "Granada",
	Guatemala: "Guatemala",
	Guinea: "Guinea",
	"Guinea-Bissau": "Guinea-Bisáu",
	Guyana: "Guyana",
	Haiti: "Haití",
	Honduras: "Honduras",
	Hungary: "Hungría",
	Iceland: "Islandia",
	India: "India",
	Indonesia: "Indonesia",
	Iran: "Irán",
	Iraq: "Irak",
	Ireland: "Irlanda",
	Israel: "Israel",
	Italy: "Italia",
	Jamaica: "Jamaica",
	Japan: "Japón",
	Jordan: "Jordania",
	Kazakhstan: "Kazajistán",
	Kenya: "Kenia",
	Kiribati: "Kiribati",
	Kuwait: "Kuwait",
	Kyrgyzstan: "Kirguistán",
	Laos: "Laos",
	Latvia: "Letonia",
	Lebanon: "Líbano",
	Lesotho: "Lesoto",
	Liberia: "Liberia",
	Libya: "Libia",
	Liechtenstein: "Liechtenstein",
	Lithuania: "Lituania",
	Luxembourg: "Luxemburgo",
	Macedonia: "Macedonia del Norte",
	Madagascar: "Madagascar",
	Malawi: "Malaui",
	Malaysia: "Malasia",
	Maldives: "Maldivas",
	Mali: "Malí",
	Malta: "Malta",
	"Marshall Islands": "Islas Marshall",
	Mauritania: "Mauritania",
	Mauritius: "Mauricio",
	Mexico: "México",
	Micronesia: "Micronesia",
	Moldova: "Moldavia",
	Monaco: "Mónaco",
	Mongolia: "Mongolia",
	Montenegro: "Montenegro",
	Morocco: "Marruecos",
	Mozambique: "Mozambique",
	Myanmar: "Birmania",
	Namibia: "Namibia",
	Nauru: "Nauru",
	Nepal: "Nepal",
	Netherlands: "Países Bajos",
	"New Zealand": "Nueva Zelanda",
	Nicaragua: "Nicaragua",
	Niger: "Níger",
	Nigeria: "Nigeria",
	"North Korea": "Corea del Norte",
	Norway: "Noruega",
	Oman: "Omán",
	Pakistan: "Pakistán",
	Palau: "Palaos",
	Palestine: "Palestina",
	Panama: "Panamá",
	"Papua New Guinea": "Papúa Nueva Guinea",
	Paraguay: "Paraguay",
	Peru: "Perú",
	Philippines: "Filipinas",
	Poland: "Polonia",
	Portugal: "Portugal",
	Qatar: "Catar",
	Romania: "Rumania",
	Russia: "Rusia",
	Rwanda: "Ruanda",
	"Saint Kitts and Nevis": "San Cristóbal y Nieves",
	"Saint Lucia": "Santa Lucía",
	"Saint Vincent and the Grenadines": "San Vicente y las Granadinas",
	Samoa: "Samoa",
	"San Marino": "San Marino",
	"São Tomé and Príncipe": "Santo Tomé y Príncipe",
	"Saudi Arabia": "Arabia Saudí",
	Senegal: "Senegal",
	Serbia: "Serbia",
	Seychelles: "Seychelles",
	"Sierra Leone": "Sierra Leona",
	Singapore: "Singapur",
	Slovakia: "Eslovaquia",
	Slovenia: "Eslovenia",
	"Solomon Islands": "Islas Salomón",
	Somalia: "Somalia",
	"South Africa": "Sudáfrica",
	"South Korea": "Corea del Sur",
	"South Sudan": "Sudán del Sur",
	Spain: "España",
	"Sri Lanka": "Sri Lanka",
	Sudan: "Sudán",
	Suriname: "Surinam",
	Swaziland: "Esuatini",
	Sweden: "Suecia",
	Switzerland: "Suiza",
	Syria: "Siria",
	Taiwan: "Taiwán",
	Tajikistan: "Tayikistán",
	Tanzania: "Tanzania",
	Thailand: "Tailandia",
	Togo: "Togo",
	Tonga: "Tonga",
	"Trinidad and Tobago": "Trinidad y Tobago",
	Tunisia: "Túnez",
	Turkey: "Turquía",
	Turkmenistan: "Turkmenistán",
	Tuvalu: "Tuvalu",
	Uganda: "Uganda",
	Ukraine: "Ucrania",
	"United Arab Emirates": "Emiratos Árabes Unidos",
	"United Kingdom": "Reino Unido",
	"United States of America": "Estados Unidos",
	Uruguay: "Uruguay",
	Uzbekistan: "Uzbekistán",
	Vanuatu: "Vanuatu",
	"Vatican City": "Ciudad del Vaticano",
	Venezuela: "Venezuela",
	Vietnam: "Vietnam",
	Yemen: "Yemen",
	Zambia: "Zambia",
	Zimbabwe: "Zimbabue",
};

let countriesData: CountryData[] = [];

export async function loadCountriesData(): Promise<CountryData[]> {
	if (countriesData.length > 0) {
		return countriesData;
	}

	try {
		const response = await fetch("/world.geojson");
		if (!response.ok) {
			throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`);
		}

		const geoData = await response.json();

		if (!geoData.features) {
			throw new Error("Invalid GeoJSON format");
		}

		countriesData = geoData.features
			.filter(
				(feature: Feature) =>
					feature.properties &&
					feature.properties.name &&
					feature.geometry &&
					(feature.geometry.type === "Polygon" ||
						feature.geometry.type === "MultiPolygon")
			)
			.map((feature: Feature) => {
				const englishName = feature.properties!.name;
				const spanishName = countryNameMap[englishName] || englishName;
				const geometry = feature.geometry as Polygon | MultiPolygon;
				const centroid = calculateCentroid(geometry);

				return {
					id:
						(feature.id as string) ||
						englishName.toLowerCase().replace(/\s+/g, "_"),
					name: englishName,
					nameEs: spanishName,
					geometry,
					centroid,
				};
			});

		console.log(`Loaded ${countriesData.length} countries`);
		return countriesData;
	} catch (error) {
		console.error("Error loading countries data:", error);
		// Fallback con algunos países básicos en caso de error
		countriesData = [
			{
				id: "espana",
				name: "Spain",
				nameEs: "España",
				geometry: {
					type: "Polygon",
					coordinates: [
						[
							[-9.034818, 41.880571],
							[-6.189158, 43.54],
							[-1.901351, 43.422802],
							[3.039484, 42.415012],
							[2.985999, 41.58],
							[1.826793, 41.425448],
							[0.701591, 41.584],
							[0.338046, 40.169],
							[-0.3, 39.3],
							[-1.5, 37.8],
							[-2.169914, 36.668],
							[-5.392382, 36.021],
							[-5.377832, 35.946],
							[-7.251308, 37.097],
							[-9.034818, 41.880571],
						],
					],
				},
			},
		];
		return countriesData;
	}
}

export function getRandomCountry(): CountryData | null {
	if (countriesData.length === 0) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * countriesData.length);
	return countriesData[randomIndex];
}

export function findCountryByName(name: string): CountryData | null {
	const normalizedName = name.toLowerCase().trim();
	return (
		countriesData.find(
			(country) =>
				country.nameEs.toLowerCase() === normalizedName ||
				country.name.toLowerCase() === normalizedName ||
				country.id === normalizedName
		) || null
	);
}

export function getAllCountries(): CountryData[] {
	return [...countriesData];
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

// Función para calcular el centroide de una geometría
function calculateCentroid(geometry: Polygon | MultiPolygon): {
	lat: number;
	lng: number;
} {
	let totalLat = 0;
	let totalLng = 0;
	let pointCount = 0;

	if (geometry.type === "Polygon") {
		// Para polígonos, usar el anillo exterior (índice 0)
		const coordinates = geometry.coordinates[0];
		for (const [lng, lat] of coordinates) {
			totalLng += lng;
			totalLat += lat;
			pointCount++;
		}
	} else if (geometry.type === "MultiPolygon") {
		// Para multipolígonos, iterar sobre todos los polígonos
		for (const polygon of geometry.coordinates) {
			const coordinates = polygon[0]; // Anillo exterior de cada polígono
			for (const [lng, lat] of coordinates) {
				totalLng += lng;
				totalLat += lat;
				pointCount++;
			}
		}
	}

	if (pointCount === 0) {
		return { lat: 0, lng: 0 };
	}

	return {
		lat: totalLat / pointCount,
		lng: totalLng / pointCount,
	};
}

// Función para calcular la distancia entre dos puntos usando la fórmula Haversine
export function calculateDistanceGeo(
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

// Función compatible con la interfaz Country para búsqueda
export function searchCountriesGeo(
	query: string
): Array<{ name: string; lat: number; lng: number; code: string }> {
	if (!query || query.trim().length === 0) return [];

	const normalizedQuery = normalizeText(query);
	const results: Array<{
		name: string;
		lat: number;
		lng: number;
		code: string;
	}> = [];
	const seenNames = new Set<string>(); // Para evitar duplicados por nombre

	// Buscar en los países cargados
	for (const country of countriesData) {
		const normalizedSpanish = normalizeText(country.nameEs);
		const normalizedEnglish = normalizeText(country.name);

		if (
			(normalizedSpanish.includes(normalizedQuery) ||
				normalizedEnglish.includes(normalizedQuery)) &&
			!seenNames.has(normalizedSpanish) // Evitar duplicados
		) {
			// Usar centroide calculado automáticamente
			const coords = country.centroid || { lat: 0, lng: 0 };
			// Usar código ISO correcto desde el mapeo
			const code =
				countryCodeMap[country.nameEs] ||
				country.id.toUpperCase().slice(0, 2);

			seenNames.add(normalizedSpanish);
			results.push({
				name: country.nameEs,
				lat: coords.lat,
				lng: coords.lng,
				code: code,
			});
		}
	}

	return results.slice(0, 10); // Limitar a 10 resultados
}

// Función para calcular la distancia mínima entre dos geometrías (fronteras)
export function calculateMinimumDistanceGeometry(
	geometry1: Polygon | MultiPolygon,
	geometry2: Polygon | MultiPolygon
): number {
	let minDistance = Infinity;

	// Función para obtener todas las coordenadas de una geometría
	const getCoordinates = (
		geometry: Polygon | MultiPolygon
	): Array<[number, number]> => {
		const coords: Array<[number, number]> = [];

		if (geometry.type === "Polygon") {
			// Para polígonos, usar solo el anillo exterior
			for (const coord of geometry.coordinates[0]) {
				if (coord.length >= 2) {
					coords.push([coord[0], coord[1]]);
				}
			}
		} else if (geometry.type === "MultiPolygon") {
			// Para multipolígonos, usar todos los anillos exteriores
			for (const polygon of geometry.coordinates) {
				for (const coord of polygon[0]) {
					if (coord.length >= 2) {
						coords.push([coord[0], coord[1]]);
					}
				}
			}
		}

		return coords;
	};

	const coords1 = getCoordinates(geometry1);
	const coords2 = getCoordinates(geometry2);

	// Calcular la distancia mínima entre todas las combinaciones de puntos
	// Para optimizar, tomaremos una muestra de puntos en lugar de todos
	const sampleSize = Math.min(50, coords1.length, coords2.length);
	const step1 = Math.max(1, Math.floor(coords1.length / sampleSize));
	const step2 = Math.max(1, Math.floor(coords2.length / sampleSize));

	for (let i = 0; i < coords1.length; i += step1) {
		for (let j = 0; j < coords2.length; j += step2) {
			const [lng1, lat1] = coords1[i];
			const [lng2, lat2] = coords2[j];

			const distance = calculateDistanceGeo(lat1, lng1, lat2, lng2);
			minDistance = Math.min(minDistance, distance);

			// Si encontramos una distancia muy pequeña (países fronterizos), podemos parar
			if (distance < 1) {
				return Math.round(distance);
			}
		}
	}

	return Math.round(minDistance);
}

// Función mejorada para calcular distancia entre países
export function calculateCountryDistance(
	country1: CountryData,
	country2: CountryData
): number {
	// Primero calcular distancia entre fronteras
	const borderDistance = calculateMinimumDistanceGeometry(
		country1.geometry,
		country2.geometry
	);

	// Si la distancia entre fronteras es muy pequeña (< 50km), usar esa
	if (borderDistance < 50) {
		return borderDistance;
	}

	// Si no, usar distancia entre centroides como fallback
	const centroid1 = country1.centroid || { lat: 0, lng: 0 };
	const centroid2 = country2.centroid || { lat: 0, lng: 0 };

	const centroidDistance = calculateDistanceGeo(
		centroid1.lat,
		centroid1.lng,
		centroid2.lat,
		centroid2.lng
	);

	// Retornar la menor de las dos distancias
	return Math.min(borderDistance, centroidDistance);
}

// Función para encontrar un país por nombre (interfaz Country)
export function findCountryByNameGeo(name: string): CountryData | null {
	const normalizedName = normalizeText(name);
	return (
		countriesData.find(
			(country) =>
				normalizeText(country.nameEs) === normalizedName ||
				normalizeText(country.name) === normalizedName
		) || null
	);
}

// Función wrapper para mantener compatibilidad con la interfaz Country
export function calculateDistanceCountries(
	countryName1: string,
	countryName2: string
): number {
	const country1 = findCountryByNameGeo(countryName1);
	const country2 = findCountryByNameGeo(countryName2);

	if (!country1 || !country2) {
		// Fallback a cálculo por centroides si no encontramos los países
		const coords1 = country1?.centroid || { lat: 0, lng: 0 };
		const coords2 = country2?.centroid || { lat: 0, lng: 0 };
		return calculateDistanceGeo(
			coords1.lat,
			coords1.lng,
			coords2.lat,
			coords2.lng
		);
	}

	return calculateCountryDistance(country1, country2);
}
