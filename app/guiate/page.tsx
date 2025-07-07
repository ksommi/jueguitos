"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
	Country,
	getDailyCountry,
	getDailyGameState,
	saveDailyGameState,
	DailyGameState,
	COUNTRIES,
	getGameStats,
	updateGameStats,
	generateShareText,
	GameStats,
} from "@/lib/countries";
import { calculateDistanceCountries } from "@/lib/geoData";

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

export default function AdivinarPaisPage() {
	const [targetCountry, setTargetCountry] = useState<Country | null>(null);
	const [guesses, setGuesses] = useState<Guess[]>([]);
	const [gameWon, setGameWon] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const [mapReady, setMapReady] = useState(false);
	const [highlightedCountry, setHighlightedCountry] = useState<Country | null>(
		null
	);
	const [zoomToCountry, setZoomToCountry] = useState<Country | null>(null);
	const [gameStats, setGameStats] = useState<GameStats | null>(null);
	const [showStats, setShowStats] = useState(false);
	const [gameCompleted, setGameCompleted] = useState(false);

	// Funciones auxiliares
	const getCurrentDateString = (): string => {
		const now = new Date();
		const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
		const utcDate = new Date(utcTime);
		return (
			utcDate.getFullYear() +
			"-" +
			String(utcDate.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(utcDate.getDate()).padStart(2, "0")
		);
	};

	const saveGameProgress = (
		newGuesses: Guess[],
		newAttempts: number,
		isWon: boolean
	) => {
		if (typeof window !== "undefined") {
			const gameState: DailyGameState = {
				date: getCurrentDateString(),
				completed: isWon,
				attempts: newAttempts,
				won: isWon,
				guesses: newGuesses.map((g) => ({
					countryName: g.country.name,
					distance: g.distance,
				})),
			};
			saveDailyGameState(gameState);
		}
	};

	const resetGameState = () => {
		setGuesses([]);
		setGameWon(false);
		setAttempts(0);

		if (typeof window !== "undefined") {
			const newState: DailyGameState = {
				date: getCurrentDateString(),
				completed: false,
				attempts: 0,
				won: false,
				guesses: [],
			};
			saveDailyGameState(newState);
		}
	};

	// Inicializar el juego
	useEffect(() => {
		const initializeGame = () => {
			const dailyCountry = getDailyCountry();
			setTargetCountry(dailyCountry);

			// Cargar el estado del juego desde localStorage
			if (typeof window !== "undefined") {
				const gameState = getDailyGameState();

				if (gameState.date === getCurrentDateString()) {
					// Si ya hay un juego del día actual, cargar el progreso
					const loadedGuesses = gameState.guesses
						.map((guessData) => {
							const country = COUNTRIES.find(
								(c) => c.name === guessData.countryName
							);
							if (country) {
								// Si la distancia es 0, recalcular (migración de datos antiguos)
								const distance =
									guessData.distance === 0
										? calculateDistanceCountries(
												country.name,
												dailyCountry.name
										  )
										: guessData.distance;

								return {
									country,
									distance,
								};
							}
							return null;
						})
						.filter(Boolean) as Guess[];

					setGuesses(loadedGuesses);
					setAttempts(gameState.attempts);
					setGameWon(gameState.won);
					setGameCompleted(gameState.completed);
				} else {
					// Nuevo día, reiniciar el juego
					setGuesses([]);
					setGameWon(false);
					setAttempts(0);

					if (typeof window !== "undefined") {
						const newState: DailyGameState = {
							date: getCurrentDateString(),
							completed: false,
							attempts: 0,
							won: false,
							guesses: [],
						};
						saveDailyGameState(newState);
					}
				}
			}
		};

		initializeGame();

		// Cargar estadísticas
		if (typeof window !== "undefined") {
			const stats = getGameStats();
			setGameStats(stats);
		}
	}, []);

	const startNewGame = () => {
		resetGameState();
		const dailyCountry = getDailyCountry();
		setTargetCountry(dailyCountry);
		console.log("País del día:", dailyCountry.name); // Para debugging - remover en producción
	};

	const handleGuess = (country: Country) => {
		if (!targetCountry || gameWon || gameCompleted) return;

		const distance =
			country.code === targetCountry.code
				? 0
				: calculateDistanceCountries(country.name, targetCountry.name);

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

			// Actualizar estadísticas
			const updatedStats = updateGameStats(true, newAttempts);
			setGameStats(updatedStats);
		}

		// Guardar progreso en localStorage
		saveGameProgress(newGuesses, newAttempts, isWon);
	};

	const handleCountryClick = (country: Country) => {
		console.log("País clickeado:", country.name);
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

	if (!targetCountry) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-xl text-gray-600">Preparando el juego...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			{/* Header compacto para móvil */}
			<div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<Link
							href="/"
							className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
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
							<span className="font-medium text-sm md:text-base">
								Volver
							</span>
						</Link>

						<h1 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white">
							🌍 Adivinar País
						</h1>

						<div className="flex space-x-2">
							<button
								onClick={() => setShowStats(!showStats)}
								className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
							>
								📊
							</button>
							{process.env.NODE_ENV === "development" && (
								<button
									onClick={startNewGame}
									className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
								>
									🔄
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-4 space-y-4">
				{/* Input para adivinar - Primera prioridad en móvil */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
					<div className="max-w-2xl mx-auto">
						<CountryInput
							onGuess={handleGuess}
							disabled={gameWon || gameCompleted}
							alreadyGuessed={alreadyGuessed}
						/>
					</div>
				</div>

				{/* Estado del juego */}
				{gameWon ? (
					<div className="bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-600 rounded-lg p-4">
						<h2 className="text-lg md:text-xl font-bold text-green-800 dark:text-green-200 mb-2 text-center">
							🎉 ¡Felicitaciones!
						</h2>
						<p className="text-green-700 dark:text-green-300 text-center mb-4">
							¡Adivinaste{" "}
							<span className="font-bold">{targetCountry.name}</span> en{" "}
							{attempts} intentos!
						</p>

						{/* Estadísticas rápidas */}
						{gameStats && (
							<div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
								<div className="grid grid-cols-3 gap-4 text-center">
									<div>
										<div className="text-lg font-bold text-green-600">
											{gameStats.gamesPlayed}
										</div>
										<div className="text-xs text-gray-600 dark:text-gray-400">
											Jugados
										</div>
									</div>
									<div>
										<div className="text-lg font-bold text-blue-600">
											{gameStats.averageGuesses}
										</div>
										<div className="text-xs text-gray-600 dark:text-gray-400">
											Promedio
										</div>
									</div>
									<div>
										<div className="text-lg font-bold text-green-600">
											{gameStats.currentStreak}
										</div>
										<div className="text-xs text-gray-600 dark:text-gray-400">
											Racha
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Botones de compartir */}
						<div className="grid grid-cols-2 gap-3 mb-3">
							<button
								onClick={shareOnWhatsApp}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
							>
								<span>📱</span>
								<span>WhatsApp</span>
							</button>{" "}
							<button
								onClick={copyToClipboard}
								className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
							>
								<span>📋</span>
								<span>Copiar</span>
							</button>
						</div>

						{process.env.NODE_ENV === "development" && (
							<button
								onClick={startNewGame}
								className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium"
							>
								🔄 Reiniciar
							</button>
						)}
					</div>
				) : (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
						<p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-3 text-center">
							Adivina el país secreto. Los colores indican qué tan cerca
							estás.
						</p>
						<div className="flex justify-center items-center space-x-4 text-xs md:text-sm">
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 bg-red-600 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Cerca
								</span>
							</div>
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Lejos
								</span>
							</div>
							<div className="flex items-center space-x-1">
								<div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
								<span className="text-gray-700 dark:text-gray-300">
									Muy lejos
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Mapa y Lista - Layout responsivo */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					{/* Mapa - Tamaño optimizado para móvil y desktop */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-600">
						<div className="h-[300px] md:h-[400px] lg:h-[500px] w-full">
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
							<div className="text-center mt-2 text-gray-500 dark:text-gray-400 text-sm">
								<p>Cargando mapa...</p>
							</div>
						)}
					</div>

					{/* Lista de intentos */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 lg:h-[568px] lg:overflow-hidden lg:flex lg:flex-col">
						<GuessList
							guesses={guesses}
							onCountryHover={handleCountryHover}
							onCountryClick={handleCountryListClick}
							highlightedCountry={highlightedCountry}
						/>
					</div>
				</div>

				{/* Estadísticas compactas */}
				<div className="grid grid-cols-3 gap-3">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-center">
						<div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
							{attempts}
						</div>
						<div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
							Intentos
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-center">
						<div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
							{bestDistance === Infinity
								? "∞"
								: `${Math.round(bestDistance / 1000)}k`}
						</div>
						<div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
							Mejor (km)
						</div>
					</div>
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 text-center">
						<div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
							{guesses.length}
						</div>
						<div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
							Países
						</div>
					</div>
				</div>

				{/* Instrucciones - Minimizadas para móvil */}
				<details className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
					<summary className="p-4 cursor-pointer font-bold text-gray-800 dark:text-white text-center">
						📖 Cómo Jugar (toca para expandir)
					</summary>
					<div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
						<div>
							<h4 className="font-semibold mb-1 text-gray-800 dark:text-white">
								🎯 Objetivo
							</h4>
							<p>
								Adivina el país secreto en la menor cantidad de intentos
								posible.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-1 text-gray-800 dark:text-white">
								🎨 Colores
							</h4>
							<p>
								Los países aparecen en el mapa con colores según su
								distancia al país secreto.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-1 text-gray-800 dark:text-white">
								📏 Distancia
							</h4>
							<p>
								La lista muestra todos tus intentos ordenados de más
								cerca a más lejos.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-1 text-gray-800 dark:text-white">
								⌨️ Controles
							</h4>
							<p>
								Escribe el nombre del país y usa las flechas para
								navegar las sugerencias.
							</p>
						</div>
					</div>
				</details>

				{/* Modal de estadísticas */}
				{showStats && gameStats && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-xl font-bold text-gray-800 dark:text-white">
									📊 Estadísticas
								</h2>
								<button
									onClick={() => setShowStats(false)}
									className="text-gray-500 hover:text-gray-700 text-2xl"
								>
									×
								</button>
							</div>

							<div className="grid grid-cols-2 gap-4 mb-6">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{gameStats.gamesPlayed}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Partidas jugadas
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-600">
										{gameStats.averageGuesses}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Promedio intentos
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-purple-600">
										{gameStats.currentStreak}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Racha actual
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-orange-600">
										{gameStats.maxStreak}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										Mejor racha
									</div>
								</div>
							</div>

							{gameStats.averageGuesses > 0 && (
								<div className="text-center mb-4">
									<div className="text-lg font-bold text-gray-700 dark:text-gray-300">
										Promedio: {gameStats.averageGuesses} intentos
									</div>
								</div>
							)}

							<button
								onClick={() => setShowStats(false)}
								className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
							>
								Cerrar
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
