"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/AuthProvider";
import {
	getTodayPlayer,
	getUserPlayerGameResult,
	DailyPlayer,
} from "@/lib/supabase";
import { generateShareText } from "@/lib/footballPlayers";
import GameInstructionsModal from "@/components/GameInstructionsModal";
import VictoryModal from "@/components/VictoryModal";
import RankingModal from "@/components/RankingModal";

interface GameState {
	currentPlayer: DailyPlayer | null;
	gameStatus: "loading" | "playing" | "won" | "lost";
	attempts: number;
	maxAttempts: number;
	userGuess: string;
	showInstructions: boolean;
	showVictory: boolean;
	showRanking: boolean;
	showError: boolean;
	errorMessage: string;
	correctAnswer: string;
	alreadyPlayed: boolean;
	guesses: string[]; // Historial de intentos
	isLoading: boolean; // Para el spinner del botón
}

export default function AdivinarJugador() {
	const { user, loading: userLoading } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
	const [gameState, setGameState] = useState<GameState>({
		currentPlayer: null,
		gameStatus: "loading",
		attempts: 0,
		maxAttempts: 6,
		userGuess: "",
		showInstructions: false,
		showVictory: false,
		showRanking: false,
		showError: false,
		errorMessage: "",
		correctAnswer: "",
		alreadyPlayed: false,
		guesses: [],
		isLoading: false,
	});

	// Cargar el juego al montar el componente
	useEffect(() => {
		const loadGame = async () => {
			try {
				setGameState((prev) => ({ ...prev, gameStatus: "loading" }));

				// Obtener el jugador del día
				const player = await getTodayPlayer();

				if (!player) {
					setGameState((prev) => ({
						...prev,
						gameStatus: "lost",
						showError: true,
						errorMessage: "No se pudo cargar el jugador del día",
					}));
					return;
				}

				// Verificar si el usuario ya jugó hoy
				if (user) {
					const existingResult = await getUserPlayerGameResult(player.id);

					if (existingResult) {
						// Parsear los intentos guardados
						const savedGuesses = Array.isArray(existingResult.guesses)
							? existingResult.guesses
							: JSON.parse(existingResult.guesses || "[]");

						// Lógica para determinar el estado del juego:
						// 1. Si won: true → ganó
						// 2. Si won: false Y menos de 6 intentos → puede seguir jugando
						// 3. Si won: false Y 6 intentos → perdió

						if (existingResult.won) {
							// Caso 1: Ganó
							setGameState((prev) => ({
								...prev,
								currentPlayer: player,
								gameStatus: "won",
								attempts: existingResult.attempts,
								alreadyPlayed: true,
								correctAnswer: player.player_name,
								guesses: savedGuesses,
							}));
						} else if (existingResult.attempts >= 6) {
							// Caso 3: Perdió (usó todos los intentos)
							setGameState((prev) => ({
								...prev,
								currentPlayer: player,
								gameStatus: "lost",
								attempts: existingResult.attempts,
								alreadyPlayed: true,
								correctAnswer: player.player_name,
								guesses: savedGuesses,
							}));
						} else {
							// Caso 2: Puede seguir jugando
							setGameState((prev) => ({
								...prev,
								currentPlayer: player,
								gameStatus: "playing",
								attempts: existingResult.attempts,
								alreadyPlayed: false,
								guesses: savedGuesses,
							}));
						}
						return;
					}
				}

				// Juego nuevo
				setGameState((prev) => ({
					...prev,
					currentPlayer: player,
					gameStatus: "playing",
					attempts: 0,
					alreadyPlayed: false,
				}));
			} catch (error) {
				console.error("Error loading game:", error);
				setGameState((prev) => ({
					...prev,
					gameStatus: "lost",
					showError: true,
					errorMessage: "Error al cargar el juego",
				}));
			}
		};

		loadGame();
	}, [user]);

	const handleGuess = async () => {
		if (
			!gameState.currentPlayer ||
			!user ||
			!gameState.userGuess.trim() ||
			gameState.isLoading
		) {
			return;
		}

		try {
			setGameState((prev) => ({ ...prev, isLoading: true }));

			const response = await fetch("/api/daily-player", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					guess: gameState.userGuess.trim(),
					userId: user.id,
					previousGuesses: gameState.guesses,
				}),
			});

			const result = await response.json();

			if (result.alreadyPlayed) {
				// Lógica similar a la carga inicial
				if (result.won) {
					setGameState((prev) => ({
						...prev,
						gameStatus: "won",
						attempts: result.attempts,
						alreadyPlayed: true,
						correctAnswer: result.correctAnswer,
						guesses: result.guesses || [],
						isLoading: false,
					}));
				} else if (result.attempts >= gameState.maxAttempts) {
					setGameState((prev) => ({
						...prev,
						gameStatus: "lost",
						attempts: result.attempts,
						alreadyPlayed: true,
						correctAnswer: result.correctAnswer,
						guesses: result.guesses || [],
						isLoading: false,
					}));
				} else {
					setGameState((prev) => ({
						...prev,
						gameStatus: "playing",
						attempts: result.attempts,
						alreadyPlayed: false,
						guesses: result.guesses || [],
						isLoading: false,
					}));
				}
				return;
			}

			// Actualizar el estado local
			const newGuesses = [...gameState.guesses, gameState.userGuess.trim()];
			const newAttempts = result.attempts;

			if (result.correct) {
				setGameState((prev) => ({
					...prev,
					gameStatus: "won",
					attempts: newAttempts,
					showVictory: true,
					correctAnswer: result.correctAnswer,
					guesses: newGuesses,
					isLoading: false,
				}));
			} else {
				if (newAttempts >= gameState.maxAttempts) {
					setGameState((prev) => ({
						...prev,
						gameStatus: "lost",
						attempts: newAttempts,
						correctAnswer: result.correctAnswer,
						guesses: newGuesses,
						isLoading: false,
					}));
				} else {
					setGameState((prev) => ({
						...prev,
						attempts: newAttempts,
						userGuess: "",
						guesses: newGuesses,
						isLoading: false,
					}));
				}
			}
		} catch (error) {
			console.error("Error submitting guess:", error);
			setGameState((prev) => ({
				...prev,
				showError: true,
				errorMessage: "Error al enviar la respuesta",
				isLoading: false,
			}));
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && gameState.gameStatus === "playing") {
			handleGuess();
		}
	};

	// Función para compartir en WhatsApp
	const shareOnWhatsApp = () => {
		if (!gameState.currentPlayer) return;

		const shareText = generateShareText(
			gameState.guesses,
			gameState.gameStatus === "won",
			gameState.attempts
		);
		const encodedText = encodeURIComponent(shareText);
		const whatsappUrl = `https://wa.me/?text=${encodedText}`;

		window.open(whatsappUrl, "_blank");
	};

	// Función para copiar resultado al portapapeles
	const copyToClipboard = async () => {
		if (!gameState.currentPlayer) return;

		const shareText = generateShareText(
			gameState.guesses,
			gameState.gameStatus === "won",
			gameState.attempts
		);

		try {
			await navigator.clipboard.writeText(shareText);
			alert("¡Resultado copiado al portapapeles!");
		} catch (err) {
			console.error("Error al copiar:", err);
			alert("Error al copiar el resultado");
		}
	};

	const renderGameContent = () => {
		if (gameState.gameStatus === "loading") {
			return (
				<div className="flex items-center justify-center h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
						<p className="text-gray-300">Cargando jugador del día...</p>
					</div>
				</div>
			);
		}

		if (!gameState.currentPlayer) {
			return (
				<div className="text-center p-8">
					<p className="text-red-400 text-xl">
						Error: No se pudo cargar el jugador
					</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{/* Input para la respuesta - ARRIBA DE TODO */}
				{gameState.gameStatus === "playing" && (
					<div className="bg-green-900/50 border-2 border-green-600/50 rounded-lg p-4 shadow-lg shadow-green-900/30">
						<div className="space-y-3">
							<div className="relative">
								<input
									type="text"
									value={gameState.userGuess}
									onChange={(e) =>
										setGameState((prev) => ({
											...prev,
											userGuess: e.target.value,
										}))
									}
									onKeyPress={handleKeyPress}
									placeholder="> Escribe el nombre del jugador..."
									className="w-full px-4 py-3 bg-gray-900/80 border-2 border-green-700 rounded text-green-100 placeholder-green-400 focus:border-green-500 focus:outline-none font-mono"
									disabled={
										gameState.gameStatus !== "playing" ||
										gameState.isLoading
									}
								/>
								{/* Cursor parpadeante */}
								<div className="absolute right-3 top-3 w-2 h-6 bg-green-400 animate-pulse"></div>
							</div>
							<button
								onClick={handleGuess}
								disabled={
									!gameState.userGuess.trim() ||
									gameState.gameStatus !== "playing" ||
									gameState.isLoading
								}
								className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded font-mono transition-colors flex items-center justify-center gap-2 border-2 border-green-500 shadow-lg"
							>
								{gameState.isLoading ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										&gt; VERIFICANDO...
									</>
								) : (
									"> ADIVINAR"
								)}
							</button>
						</div>
					</div>
				)}

				{/* Información del juego */}
				<div className="bg-gray-900/60 border-2 border-green-600/30 rounded-lg p-3 shadow-lg">
					<div className="flex justify-between items-center text-sm text-green-300 font-mono">
						<span className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
							INTENTOS: {gameState.attempts}/{gameState.maxAttempts}
						</span>
						<span className="flex items-center gap-2">
							<span>🇦🇷</span>
							FUTBOLISTA ARGENTINO
						</span>
					</div>
				</div>

				{/* Historial de intentos */}
				{gameState.guesses.length > 0 && (
					<div className="bg-gray-900/20 border-2 border-gray-600/30 rounded-lg p-4 shadow-lg">
						<h4 className="text-sm font-semibold text-gray-300 mb-2 font-mono flex items-center gap-2">
							<span className="w-2 h-2 bg-gray-400 rounded-full"></span>
							HISTORIAL DE INTENTOS:
						</h4>
						<div className="space-y-1">
							{gameState.guesses.map((guess, index) => {
								// Verificar si es el último intento y el juego fue ganado
								const isCorrect =
									gameState.gameStatus === "won" &&
									index === gameState.guesses.length - 1;

								return (
									<div
										key={index}
										className={`flex items-center gap-2 text-sm font-mono ${
											isCorrect ? "text-green-200" : "text-red-200"
										}`}
									>
										<span
											className={
												isCorrect
													? "text-green-400"
													: "text-red-400"
											}
										>
											{isCorrect ? "✓" : "✗"}
										</span>
										<span className="flex-1">{guess}</span>
										{isCorrect && (
											<span className="text-green-400 text-xs">
												¡CORRECTO!
											</span>
										)}
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Pistas - Los clubes (MÁS COMPACTO) */}
				<div className="bg-green-900/40 border-2 border-green-600/50 rounded-lg p-4 shadow-lg shadow-green-900/30">
					<h3 className="text-lg font-bold text-green-400 mb-3 font-mono flex items-center gap-2">
						<span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
						🛡️ CLUBES DONDE JUGÓ:
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						{gameState.currentPlayer.clubs.map((club, index) => (
							<div
								key={index}
								className="bg-gradient-to-br from-green-800/60 to-green-900/60 border-2 border-green-600/40 rounded-lg p-3 text-center shadow-lg hover:shadow-green-600/20 transition-shadow"
							>
								<p className="text-green-100 text-sm font-medium leading-tight font-mono">
									{club}
								</p>
								{/* Detalles pixelados */}
								<div className="flex justify-center gap-1 mt-2">
									<div className="w-1 h-1 bg-green-400 rounded-full"></div>
									<div className="w-1 h-1 bg-green-500 rounded-full"></div>
									<div className="w-1 h-1 bg-green-400 rounded-full"></div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Ayuda para el usuario */}
				<div className="bg-blue-900/20 border-2 border-blue-600/30 rounded-lg p-3 shadow-lg">
					<div className="flex items-center gap-2 text-blue-400 mb-2 font-mono">
						<span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
						<h4 className="text-sm font-semibold">AYUDA:</h4>
					</div>
					<div className="text-xs text-blue-300 space-y-1 font-mono">
						<p>
							• Puedes escribir solo el <strong>APELLIDO</strong> si es
							único
						</p>
						<p>
							• Si hay varios jugadores con el mismo apellido, debes
							escribir el <strong>NOMBRE COMPLETO</strong>
						</p>
						<p>• No es necesario usar tildes o mayúsculas</p>
					</div>
				</div>

				{/* Resultado del juego */}
				{(gameState.gameStatus === "won" ||
					gameState.gameStatus === "lost") && (
					<div className="bg-gradient-to-br from-gray-900/80 to-green-900/40 border-2 border-green-600/50 rounded-lg p-6 shadow-lg shadow-green-900/30 text-center">
						{gameState.gameStatus === "won" ? (
							<div className="text-green-400">
								<div className="text-6xl mb-4">⚽</div>
								<h3 className="text-2xl font-bold mb-2 font-mono tracking-wider">
									¡GOOOOOOOOL!
								</h3>
								<p className="text-lg font-mono">
									Era{" "}
									<span className="font-bold text-green-300 bg-green-900/50 px-2 py-1 rounded">
										{gameState.correctAnswer}
									</span>
								</p>
								<p className="text-sm text-green-200 mt-2 font-mono">
									&gt; Lo adivinaste en {gameState.attempts} intento
									{gameState.attempts !== 1 ? "s" : ""} ⚽
								</p>
								{/* Efectos de victoria */}
								<div className="flex justify-center gap-2 mt-4">
									<div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
									<div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
									<div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
								</div>
							</div>
						) : (
							<div className="text-red-400">
								<div className="text-6xl mb-4">🟥</div>
								<h3 className="text-2xl font-bold mb-2 font-mono tracking-wider">
									¡TARJETA ROJA!
								</h3>
								<p className="text-lg font-mono">
									Era{" "}
									<span className="font-bold text-red-300 bg-red-900/50 px-2 py-1 rounded">
										{gameState.correctAnswer}
									</span>
								</p>
								<p className="text-sm text-red-200 mt-2 font-mono">
									&gt; Usaste todos los {gameState.maxAttempts}{" "}
									intentos
								</p>
								{/* Efectos de derrota */}
								<div className="flex justify-center gap-2 mt-4">
									<div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
									<div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
									<div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-200"></div>
								</div>
							</div>
						)}

						{gameState.alreadyPlayed && (
							<div className="mt-4 bg-yellow-900/30 border border-yellow-600/50 rounded p-2">
								<p className="text-sm text-yellow-300 font-mono">
									&gt; Ya habías jugado hoy. ¡Vuelve mañana para un
									nuevo desafío!
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		);
	};

	// Mostrar pantalla de bienvenida si no hay usuario
	const showAuthScreen = !userLoading && !user;

	return (
		<>
			{/* Pantalla de bienvenida */}
			{showAuthScreen && (
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-gray-900">
					<div className="text-center max-w-md mx-auto p-6">
						<div className="mb-6">
							<h1 className="text-4xl font-bold text-green-400 font-mono mb-4">
								⚽ ADIVINA EL FUTBOLISTA
							</h1>
							<p className="text-green-300 font-mono mb-4">
								Registro requerido para jugar
							</p>
							<p className="text-green-300/80 font-mono text-sm">
								Crea tu perfil para competir en el ranking diario
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<button
								onClick={() => {
									setAuthMode("signup");
									setShowAuthModal(true);
								}}
								className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105"
							>
								✨ REGISTRARSE
							</button>
							<button
								onClick={() => {
									setAuthMode("login");
									setShowAuthModal(true);
								}}
								className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105"
							>
								🔑 INICIAR SESIÓN
							</button>
						</div>
					</div>
				</div>
			)}
			{/* Modal de autenticación siempre montado mientras no hay usuario */}
			{showAuthScreen && (
				<AuthModal
					isOpen={showAuthModal}
					onClose={() => setShowAuthModal(false)}
					onSuccess={() => setShowAuthModal(false)}
					initialMode={authMode}
				/>
			)}
			{/* Juego normal si hay usuario */}
			{!showAuthScreen && (
				<div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-gray-900">
					{/* Efectos de césped pixelado */}
					<div className="absolute inset-0 opacity-10 pointer-events-none">
						<div
							className="absolute top-0 left-0 w-full h-full bg-repeat"
							style={{
								backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.3'%3E%3Cpath d='M20 20.5V18H0v-2h20v2.5zm0 1.5v8h-2v-8h2zm0-13V8H0V6h20v2.5zm0 1.5v8h-2v-8h2z'/%3E%3C/g%3E%3C/svg%3E")`,
							}}
						></div>
					</div>

					<div className="container mx-auto px-4 py-8 relative z-10">
						{/* Header */}
						<div className="text-center mb-8">
							<h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-mono tracking-wider">
								<div className="relative">
									<span className="text-green-400">⚽ </span>
									<span className="bg-gradient-to-r bg-clip-text from-green-400 to-emerald-300 text-transparent">
										ADIVINA EL FUTBOLISTA
									</span>
									<span className="text-green-400"> ⚽</span>
									{/* Efecto pixelado */}
									<div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-300/20 opacity-30 blur-sm -z-10"></div>
								</div>
							</h1>
							<p className="text-green-300 text-lg font-mono tracking-wide">
								&gt; Adivina el jugador argentino basándote en sus
								clubes_
							</p>
						</div>

						{/* Botones de acción */}
						<div className="flex justify-center gap-4 mb-8">
							<button
								onClick={() =>
									setGameState((prev) => ({
										...prev,
										showInstructions: true,
									}))
								}
								className="bg-green-800/80 hover:bg-green-700 border border-green-600 text-green-100 px-6 py-2 rounded font-mono transition-colors shadow-lg hover:shadow-green-500/25"
							>
								📖 INSTRUCCIONES
							</button>
							<button
								onClick={() =>
									setGameState((prev) => ({
										...prev,
										showRanking: true,
									}))
								}
								className="bg-yellow-600/80 hover:bg-yellow-500 border border-yellow-500 text-yellow-100 px-6 py-2 rounded font-mono transition-colors shadow-lg hover:shadow-yellow-500/25"
							>
								🏆 RANKING
							</button>
						</div>

						{/* Contenido del juego */}
						<div className="max-w-4xl mx-auto">{renderGameContent()}</div>

						{/* Modales */}
						<GameInstructionsModal
							isOpen={gameState.showInstructions}
							onClose={() =>
								setGameState((prev) => ({
									...prev,
									showInstructions: false,
								}))
							}
							title="Instrucciones - Adivina el Futbolista"
							instructions={[
								"Todos los días aparece un nuevo futbolista argentino para adivinar.",
								"Te mostramos 3 clubes en los que jugó el futbolista.",
								"Tienes que adivinar el nombre del jugador.",
								"Puedes escribir el nombre completo o solo el apellido.",
								"El juego acepta tanto nombres como apellidos únicos.",
								"¡Tendrás múltiples intentos hasta adivinarlo!",
								"Comparte tus resultados y compite con otros jugadores.",
							]}
						/>

						<VictoryModal
							isOpen={gameState.showVictory}
							onClose={() =>
								setGameState((prev) => ({
									...prev,
									showVictory: false,
								}))
							}
							attempts={gameState.attempts}
							countryName={gameState.correctAnswer}
							onShareWhatsApp={shareOnWhatsApp}
							onCopyToClipboard={copyToClipboard}
						/>

						<RankingModal
							isOpen={gameState.showRanking}
							onClose={() =>
								setGameState((prev) => ({
									...prev,
									showRanking: false,
								}))
							}
							title="🏆 RANKING - ADIVINA EL FUTBOLISTA"
							subtitle="Los mejores jugadores del juego de fútbol"
							gameType="football"
						/>

						{gameState.showError && (
							<div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
								<div className="bg-gradient-to-br from-red-900/90 to-gray-900/90 border-2 border-red-600/50 p-6 rounded-lg max-w-md w-full mx-4 shadow-xl shadow-red-900/30">
									<h3 className="text-xl font-bold text-red-400 mb-4 font-mono tracking-wider flex items-center gap-2">
										<span className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></span>
										ERROR
									</h3>
									<p className="text-red-200 mb-6 font-mono text-sm">
										&gt; {gameState.errorMessage}
									</p>
									<button
										onClick={() =>
											setGameState((prev) => ({
												...prev,
												showError: false,
											}))
										}
										className="w-full bg-red-600 hover:bg-red-500 border-2 border-red-500 text-white font-bold py-2 px-4 rounded font-mono transition-colors shadow-lg"
									>
										&gt; CERRAR
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
}
