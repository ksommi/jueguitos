"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
	const [dropdownPosition, setDropdownPosition] = useState({
		top: 0,
		left: 0,
		width: 0,
	});
	const [mounted, setMounted] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	// Solo renderizar en el cliente
	useEffect(() => {
		setMounted(true);
	}, []);

	// Calcular posición del dropdown
	const updateDropdownPosition = () => {
		if (inputRef.current) {
			const rect = inputRef.current.getBoundingClientRect();
			setDropdownPosition({
				top: rect.bottom + window.scrollY + 4, // 4px de margen
				left: rect.left + window.scrollX,
				width: rect.width,
			});
		}
	};

	useEffect(() => {
		if (query.trim().length >= 3) {
			const results = searchCountriesGeo(query).filter(
				(country: Country) =>
					!alreadyGuessed.some((guessed) => guessed.code === country.code)
			);
			setSuggestions(results);
			setShowSuggestions(true);
			setSelectedIndex(-1);
			updateDropdownPosition();
		} else if (query.trim().length > 0) {
			// Mostrar mensaje de "escribe al menos 3 letras"
			setSuggestions([]);
			setShowSuggestions(true);
			setSelectedIndex(-1);
			updateDropdownPosition();
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

	// Actualizar posición en scroll/resize
	useEffect(() => {
		const handleResize = () => {
			if (showSuggestions) {
				updateDropdownPosition();
			}
		};

		const handleScroll = () => {
			if (showSuggestions) {
				updateDropdownPosition();
			}
		};

		window.addEventListener("resize", handleResize);
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("scroll", handleScroll);
		};
	}, [showSuggestions]);

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

	// Componente del dropdown que se renderizará como portal
	const DropdownPortal = () => {
		if (!mounted || !showSuggestions || disabled) return null;

		const content = (
			<div
				ref={suggestionsRef}
				className="fixed z-[99999] bg-gray-900/95 backdrop-blur-sm border-2 border-cyan-400/50 shadow-2xl max-h-60 overflow-y-auto"
				style={{
					top: `${dropdownPosition.top}px`,
					left: `${dropdownPosition.left}px`,
					width: `${dropdownPosition.width}px`,
				}}
			>
				{suggestions.length > 0 ? (
					suggestions.map((country, index) => (
						<button
							key={`${country.code}-${country.name}-${index}`}
							onClick={() => handleSelectCountry(country)}
							className={`
								w-full text-left px-3 py-2 hover:bg-cyan-400/20 transition-colors border-b border-cyan-400/20 last:border-b-0 font-mono text-sm
								${index === selectedIndex ? "bg-lime-400/20 border-lime-400/30" : ""}
							`}
						>
							<div className="flex items-center space-x-3">
								<span className="font-medium text-cyan-300">
									{country.name}
								</span>
							</div>
						</button>
					))
				) : query.trim().length >= 3 ? (
					<div className="px-3 py-2 text-cyan-500 italic text-center font-mono text-sm">
						&gt; No se encontraron países: &quot;{query}&quot;
					</div>
				) : null}

				{/* Mensaje cuando hay menos de 3 letras */}
				{query.trim().length > 0 && query.trim().length < 3 && (
					<div className="px-3 py-2 text-purple-400 text-center text-sm font-mono border-purple-400/50">
						&gt; Escribe al menos 3 letras...
					</div>
				)}
			</div>
		);

		return createPortal(content, document.body);
	};

	return (
		<div className="relative">
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					onFocus={() => {
						if (query.trim().length >= 3) {
							setShowSuggestions(true);
							updateDropdownPosition();
						}
					}}
					disabled={disabled}
					placeholder={
						disabled
							? "¡Juego terminado!"
							: "Escribe el nombre de un país..."
					}
					className={`
            w-full px-3 py-2 text-base border-2 focus:outline-none focus:ring-2 transition-all font-mono
            ${
					disabled
						? "bg-gray-900/50 border-gray-600/50 text-gray-500 cursor-not-allowed backdrop-blur-sm"
						: "border-cyan-400/50 bg-gray-900/70 backdrop-blur-sm text-cyan-300 focus:border-lime-400 focus:ring-lime-400/20 placeholder-cyan-500/50"
				}
          `}
				/>
				<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
					{disabled ? (
						<span className="text-lg">🏆</span>
					) : (
						<span className="text-cyan-400 text-lg">🌍</span>
					)}
				</div>
			</div>

			{/* Renderizar dropdown como portal */}
			<DropdownPortal />
		</div>
	);
}
