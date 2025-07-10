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
				<h3 className="text-sm font-bold text-white mb-3 text-center lg:text-left p-4 pb-0 font-mono tracking-wider">
					📝 TUS INTENTOS
				</h3>
				<div className="flex-1 flex items-center justify-center p-4">
					<p className="text-gray-500 dark:text-gray-400 text-center italic text-sm font-mono">
						Aún no has hecho ningún intento. ¡Empieza adivinando un país!
					</p>
				</div>
			</div>
		);
	}

	// Ordenar por distancia (más cerca primero)
	const sortedGuesses = [...guesses].sort((a, b) => a.distance - b.distance);

	return (
		<div className="h-full flex flex-col p-4">
			<h3 className="text-sm font-bold text-white mb-3 text-center lg:text-left font-mono tracking-wider">
				📝 TUS INTENTOS ({guesses.length})
			</h3>
			<div className="flex-1 overflow-y-auto lg:max-h-none max-h-96">
				{/* Grid de dos columnas siempre */}
				<div className="grid grid-cols-2 gap-1.5 sm:gap-2">
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
                  flex items-center justify-between p-1.5 sm:p-2 rounded border transition-all cursor-pointer text-xs sm:text-sm
                  ${
							isCorrectGuess
								? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600"
								: isClosest
								? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600"
								: isHighlighted
								? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600"
								: "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
						}
                `}
								onMouseEnter={() => onCountryHover?.(guess.country)}
								onMouseLeave={() => onCountryHover?.(null)}
								onClick={() => onCountryClick?.(guess.country)}
							>
								<div className="flex items-center space-x-1.5 sm:space-x-2">
									<div className="relative">
										<div
											className="w-6 h-4 rounded border shadow-sm p-0.5"
											style={{
												borderColor: isCorrectGuess
													? "#10b981"
													: getColorByDistance(guess.distance),
											}}
										>
											<Image
												src={getFlagUrl(guess.country.code)}
												alt={`${guess.country.name}`}
												width={24}
												height={16}
												className="w-full h-full rounded object-cover"
												onError={(e) => {
													const target =
														e.target as HTMLImageElement;
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
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
												<span className="text-white text-xs">
													✓
												</span>
											</div>
										)}
										{isClosest && !isCorrectGuess && (
											<div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
												<span className="text-white text-xs">
													🎯
												</span>
											</div>
										)}
									</div>
									<div className="min-w-0 flex-1">
										<h4 className="font-semibold text-gray-800 dark:text-white text-xs truncate">
											{guess.country.name}
										</h4>
									</div>
								</div>

								<div className="text-right">
									<div className="text-xs font-bold text-gray-800 dark:text-white">
										{guess.distance} km
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{guesses.length > 0 && (
				<div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
					<div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-mono">
						<span>Mejor:</span>
						<span className="font-semibold">
							{sortedGuesses[0].country.name} (
							{sortedGuesses[0].distance} km)
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
