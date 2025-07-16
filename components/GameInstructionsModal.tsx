"use client";

import { useState, useEffect } from "react";

interface GameInstructionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	instructions?: string[];
}

export default function GameInstructionsModal({
	isOpen,
	onClose,
	title = "🌍 CÓMO JUGAR GUIATE",
	instructions = [
		"Todos los días aparece un nuevo país para adivinar.",
		"Te mostramos una silueta del país en el mapa.",
		"Tienes que adivinar de qué país se trata.",
		"Puedes escribir el nombre del país en español.",
		"El juego acepta tanto nombres oficiales como informales.",
		"¡Solo tienes una oportunidad por día!",
		"Comparte tus resultados y compite con otros jugadores.",
	],
}: GameInstructionsModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="relative bg-gray-900 border-2 border-cyan-400/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				{/* Efectos gamer */}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-50 pointer-events-none"></div>

				{/* Header */}
				<div className="relative z-10 p-6 border-b border-cyan-400/30">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="text-cyan-400 hover:text-lime-400 transition-colors text-2xl font-mono"
						>
							✕
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="relative z-10 p-6 space-y-6">
					{/* Instrucciones principales */}
					<div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4">
						<h3 className="text-lg font-bold text-lime-400 font-mono mb-3">
							📋 INSTRUCCIONES
						</h3>
						<ul className="text-cyan-300 font-mono text-sm space-y-2">
							{instructions.map((instruction, index) => (
								<li key={index} className="flex items-start space-x-2">
									<span className="text-lime-400">•</span>
									<span>{instruction}</span>
								</li>
							))}
						</ul>
					</div>

					{/* Botón de continuar */}
					<div className="text-center pt-4">
						<button
							onClick={onClose}
							className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-lime-400"
						>
							¡EMPEZAR A JUGAR! 🚀
						</button>
					</div>
				</div>

				{/* Píxeles decorativos */}
				<div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
				<div className="absolute top-2 right-2 w-2 h-2 bg-lime-400 animate-pulse delay-500"></div>
				<div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 animate-pulse delay-1000"></div>
				<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>
			</div>
		</div>
	);
}
