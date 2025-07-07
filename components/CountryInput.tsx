"use client";

import { useState, useRef, useEffect } from "react";
import { Country } from "@/lib/countries";
import { searchCountriesGeo } from "@/lib/geoData";

interface CountryInputProps {
	onGuess: (country: Country) => void;
	disabled?: boolean;
	alreadyGuessed: Country[];
}

export default function CountryInput({
	onGuess,
	disabled = false,
	alreadyGuessed,
}: CountryInputProps) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<Country[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (query.trim().length >= 3) {
			const results = searchCountriesGeo(query).filter(
				(country: Country) =>
					!alreadyGuessed.some((guessed) => guessed.code === country.code)
			);
			setSuggestions(results);
			setShowSuggestions(true);
			setSelectedIndex(-1);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
	}, [query, alreadyGuessed]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (disabled) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) =>
				prev < suggestions.length - 1 ? prev + 1 : prev
			);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (selectedIndex >= 0 && suggestions[selectedIndex]) {
				handleSelectCountry(suggestions[selectedIndex]);
			} else if (suggestions.length === 1) {
				handleSelectCountry(suggestions[0]);
			}
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
			setSelectedIndex(-1);
		}
	};

	const handleSelectCountry = (country: Country) => {
		onGuess(country);
		setQuery("");
		setSuggestions([]);
		setShowSuggestions(false);
		setSelectedIndex(-1);
		inputRef.current?.focus();
	};

	const handleClickOutside = (e: Event) => {
		if (
			suggestionsRef.current &&
			!suggestionsRef.current.contains(e.target as Node) &&
			inputRef.current &&
			!inputRef.current.contains(e.target as Node)
		) {
			setShowSuggestions(false);
			setSelectedIndex(-1);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative">
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					placeholder={
						disabled
							? "¡Juego terminado!"
							: "Escribe el nombre de un país..."
					}
					className={`
            w-full px-4 py-3 text-lg border-2 rounded-lg focus:outline-none focus:ring-2 transition-all
            ${
					disabled
						? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
						: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800"
				}
          `}
				/>
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
					{disabled ? (
						<span className="text-2xl">🏆</span>
					) : (
						<span className="text-gray-400 text-xl">🌍</span>
					)}
				</div>
			</div>

			{showSuggestions && suggestions.length > 0 && !disabled && (
				<div
					ref={suggestionsRef}
					className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{suggestions.map((country, index) => (
						<button
							key={`${country.code}-${country.name}-${index}`}
							onClick={() => handleSelectCountry(country)}
							className={`
                w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0
                ${
							index === selectedIndex
								? "bg-blue-100 dark:bg-blue-900/40"
								: ""
						}
              `}
						>
							<div className="flex items-center space-x-3">
								<span className="text-lg">🌍</span>
								<span className="font-medium text-gray-800 dark:text-white">
									{country.name}
								</span>
							</div>
						</button>
					))}

					{query.trim().length >= 3 && suggestions.length === 0 && (
						<div className="px-4 py-3 text-gray-500 dark:text-gray-400 italic text-center">
							No se encontraron países que coincidan con &ldquo;{query}
							&rdquo;
						</div>
					)}
				</div>
			)}

			{/* Mensaje cuando hay menos de 3 letras */}
			{query.trim().length > 0 && query.trim().length < 3 && !disabled && (
				<div className="absolute z-10 w-full mt-1 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-4 py-3">
					<div className="text-gray-500 dark:text-gray-400 text-center text-sm">
						Escribe al menos 3 letras para buscar países...
					</div>
				</div>
			)}
		</div>
	);
}
