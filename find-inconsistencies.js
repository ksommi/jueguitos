// Script para encontrar TODAS las inconsistencias entre GeoJSON y mapeo
const fs = require("fs");

async function findAllInconsistencies() {
	try {
		console.log("🔍 Analizando inconsistencias entre GeoJSON y mapeo...");

		// Cargar el archivo GeoJSON
		const geoData = JSON.parse(
			fs.readFileSync("./public/world.geojson", "utf8")
		);

		// Obtener todos los nombres de países del GeoJSON
		const geojsonCountries = geoData.features
			.filter((feature) => feature.properties && feature.properties.name)
			.map((feature) => feature.properties.name)
			.sort();

		console.log(`📊 Países en GeoJSON: ${geojsonCountries.length}`);

		// Mapeo actual (copiado del archivo)
		const countryNameMap = {
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
			eSwatini: "Esuatini", // Ya agregado
			"Ivory Coast": "Costa de Marfil", // Ya agregado
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

		console.log(`📊 Países en mapeo: ${Object.keys(countryNameMap).length}`);

		// Encontrar países que están en GeoJSON pero NO en el mapeo
		const unmappedCountries = geojsonCountries.filter(
			(country) => !countryNameMap.hasOwnProperty(country)
		);

		// Encontrar países que están en el mapeo pero NO en GeoJSON
		const mappedCountries = Object.keys(countryNameMap);
		const missingInGeojson = mappedCountries.filter(
			(country) => !geojsonCountries.includes(country)
		);

		console.log(
			"\n❌ PAÍSES SIN MAPEAR (están en GeoJSON pero NO en mapeo):"
		);
		console.log(`Total: ${unmappedCountries.length}`);
		unmappedCountries.forEach((country) => {
			console.log(`  - "${country}"`);
		});

		console.log("\n⚠️  PAÍSES MAPEADOS PERO NO EN GEOJSON:");
		console.log(`Total: ${missingInGeojson.length}`);
		missingInGeojson.forEach((country) => {
			console.log(`  - "${country}" -> "${countryNameMap[country]}"`);
		});

		// Generar el mapeo automático para países sin mapear
		console.log("\n🔧 MAPEO SUGERIDO PARA AGREGAR:");
		console.log("Agregar esto al countryNameMap:");
		unmappedCountries.forEach((country) => {
			console.log(`  "${country}": "${country}",`);
		});

		console.log("\n📈 RESUMEN:");
		console.log(`  - Países en GeoJSON: ${geojsonCountries.length}`);
		console.log(`  - Países mapeados: ${mappedCountries.length}`);
		console.log(`  - Sin mapear: ${unmappedCountries.length}`);
		console.log(`  - Mapeados pero ausentes: ${missingInGeojson.length}`);
	} catch (error) {
		console.error("❌ Error:", error.message);
	}
}

findAllInconsistencies();
