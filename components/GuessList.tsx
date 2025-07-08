"use client";

import Image from "next/image";
import { Country, getColorByDistance } from "@/lib/countries";

// Función para obtener la URL de la bandera del país
function getFlagUrl(countryCode: string): string {
	// Usar la API de flagcdn para obtener banderas en alta resolución
	return `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`;
}

interface GuessListProps {
	guesses: Array<{
		country: Country;
		distance: number;
	}>;
	onCountryHover?: (country: Country | null) => void;
	onCountryClick?: (country: Country) => void; // Nueva prop para clic
	highlightedCountry?: Country | null;
	targetCountry?: Country | null; // Nueva prop para detectar aciertos
}

export default function GuessList({
	guesses,
	onCountryHover,
	onCountryClick,
	highlightedCountry,
	targetCountry,
}: GuessListProps) {
	if (guesses.length === 0) {
		return (
			<div className="h-full flex flex-col">
				<h3 className="text-xl font-bold text-white mb-4 text-center lg:text-left p-6 pb-0">
					📝 Tus Intentos
				</h3>
				<div className="flex-1 flex items-center justify-center p-6">
					<p className="text-gray-500 dark:text-gray-400 text-center italic">
						Aún no has hecho ningún intento. ¡Empieza adivinando un país!
					</p>
				</div>
			</div>
		);
	}

	// Ordenar por distancia (más cerca primero)
	const sortedGuesses = [...guesses].sort((a, b) => a.distance - b.distance);

	return (
		<div className="h-full flex flex-col p-6">
			<h3 className="text-xl font-bold text-white mb-4 text-center lg:text-left">
				📝 Tus Intentos ({guesses.length})
			</h3>
			<div className="flex-1 space-y-3 overflow-y-auto lg:max-h-none max-h-96">
				{sortedGuesses.map((guess, index) => {
					const isClosest = index === 0;
					const isHighlighted =
						highlightedCountry?.code === guess.country.code;
					const isCorrectGuess =
						targetCountry?.code === guess.country.code;
					return (
						<div
							key={`${guess.country.code}-${index}`}
							className={`
                flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                ${
							isCorrectGuess
								? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 shadow-md"
								: isClosest
								? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 shadow-md"
								: isHighlighted
								? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 shadow-md"
								: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
						}
              `}
							onMouseEnter={() => onCountryHover?.(guess.country)}
							onMouseLeave={() => onCountryHover?.(null)}
							onClick={() => onCountryClick?.(guess.country)}
						>
							<div className="flex items-center space-x-3">
								<div className="relative">
									<div
										className="w-8 h-6 rounded border-2 shadow-sm p-0.5"
										style={{
											borderColor: isCorrectGuess
												? "#10b981" // Verde para el país correcto
												: getColorByDistance(guess.distance),
										}}
									>
										<Image
											src={getFlagUrl(guess.country.code)}
											alt={`Bandera de ${guess.country.name}`}
											width={32}
											height={24}
											className="w-full h-full rounded object-cover"
											onError={(e) => {
												// Fallback si la bandera no se puede cargar
												const target = e.target as HTMLImageElement;
												target.style.display = "none";
												const fallback =
													target.nextElementSibling as HTMLElement;
												if (fallback)
													fallback.style.display = "flex";
											}}
										/>
										<div
											className="w-full h-full rounded bg-gray-200 dark:bg-gray-600 items-center justify-center text-xs hidden"
											style={{ display: "none" }}
										>
											🏳️
										</div>
									</div>
									{isCorrectGuess && (
										<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
											<span className="text-white text-xs">✓</span>
										</div>
									)}
									{isClosest && !isCorrectGuess && (
										<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
											<span className="text-white text-xs">🎯</span>
										</div>
									)}
								</div>
								<div>
									<h4 className="font-semibold text-gray-800 dark:text-white">
										{guess.country.name}
									</h4>
									{isCorrectGuess ? (
										<p className="text-xs text-green-600 dark:text-green-400 font-medium">
											¡Acertaste! 🎉
										</p>
									) : (
										isClosest && (
											<p className="text-xs text-green-600 dark:text-green-400 font-medium">
												¡Más cerca hasta ahora!
											</p>
										)
									)}
								</div>
							</div>

							<div className="text-right">
								<div className="flex items-center space-x-2">
									<span className="text-lg font-bold text-gray-800 dark:text-white">
										{guess.distance.toLocaleString()}
									</span>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										km
									</span>
								</div>
								<div className="text-xs text-gray-400 dark:text-gray-500">
									{getDistanceText(guess.distance)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{guesses.length > 0 && (
				<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
					<div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
						<span>Mejor intento:</span>
						<span className="font-semibold">
							{sortedGuesses[0].country.name} (
							{sortedGuesses[0].distance.toLocaleString()} km)
						</span>
					</div>
				</div>
			)}
		</div>
	);
}

function getDistanceText(distance: number): string {
	if (distance === 0) return "¡País fronterizo!";
	if (distance < 100) return "¡Muy cerca!";
	if (distance < 500) return "Cerca";
	if (distance < 1000) return "Relativamente cerca";
	if (distance < 2500) return "Distancia media";
	if (distance < 5000) return "Lejos";
	if (distance < 10000) return "Muy lejos";
	return "Extremadamente lejos";
}
