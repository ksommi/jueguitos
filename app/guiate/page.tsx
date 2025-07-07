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

						<h1 className="text-lg md:text-2xl font-bold text-white font-mono tracking-wider pixel-title">
							🌍 <span className="text-cyan-400">GUIATE</span>
						</h1>

						<div className="flex space-x-2">
							<button
								onClick={() => setShowStats(!showStats)}
								className="px-3 py-2 bg-cyan-600/80 backdrop-blur-sm text-white font-mono hover:bg-lime-500/80 transition-colors font-medium text-sm border border-cyan-400/50 hover:border-lime-400"
							>
								📊
							</button>
							{process.env.NODE_ENV === "development" && (
								<button
									onClick={startNewGame}
									className="px-3 py-2 bg-purple-600/80 backdrop-blur-sm text-white font-mono hover:bg-purple-500/80 transition-colors font-medium text-sm border border-purple-400/50"
								>
									🔄
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-4 py-4 space-y-4">
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

							{/* Estadísticas rápidas con estilo retro */}
							{gameStats && (
								<div className="bg-black/50 backdrop-blur-sm border border-cyan-400/30 p-3 mb-4">
									<div className="grid grid-cols-3 gap-4 text-center">
										<div>
											<div className="text-lg font-bold text-lime-400 font-mono">
												{gameStats.gamesPlayed}
											</div>
											<div className="text-xs text-cyan-300 font-mono">
												JUGADOS
											</div>
										</div>
										<div>
											<div className="text-lg font-bold text-cyan-400 font-mono">
												{gameStats.averageGuesses}
											</div>
											<div className="text-xs text-cyan-300 font-mono">
												Promedio
											</div>
										</div>
										<div>
											<div className="text-lg font-bold text-purple-400 font-mono">
												{gameStats.currentStreak}
											</div>
											<div className="text-xs text-cyan-300 font-mono">
												RACHA
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Botones de compartir con estilo arcade */}
							<div className="grid grid-cols-2 gap-3 mb-3">
								<button
									onClick={shareOnWhatsApp}
									className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-lime-500 to-green-500 text-black font-mono font-bold transition-colors pixel-button"
								>
									<span>📱</span>
									<span>WHATSAPP</span>
								</button>
								<button
									onClick={copyToClipboard}
									className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-mono font-bold transition-colors pixel-button"
								>
									<span>📋</span>
									<span>COPIAR</span>
								</button>
							</div>

							{process.env.NODE_ENV === "development" && (
								<button
									onClick={startNewGame}
									className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-black font-mono font-bold transition-colors pixel-button"
								>
									🔄 REINICIAR
								</button>
							)}
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
									<span className="text-cyan-300">Muy lejos</span>
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
					</div>
					<div className="bg-gray-900/80 backdrop-blur-sm border-2 border-purple-400/50 shadow-xl relative overflow-hidden p-3 text-center">
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/10 to-transparent opacity-50 pointer-events-none"></div>
						<div className="relative z-10">
							<div className="text-xl md:text-2xl font-bold text-purple-400 font-mono">
								{guesses.length}
							</div>
							<div className="text-xs md:text-sm text-purple-300 font-mono">
								Países
							</div>
						</div>
						<div className="absolute top-1 left-1 w-1 h-1 bg-purple-400"></div>
						<div className="absolute top-1 right-1 w-1 h-1 bg-purple-400"></div>
					</div>
				</div>

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

				{/* Modal de estadísticas - Estilo cyberpunk */}
				{showStats && gameStats && (
					<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
						<div className="bg-gray-900/95 backdrop-blur-sm border-2 border-cyan-400 shadow-2xl max-w-md w-full relative overflow-hidden">
							{/* Efectos de scanline */}
							<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-50 pointer-events-none"></div>

							<div className="relative z-10 p-6">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-xl font-bold text-cyan-400 font-mono tracking-wider">
										📊 &gt; ESTADÍSTICAS
									</h2>
									<button
										onClick={() => setShowStats(false)}
										className="text-lime-400 hover:text-cyan-400 text-2xl font-mono transition-colors"
									>
										[X]
									</button>
								</div>

								<div className="grid grid-cols-2 gap-4 mb-6">
									<div className="text-center bg-black/50 p-3 border border-cyan-400/30">
										<div className="text-2xl font-bold text-cyan-400 font-mono">
											{gameStats.gamesPlayed}
										</div>
										<div className="text-sm text-cyan-300 font-mono">
											Partidas jugadas
										</div>
									</div>
									<div className="text-center bg-black/50 p-3 border border-lime-400/30">
										<div className="text-2xl font-bold text-lime-400 font-mono">
											{gameStats.averageGuesses}
										</div>
										<div className="text-sm text-lime-300 font-mono">
											Promedio intentos
										</div>
									</div>
									<div className="text-center bg-black/50 p-3 border border-purple-400/30">
										<div className="text-2xl font-bold text-purple-400 font-mono">
											{gameStats.currentStreak}
										</div>
										<div className="text-sm text-purple-300 font-mono">
											Racha actual
										</div>
									</div>
									<div className="text-center bg-black/50 p-3 border border-pink-400/30">
										<div className="text-2xl font-bold text-pink-400 font-mono">
											{gameStats.maxStreak}
										</div>
										<div className="text-sm text-pink-300 font-mono">
											Mejor racha
										</div>
									</div>
								</div>

								{gameStats.averageGuesses > 0 && (
									<div className="text-center mb-4 bg-black/50 p-3 border border-cyan-400/30">
										<div className="text-lg font-bold text-cyan-300 font-mono">
											&gt; Promedio: {gameStats.averageGuesses}{" "}
											intentos
										</div>
									</div>
								)}

								<button
									onClick={() => setShowStats(false)}
									className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-colors pixel-button"
								>
									&gt; Cerrar estadísticas
								</button>
							</div>

							{/* Píxeles decorativos */}
							<div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
							<div className="absolute top-2 right-2 w-2 h-2 bg-lime-400 animate-pulse delay-500"></div>
							<div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 animate-pulse delay-1000"></div>
							<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
