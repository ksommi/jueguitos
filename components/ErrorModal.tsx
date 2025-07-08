"use client";

import React from "react";
import { useError } from "./ErrorProvider";

export const ErrorModal: React.FC = () => {
	const { currentError, clearError } = useError();

	if (!currentError) return null;

	const copyToClipboard = () => {
		const errorText = `
🚨 ERROR EN JUEGUITOS 🚨
Hora: ${currentError.timestamp.toLocaleString()}
Mensaje: ${currentError.message}
${currentError.details ? `Detalles: ${currentError.details}` : ""}

💬 Sacale captura y mandale al pajero de Kevin
    `;
		navigator.clipboard.writeText(errorText.trim());
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
			<div className="max-w-md mx-4 relative">
				{/* Efectos de fondo del modal */}
				<div className="absolute inset-0 bg-gradient-to-br from-red-900/90 via-red-800/90 to-pink-900/90 rounded-xl blur-sm"></div>
				<div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-red-500/30 to-pink-600/20 rounded-xl"></div>

				{/* Contenido del modal */}
				<div className="relative bg-gray-900/95 border-2 border-red-500/50 rounded-xl p-6 shadow-2xl">
					{/* Header con icono de error pixelado */}
					<div className="flex items-center mb-4">
						<div className="w-8 h-8 mr-3 pixel-font text-red-400 text-2xl">
							⚠️
						</div>
						<h2 className="text-xl font-bold text-red-400 pixel-font">
							ERROR CRÍTICO
						</h2>
					</div>

					{/* Mensaje principal */}
					<div className="mb-4">
						<p className="text-red-200 pixel-text mb-2">
							{currentError.message}
						</p>
						{currentError.details && (
							<details className="mt-2">
								<summary className="text-red-300 text-sm cursor-pointer hover:text-red-200 pixel-text">
									Ver detalles técnicos
								</summary>
								<pre className="text-xs text-red-300 bg-black/50 p-2 rounded mt-2 overflow-auto max-h-32 border border-red-700/30">
									{currentError.details}
								</pre>
							</details>
						)}
					</div>

					{/* Mensaje personalizado de Kevin */}
					<div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-600/50 rounded-lg p-3 mb-4">
						<div className="flex items-center">
							<span className="text-xl mr-2">📸</span>
							<p className="text-yellow-200 pixel-text text-sm">
								<strong>
									Sacale captura y mandale al pajero de Kevin
								</strong>
							</p>
						</div>
					</div>

					{/* Timestamp */}
					<p className="text-gray-400 text-xs mb-4 pixel-text">
						Error ocurrido: {currentError.timestamp.toLocaleString()}
					</p>

					{/* Botones */}
					<div className="flex gap-3">
						<button
							onClick={copyToClipboard}
							className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg pixel-font text-sm transition-all duration-200 border border-cyan-500/50 hover:border-cyan-400/70 shadow-lg hover:shadow-cyan-500/25"
						>
							📋 COPIAR ERROR
						</button>
						<button
							onClick={clearError}
							className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-lg pixel-font text-sm transition-all duration-200 border border-pink-500/50 hover:border-pink-400/70 shadow-lg hover:shadow-pink-500/25"
						>
							❌ CERRAR
						</button>
					</div>
				</div>

				{/* Efectos decorativos */}
				<div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
				<div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
				<div className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-500 rounded-full animate-ping delay-500"></div>
			</div>
		</div>
	);
};
