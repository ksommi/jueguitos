"use client";

import { useState, useEffect } from "react";

interface GameInstructionsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function GameInstructionsModal({
	isOpen,
	onClose,
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
							🌍 CÓMO JUGAR GUIATE
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
					{/* Objetivo principal */}
					<div className="bg-lime-400/10 border border-lime-400/30 rounded-lg p-4">
						<h3 className="text-lg font-bold text-lime-400 font-mono mb-2">
							🎯 OBJETIVO
						</h3>
						<p className="text-cyan-300 font-mono text-sm">
							Adivina el país secreto del día en la menor cantidad de
							intentos posible.
						</p>
					</div>

					{/* Cómo jugar */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-black/30 p-4 border border-cyan-400/30 rounded-lg">
							<h4 className="font-semibold mb-2 text-cyan-400 font-mono tracking-wider">
								⌨️ CONTROLES
							</h4>
							<ul className="text-cyan-300 font-mono text-sm space-y-1">
								<li>• Escribe el nombre del país</li>
								<li>• Usa las flechas para navegar</li>
								<li>• Presiona Enter para confirmar</li>
							</ul>
						</div>

						<div className="bg-black/30 p-4 border border-cyan-400/30 rounded-lg">
							<h4 className="font-semibold mb-2 text-purple-400 font-mono tracking-wider">
								🎨 COLORES EN EL MAPA
							</h4>
							<div className="space-y-2 text-sm font-mono">
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-red-600 rounded"></div>
									<span className="text-cyan-300">
										CERCA (0-1000km)
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-yellow-500 rounded"></div>
									<span className="text-cyan-300">
										LEJOS (1000-5000km)
									</span>
								</div>
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-yellow-300 rounded"></div>
									<span className="text-cyan-300">
										MUY LEJOS (+5000km)
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Estrategia */}
					<div className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4">
						<h3 className="text-lg font-bold text-purple-400 font-mono mb-2">
							💡 ESTRATEGIA
						</h3>
						<ul className="text-cyan-300 font-mono text-sm space-y-1">
							<li>
								• Empieza con países grandes como Brasil, China, o Rusia
							</li>
							<li>• Observa los colores en el mapa para orientarte</li>
							<li>• La lista de intentos se ordena por distancia</li>
							<li>• Países fronterizos tienen distancia 0</li>
						</ul>
					</div>

					{/* Puntuación */}
					<div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
						<h3 className="text-lg font-bold text-yellow-400 font-mono mb-2">
							🏆 PUNTUACIÓN
						</h3>
						<p className="text-cyan-300 font-mono text-sm">
							Compite en el ranking diario. Menos intentos = mejor
							puntuación. ¡Cada día hay un nuevo país secreto!
						</p>
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
