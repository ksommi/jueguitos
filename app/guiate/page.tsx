"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
	getTodayCountry,
	saveGameResult,
	getUserGameResult,
	testSupabaseConnection,
	DailyCountry,
	User,
	getRanking,
	RankingEntry,
} from "@/lib/supabase";
import { Country, COUNTRIES, generateShareText } from "@/lib/countries";
import { calculateDistanceCountries } from "@/lib/geoData";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthProvider";

import CountryInput from "@/components/CountryInput";
import GuessList from "@/components/GuessList";

// Importar el mapa dinámicamente para evitar problemas de SSR
const GameMap = dynamic(() => import("@/components/GameMap"), {
	ssr: false,
	loading: () => (
		<div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
				<p className="text-gray-600 text-sm">Cargando mapa...</p>
			</div>
		</div>
	),
});

interface Guess {
	country: Country;
	distance: number;
}

export default function GuiateGamePage() {
	const { user, loading: userLoading } = useAuth();
	const [dailyCountry, setDailyCountry] = useState<DailyCountry | null>(null);
	const [targetCountry, setTargetCountry] = useState<Country | null>(null);
	const [guesses, setGuesses] = useState<Guess[]>([]);
	const [gameWon, setGameWon] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const [mapReady, setMapReady] = useState(false);
	const [highlightedCountry, setHighlightedCountry] = useState<Country | null>(
		null
	);
	const [zoomToCountry, setZoomToCountry] = useState<Country | null>(null);
	const [gameCompleted, setGameCompleted] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [ranking, setRanking] = useState<RankingEntry[]>([]);
	const [rankingLoading, setRankingLoading] = useState(true);

	// Inicializar el juego
	useEffect(() => {
		const initializeGame = async () => {
			try {
				setLoading(true);

				// Probar conexión primero
				const connectionOk = await testSupabaseConnection();
				if (!connectionOk) {
					console.error("Failed to connect to Supabase");
					return;
				}

				// Obtener país del día desde la base de datos
				const todayCountryData = await getTodayCountry();
				if (!todayCountryData) {
					console.error("No se pudo obtener el país del día");
					return;
				}

				setDailyCountry(todayCountryData);

				// Encontrar el país en la lista local
				const country = COUNTRIES.find(
					(c) =>
						c.name === todayCountryData.country_name ||
						c.code === todayCountryData.country_code
				);

				if (!country) {
					console.error(
						"País no encontrado en la lista local:",
						todayCountryData
					);
					return;
				}

				setTargetCountry(country);

				// Si hay usuario, cargar progreso
				if (user && !userLoading) {
					await loadUserProgress(user, todayCountryData.id, country);
				}
			} catch (error) {
				console.error("Error inicializando el juego:", error);
			} finally {
				setLoading(false);
			}
		};

		if (!userLoading) {
			initializeGame();
		}
	}, [user, userLoading]);

	// Cargar ranking
	useEffect(() => {
		const loadRanking = async () => {
			try {
				setRankingLoading(true);
				const data = await getRanking(10); // Top 10
				setRanking(data);
			} catch (error) {
				console.error("Error loading ranking:", error);
			} finally {
				setRankingLoading(false);
			}
		};

		loadRanking();
	}, []);

	const loadUserProgress = async (
		user: User,
		dailyCountryId: number,
		country: Country
	) => {
		try {
			const existingResult = await getUserGameResult(dailyCountryId);

			if (existingResult) {
				// El usuario ya jugó hoy, cargar progreso
				const savedGuesses =
					typeof existingResult.guesses === "string"
						? JSON.parse(existingResult.guesses)
						: existingResult.guesses || [];
				const loadedGuesses: Guess[] = savedGuesses
					.map((g: { country: string; distance: number }) => {
						const guessCountry = COUNTRIES.find(
							(c) => c.name === g.country
						);
						return guessCountry
							? {
									country: guessCountry,
									distance:
										g.distance ||
										calculateDistanceCountries(
											guessCountry.name,
											country.name
										),
							  }
							: null;
					})
					.filter(Boolean);

				setGuesses(loadedGuesses);
				setAttempts(existingResult.attempts);
				setGameWon(existingResult.won);
				// Solo marcar como completado si realmente ganó
				setGameCompleted(existingResult.won);
			}
		} catch (error) {
			console.error("Error cargando progreso del usuario:", error);
		}
	};

	const handleGuess = async (country: Country) => {
		if (!targetCountry || !dailyCountry || gameWon || gameCompleted || !user)
			return;

		// Función para verificar si dos países comparten frontera
		const areCountriesBordering = (
			country1: string,
			country2: string
		): boolean => {
			// Casos específicos conocidos de fronteras (verificación directa)
			const specificBorders = [
				["Estados Unidos", "México"],
				["Estados Unidos", "Canadá"],
				["México", "Guatemala"],
				["México", "Belice"],
			];

			for (const [c1, c2] of specificBorders) {
				if (
					(country1 === c1 && country2 === c2) ||
					(country1 === c2 && country2 === c1)
				) {
					return true;
				}
			}

			const borders: { [key: string]: string[] } = {
				// América del Norte
				"Estados Unidos": ["Canadá", "México"],
				Canadá: ["Estados Unidos"],
				México: ["Estados Unidos", "Guatemala", "Belice"],

				// América Central
				Guatemala: ["México", "Belice", "Honduras", "El Salvador"],
				Belice: ["México", "Guatemala"],
				Honduras: ["Guatemala", "El Salvador", "Nicaragua"],
				"El Salvador": ["Guatemala", "Honduras"],
				Nicaragua: ["Honduras", "Costa Rica"],
				"Costa Rica": ["Nicaragua", "Panamá"],
				Panamá: ["Costa Rica", "Colombia"],

				// América del Sur
				Colombia: ["Panamá", "Venezuela", "Brasil", "Perú", "Ecuador"],
				Venezuela: ["Colombia", "Brasil", "Guyana"],
				Guyana: ["Venezuela", "Brasil", "Surinam"],
				Surinam: ["Guyana", "Brasil", "Guayana Francesa"],
				"Guayana Francesa": ["Surinam", "Brasil"],
				Brasil: [
					"Colombia",
					"Venezuela",
					"Guyana",
					"Surinam",
					"Guayana Francesa",
					"Uruguay",
					"Argentina",
					"Paraguay",
					"Bolivia",
					"Perú",
				],
				Ecuador: ["Colombia", "Perú"],
				Perú: ["Ecuador", "Colombia", "Brasil", "Bolivia", "Chile"],
				Bolivia: ["Perú", "Brasil", "Paraguay", "Argentina", "Chile"],
				Chile: ["Perú", "Bolivia", "Argentina"],
				Argentina: ["Chile", "Bolivia", "Paraguay", "Brasil", "Uruguay"],
				Paraguay: ["Bolivia", "Brasil", "Argentina"],
				Uruguay: ["Brasil", "Argentina"],

				// Europa Occidental
				España: ["Francia", "Andorra", "Portugal"],
				Francia: [
					"España",
					"Andorra",
					"Italia",
					"Suiza",
					"Alemania",
					"Luxemburgo",
					"Bélgica",
				],
				Portugal: ["España"],
				Andorra: ["España", "Francia"],
				Italia: [
					"Francia",
					"Suiza",
					"Austria",
					"Eslovenia",
					"San Marino",
					"Vaticano",
				],
				Suiza: [
					"Francia",
					"Italia",
					"Austria",
					"Alemania",
					"Liechtenstein",
				],
				Austria: [
					"Italia",
					"Suiza",
					"Alemania",
					"República Checa",
					"Eslovaquia",
					"Hungría",
					"Eslovenia",
				],
				Alemania: [
					"Francia",
					"Suiza",
					"Austria",
					"República Checa",
					"Polonia",
					"Holanda",
					"Bélgica",
					"Luxemburgo",
					"Dinamarca",
				],
				Holanda: ["Alemania", "Bélgica"],
				Bélgica: ["Francia", "Holanda", "Alemania", "Luxemburgo"],
				Luxemburgo: ["Francia", "Alemania", "Bélgica"],

				// Europa del Este
				Polonia: [
					"Alemania",
					"República Checa",
					"Eslovaquia",
					"Ucrania",
					"Bielorrusia",
					"Lituania",
					"Rusia",
				],
				"República Checa": ["Alemania", "Austria", "Eslovaquia", "Polonia"],
				Eslovaquia: [
					"República Checa",
					"Austria",
					"Hungría",
					"Ucrania",
					"Polonia",
				],
				Hungría: [
					"Austria",
					"Eslovaquia",
					"Ucrania",
					"Rumania",
					"Serbia",
					"Croacia",
					"Eslovenia",
				],
				Eslovenia: ["Italia", "Austria", "Hungría", "Croacia"],

				// África
				Marruecos: ["Argelia", "España"], // España por Ceuta y Melilla
				Argelia: [
					"Marruecos",
					"Túnez",
					"Libia",
					"Níger",
					"Mali",
					"Mauritania",
				],
				Túnez: ["Argelia", "Libia"],
				Libia: ["Túnez", "Argelia", "Níger", "Chad", "Sudán", "Egipto"],
				Egipto: ["Libia", "Sudán"],
				Sudáfrica: [
					"Namibia",
					"Botsuana",
					"Zimbabue",
					"Mozambique",
					"Esuatini",
					"Lesoto",
				],

				// Asia
				China: [
					"Rusia",
					"Mongolia",
					"Kazajistán",
					"Kirguistán",
					"Tayikistán",
					"Afganistán",
					"Pakistán",
					"India",
					"Nepal",
					"Bután",
					"Myanmar",
					"Laos",
					"Vietnam",
					"Corea del Norte",
				],
				India: [
					"Pakistán",
					"China",
					"Nepal",
					"Bután",
					"Bangladesh",
					"Myanmar",
				],
				Rusia: [
					"Noruega",
					"Finlandia",
					"Estonia",
					"Letonia",
					"Lituania",
					"Polonia",
					"Bielorrusia",
					"Ucrania",
					"Georgia",
					"Azerbaiyán",
					"Kazajistán",
					"China",
					"Mongolia",
					"Corea del Norte",
				],
			};

			const country1Borders = borders[country1] || [];
			const country2Borders = borders[country2] || [];
			const result =
				country1Borders.includes(country2) ||
				country2Borders.includes(country1);
			return result;
		};

		let distance: number;

		if (country.code === targetCountry.code) {
			// Mismo país
			distance = 0;
		} else if (areCountriesBordering(country.name, targetCountry.name)) {
			// Países fronterizos
			distance = 0;
		} else {
			// Calcular distancia real
			distance = calculateDistanceCountries(
				country.name,
				targetCountry.name
			);
		}

		const newGuess: Guess = { country, distance };
		const newGuesses = [...guesses, newGuess];
		const newAttempts = attempts + 1;

		setGuesses(newGuesses);
		setAttempts(newAttempts);

		// Centrar el mapa en el país adivinado
		setHighlightedCountry(country);
		setZoomToCountry(country);

		// Verificar si ganó
		const isWon = country.code === targetCountry.code;
		if (isWon) {
			setGameWon(true);
			setGameCompleted(true);
		}

		// Guardar resultado en la base de datos
		try {
			const guessesForDB = newGuesses.map((g) => ({
				country: g.country.name,
				distance: g.distance,
			}));

			await saveGameResult(
				dailyCountry.id,
				isWon,
				newAttempts,
				guessesForDB
			);
		} catch (error) {
			console.error("Error guardando resultado:", error);
		}
	};

	const handleCountryClick = (country: Country) => {
		setHighlightedCountry(country);
	};

	const handleCountryHover = (country: Country | null) => {
		setHighlightedCountry(country);
	};

	const handleCountryListClick = (country: Country) => {
		setHighlightedCountry(country);
		setZoomToCountry(country);
	};

	const alreadyGuessed = guesses.map((g) => g.country);
	const bestDistance =
		guesses.length > 0
			? Math.min(...guesses.map((g) => g.distance))
			: Infinity;

	// Función para compartir en WhatsApp
	const shareOnWhatsApp = () => {
		if (!targetCountry) return;

		const guessesData = guesses.map((g) => ({
			countryName: g.country.name,
			distance: g.distance,
		}));

		const shareText = generateShareText(guessesData, gameWon, attempts);
		const encodedText = encodeURIComponent(shareText);
		const whatsappUrl = `https://wa.me/?text=${encodedText}`;

		window.open(whatsappUrl, "_blank");
	};

	// Función para copiar resultado al portapapeles
	const copyToClipboard = async () => {
		if (!targetCountry) return;

		const guessesData = guesses.map((g) => ({
			countryName: g.country.name,
			distance: g.distance,
		}));

		const shareText = generateShareText(guessesData, gameWon, attempts);

		try {
			await navigator.clipboard.writeText(shareText);
			alert("¡Resultado copiado al portapapeles!");
		} catch (err) {
			console.error("Error al copiar:", err);
			alert("No se pudo copiar el resultado");
		}
	};

	// Mostrar modal de username si no hay usuario
	if (!userLoading && !user) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="mb-6">
						<h1 className="text-4xl font-bold text-cyan-400 font-mono mb-4">
							🌍 GUIATE
						</h1>
						<p className="text-cyan-300 font-mono">
							Necesitas un nombre de usuario para guardar tu progreso
						</p>
					</div>

					<button
						onClick={() => setShowAuthModal(true)}
						className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105"
					>
						&gt; CREAR JUGADOR
					</button>
				</div>

				<AuthModal
					isOpen={showAuthModal}
					onClose={() => setShowAuthModal(false)}
				/>
			</div>
		);
	}

	if (loading || userLoading || !targetCountry || !dailyCountry) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
					<p className="text-xl text-cyan-400 font-mono">
						Preparando el juego...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative">
			{/* Header compacto con estética gamer */}
			<div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-sm shadow-lg border-b-2 border-cyan-400/30">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<Link
							href="/"
							className="flex items-center space-x-2 text-cyan-400 hover:text-lime-400 transition-colors font-mono"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
							<span className="font-medium text-sm md:text-base tracking-wider">
								&lt; VOLVER
							</span>
						</Link>

						<div className="flex items-center space-x-2">
							<h1 className="text-xl font-bold text-white font-mono tracking-wider">
								🌍 GUIATE
							</h1>
						</div>

						<div className="flex items-center space-x-2">
							{user && (
								<div className="px-3 py-2 bg-cyan-600/80 backdrop-blur-sm text-white font-mono text-sm border border-cyan-400/50">
									👤 {user.username}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-4 space-y-4">
				{/* Instrucciones - Estilo terminal */}
				<details className="bg-gray-900/80 backdrop-blur-sm border-2 border-lime-400/50 shadow-xl relative overflow-hidden">
					<summary className="p-4 cursor-pointer font-bold text-lime-400 text-center font-mono tracking-wider hover:text-cyan-400 transition-colors">
						📖 &gt; Cómo jugar [expandir]
					</summary>
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-400/5 to-transparent opacity-50 pointer-events-none"></div>
					<div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-cyan-300 relative z-10">
						<div className="bg-black/30 p-3 border border-cyan-400/30">
							<h4 className="font-semibold mb-1 text-lime-400 font-mono tracking-wider">
								🎯 OBJETIVO
							</h4>
							<p className="font-mono text-xs">
								&gt; Adivina el país secreto en la menor cantidad de
								intentos posible.
							</p>
						</div>
						<div className="bg-black/30 p-3 border border-cyan-400/30">
							<h4 className="font-semibold mb-1 text-lime-400 font-mono tracking-wider">
								🎨 COLORES
							</h4>
							<p className="font-mono text-xs">
								&gt; Los países aparecen en el mapa con colores según su
								distancia.
							</p>
						</div>
						<div className="bg-black/30 p-3 border border-cyan-400/30">
							<h4 className="font-semibold mb-1 text-lime-400 font-mono tracking-wider">
								📏 DISTANCIA
							</h4>
							<p className="font-mono text-xs">
								&gt; La lista muestra todos tus intentos ordenados de
								más cerca a más lejos.
							</p>
						</div>
						<div className="bg-black/30 p-3 border border-cyan-400/30">
							<h4 className="font-semibold mb-1 text-lime-400 font-mono tracking-wider">
								⌨️ CONTROLES
							</h4>
							<p className="font-mono text-xs">
								&gt; Escribe el nombre del país y usa las flechas para
								navegar.
							</p>
						</div>
					</div>
				</details>
				{/* Input para adivinar - Estilo gamer */}
				<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/50 shadow-xl relative overflow-hidden p-4">
					{/* Efectos de scanline sutiles */}
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-50 pointer-events-none"></div>

					<div className="max-w-2xl mx-auto relative z-10">
						<CountryInput
							onGuess={handleGuess}
							disabled={gameWon || gameCompleted}
							alreadyGuessed={alreadyGuessed}
						/>
					</div>

					{/* Píxeles decorativos */}
					<div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
					<div className="absolute top-2 right-2 w-2 h-2 bg-lime-400 animate-pulse delay-500"></div>
				</div>

				{/* Estado del juego - Estilo gamer */}
				{gameWon ? (
					<div className="bg-gray-900/90 backdrop-blur-sm border-2 border-lime-400 shadow-xl relative overflow-hidden p-4">
						{/* Efecto de celebración */}
						<div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-purple-400/10 animate-pulse"></div>

						<div className="relative z-10">
							<h2 className="text-lg md:text-xl font-bold text-lime-400 mb-2 text-center font-mono tracking-wider pixel-title">
								🎉 ¡VICTORIA CONSEGUIDA!
							</h2>
							<p className="text-cyan-300 text-center mb-4 font-mono">
								¡Completaste{" "}
								<span className="font-bold text-white">
									{targetCountry.name}
								</span>{" "}
								en {attempts} intentos!
							</p>

							<div className="flex flex-wrap gap-2 justify-center">
								<button
									onClick={shareOnWhatsApp}
									className="px-4 py-2 bg-green-600 text-white font-mono hover:bg-green-500 transition-colors"
								>
									📱 WhatsApp
								</button>
								<button
									onClick={copyToClipboard}
									className="px-4 py-2 bg-blue-600 text-white font-mono hover:bg-blue-500 transition-colors"
								>
									📋 Copiar
								</button>
							</div>
						</div>

						{/* Píxeles de celebración */}
						<div className="absolute top-2 left-2 w-3 h-3 bg-lime-400 animate-ping"></div>
						<div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 animate-ping delay-300"></div>
						<div className="absolute bottom-2 left-2 w-3 h-3 bg-purple-400 animate-ping delay-600"></div>
						<div className="absolute bottom-2 right-2 w-3 h-3 bg-pink-400 animate-ping delay-900"></div>
					</div>
				) : (
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-purple-400/50 shadow-xl relative overflow-hidden p-4">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/5 to-transparent opacity-50 pointer-events-none"></div>

						<div className="relative z-10">
							<p className="text-sm md:text-base text-cyan-300 mb-3 text-center font-mono">
								&gt; Adivina el país secreto
							</p>
							<div className="flex justify-center items-center space-x-4 text-xs md:text-sm font-mono">
								<div className="flex items-center space-x-1">
									<div className="w-3 h-3 bg-red-600"></div>
									<span className="text-cyan-300">CERCA</span>
								</div>
								<div className="flex items-center space-x-1">
									<div className="w-3 h-3 bg-yellow-500"></div>
									<span className="text-cyan-300">LEJOS</span>
								</div>
								<div className="flex items-center space-x-1">
									<div className="w-3 h-3 bg-yellow-300"></div>
									<span className="text-cyan-300">MUY LEJOS</span>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Mapa y Lista - Layout responsivo con estilo gamer */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Mapa - Estilo cyberpunk */}
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/50 shadow-xl relative overflow-hidden p-4">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-50 pointer-events-none"></div>

						<div className="h-[300px] md:h-[400px] lg:h-[500px] w-full relative z-10">
							<GameMap
								targetCountry={targetCountry}
								guessedCountries={guesses}
								onMapReady={() => setMapReady(true)}
								onCountryClick={handleCountryClick}
								highlightedCountry={highlightedCountry}
								zoomToCountry={zoomToCountry}
							/>
						</div>
						{!mapReady && (
							<div className="text-center mt-2 text-cyan-400 text-sm font-mono relative z-10">
								<p>&gt; Cargando mapa...</p>
								<div className="flex justify-center mt-1">
									<div className="w-2 h-2 bg-cyan-400 animate-bounce mr-1"></div>
									<div className="w-2 h-2 bg-cyan-400 animate-bounce delay-100 mr-1"></div>
									<div className="w-2 h-2 bg-cyan-400 animate-bounce delay-200"></div>
								</div>
							</div>
						)}

						{/* Píxeles decorativos */}
						<div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
						<div className="absolute top-2 right-2 w-2 h-2 bg-lime-400 animate-pulse delay-500"></div>
						<div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 animate-pulse delay-1000"></div>
						<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>
					</div>

					{/* Lista de intentos con estilo retro */}
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-purple-400/50 shadow-xl relative overflow-hidden lg:h-[568px] lg:flex lg:flex-col">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/5 to-transparent opacity-50 pointer-events-none"></div>

						<div className="relative z-10 flex-1 overflow-hidden">
							<GuessList
								guesses={guesses}
								onCountryHover={handleCountryHover}
								onCountryClick={handleCountryListClick}
								highlightedCountry={highlightedCountry}
								targetCountry={targetCountry}
							/>
						</div>

						{/* Píxeles decorativos */}
						<div className="absolute top-2 left-2 w-2 h-2 bg-purple-400 animate-pulse"></div>
						<div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 animate-pulse delay-700"></div>
					</div>
				</div>

				{/* Estadísticas compactas con estilo arcade */}
				<div className="grid grid-cols-3 gap-3">
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/50 shadow-xl relative overflow-hidden p-3 text-center">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50 pointer-events-none"></div>
						<div className="relative z-10">
							<div className="text-xl md:text-2xl font-bold text-cyan-400 font-mono">
								{attempts}
							</div>
							<div className="text-xs md:text-sm text-cyan-300 font-mono">
								INTENTOS
							</div>
						</div>
						<div className="absolute top-1 left-1 w-1 h-1 bg-cyan-400"></div>
						<div className="absolute top-1 right-1 w-1 h-1 bg-cyan-400"></div>
					</div>
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-lime-400/50 shadow-xl relative overflow-hidden p-3 text-center">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-400/10 to-transparent opacity-50 pointer-events-none"></div>
						<div className="relative z-10">
							<div className="text-xl md:text-2xl font-bold text-lime-400 font-mono">
								{bestDistance === Infinity
									? "∞"
									: `${Math.round(bestDistance / 1000)}k`}
							</div>
							<div className="text-xs md:text-sm text-lime-300 font-mono">
								Mejor km
							</div>
						</div>
						<div className="absolute top-1 left-1 w-1 h-1 bg-lime-400"></div>
						<div className="absolute top-1 right-1 w-1 h-1 bg-lime-400"></div>
					</div>{" "}
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-purple-400/50 shadow-xl relative overflow-hidden p-3 text-center">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/10 to-transparent opacity-50 pointer-events-none"></div>
						<div className="relative z-10">
							<div className="text-xl md:text-2xl font-bold text-purple-400 font-mono">
								{user?.total_wins || 0}
							</div>
							<div className="text-xs md:text-sm text-purple-300 font-mono">
								VICTORIAS
							</div>
						</div>
					</div>
				</div>

				{/* Ranking - Sección al pie de la página */}
				<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-yellow-400/50 shadow-xl relative overflow-hidden p-4 mt-6">
					<div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/5 to-transparent opacity-50 pointer-events-none"></div>

					{/* Partículas decorativas */}
					<div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 animate-pulse"></div>
					<div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 animate-pulse delay-500"></div>
					<div className="absolute bottom-2 left-2 w-2 h-2 bg-red-400 animate-pulse delay-1000"></div>
					<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>

					<div className="relative z-10">
						<h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-center font-mono tracking-wider">
							🏆 RANKING DIARIO
						</h2>

						{/* Ranking simplificado para la página */}
						<div className="max-w-4xl mx-auto">
							{/* Top 3 destacado */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
								{[0, 1, 2].map((index) => {
									const entry = ranking[index];
									return (
										<div
											key={index}
											className={`p-4 rounded-lg border-2 text-center ${
												index === 0
													? "border-yellow-400/50 bg-yellow-400/10"
													: index === 1
													? "border-gray-300/50 bg-gray-300/10"
													: "border-orange-400/50 bg-orange-400/10"
											}`}
										>
											<div className="text-3xl mb-2">
												{index === 0
													? "🥇"
													: index === 1
													? "🥈"
													: "🥉"}
											</div>
											{entry ? (
												<>
													<div className="text-white font-mono font-bold text-lg mb-1">
														{entry.username}
													</div>
													<div className="text-cyan-300 font-mono text-sm">
														{entry.total_wins} victorias
													</div>
													<div className="text-lime-400 font-mono text-xs">
														{entry.average_attempts.toFixed(1)}{" "}
														prom.
													</div>
												</>
											) : (
												<>
													<div className="text-white font-mono font-bold text-lg mb-1">
														TOP {index + 1}
													</div>
													<div className="text-cyan-300 font-mono text-sm">
														{rankingLoading
															? "Cargando..."
															: "Sin datos"}
													</div>
												</>
											)}
										</div>
									);
								})}
							</div>

							{/* Tabla de ranking */}
							<div className="bg-black/30 rounded-lg border border-cyan-400/30 overflow-hidden">
								<div className="grid grid-cols-5 gap-2 px-4 py-3 bg-black/50 border-b border-cyan-400/30 font-mono text-sm text-cyan-300">
									<div className="text-center">#</div>
									<div>JUGADOR</div>
									<div className="text-center">VICTORIAS</div>
									<div className="text-center">PROMEDIO</div>
									<div className="text-center">RACHA</div>
								</div>

								{rankingLoading ? (
									<div className="px-4 py-8 text-center">
										<div className="text-cyan-400 font-mono mb-2">
											&gt; Cargando ranking...
										</div>
										<div className="flex justify-center">
											<div className="w-2 h-2 bg-cyan-400 animate-bounce mr-1"></div>
											<div className="w-2 h-2 bg-cyan-400 animate-bounce delay-100 mr-1"></div>
											<div className="w-2 h-2 bg-cyan-400 animate-bounce delay-200"></div>
										</div>
									</div>
								) : ranking.length === 0 ? (
									<div className="px-4 py-6 text-center">
										<div className="text-cyan-400 font-mono">
											&gt; No hay datos de ranking disponibles
										</div>
									</div>
								) : (
									<div className="divide-y divide-cyan-400/20">
										{ranking.slice(0, 10).map((entry, index) => (
											<div
												key={entry.user_id}
												className={`grid grid-cols-5 gap-2 px-4 py-3 font-mono text-sm transition-colors hover:bg-cyan-400/5 ${
													entry.username === user?.username
														? "bg-purple-400/10 border-l-4 border-purple-400"
														: ""
												}`}
											>
												<div className="text-center text-cyan-400 font-bold">
													{index + 1}
												</div>
												<div className="text-white truncate">
													{entry.username}
													{entry.username === user?.username && (
														<span className="text-purple-400 ml-1">
															(Tú)
														</span>
													)}
												</div>
												<div className="text-center text-lime-400 font-bold">
													{entry.total_wins}
												</div>
												<div className="text-center text-cyan-300">
													{entry.average_attempts.toFixed(1)}
												</div>
												<div className="text-center text-purple-400">
													{entry.best_streak}
													{entry.current_streak > 0 && (
														<span className="text-xs text-cyan-300 ml-1">
															({entry.current_streak})
														</span>
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
