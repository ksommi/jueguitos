"use client";

import { useState, useEffect } from "react";

interface VictoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	countryName: string;
	attempts: number;
	onShareWhatsApp: () => void;
	onCopyToClipboard: () => void;
}

export default function VictoryModal({
	isOpen,
	onClose,
	countryName,
	attempts,
	onShareWhatsApp,
	onCopyToClipboard,
}: VictoryModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted || !isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop con efecto de celebración */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			></div>

			{/* Modal */}
			<div className="relative bg-gray-900 border-2 border-lime-400/50 shadow-2xl max-w-md w-full">
				{/* Efectos gamer de celebración */}
				<div className="absolute inset-0 bg-gradient-to-r from-lime-400/10 via-cyan-400/10 to-purple-400/10 animate-pulse"></div>

				{/* Partículas de celebración */}
				<div className="absolute top-2 left-2 w-3 h-3 bg-lime-400 animate-ping"></div>
				<div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400 animate-ping delay-300"></div>
				<div className="absolute bottom-2 left-2 w-3 h-3 bg-purple-400 animate-ping delay-600"></div>
				<div className="absolute bottom-2 right-2 w-3 h-3 bg-pink-400 animate-ping delay-900"></div>

				{/* Content */}
				<div className="relative z-10 p-6 text-center">
					{/* Header de victoria */}
					<div className="mb-6">
						<div className="text-4xl mb-3 animate-bounce">🎉</div>
						<h2 className="text-2xl font-bold text-lime-400 font-mono tracking-wider mb-3">
							¡VICTORIA CONSEGUIDA!
						</h2>
						<p className="text-cyan-300 font-mono text-lg">
							¡Completaste{" "}
							<span className="font-bold text-white text-xl">
								{countryName}
							</span>{" "}
							en {attempts} intentos!
						</p>
					</div>

					{/* Estadísticas rápidas */}
					<div className="bg-black/30 border border-cyan-400/30 rounded-lg p-4 mb-6">
						<div className="grid grid-cols-2 gap-4 text-center">
							<div>
								<div className="text-2xl font-bold text-cyan-400 font-mono">
									{attempts}
								</div>
								<div className="text-xs text-cyan-300 font-mono">
									INTENTOS
								</div>
							</div>
							<div>
								<div className="text-2xl font-bold text-lime-400 font-mono">
									{attempts === 1
										? "PERFECTO"
										: attempts <= 3
										? "EXCELENTE"
										: attempts <= 6
										? "BUENO"
										: "COMPLETADO"}
								</div>
								<div className="text-xs text-lime-300 font-mono">
									RESULTADO
								</div>
							</div>
						</div>
					</div>

					{/* Botones de acción */}
					<div className="space-y-3">
						<div className="flex flex-col gap-3">
							<button
								onClick={onShareWhatsApp}
								className="px-4 py-2 bg-green-600 text-white font-mono hover:bg-green-500 transition-colors rounded font-bold tracking-wider text-sm"
							>
								📱 COMPARTIR WHATSAPP
							</button>
							<button
								onClick={onCopyToClipboard}
								className="px-4 py-2 bg-blue-600 text-white font-mono hover:bg-blue-500 transition-colors rounded font-bold tracking-wider text-sm"
							>
								📋 COPIAR RESULTADO
							</button>
						</div>

						<button
							onClick={onClose}
							className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105 rounded text-sm"
						>
							✨ CONTINUAR
						</button>
					</div>

					{/* Mensaje motivacional */}
					<div className="mt-6 text-center">
						<p className="text-cyan-300/80 font-mono text-sm">
							¡Vuelve mañana para un nuevo desafío!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
