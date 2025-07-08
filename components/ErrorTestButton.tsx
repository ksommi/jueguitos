"use client";

import React from "react";
import { useError } from "./ErrorProvider";
import { handleGlobalError } from "@/lib/errorHandler";

export const ErrorTestButton: React.FC = () => {
	const { showError } = useError();

	const testError = () => {
		showError(
			"Error de prueba del sistema",
			"Esta es una prueba para verificar que el sistema de errores funciona correctamente. Este error incluye detalles técnicos para debugging."
		);
	};

	const testGlobalError = () => {
		handleGlobalError(
			new Error("Error simulado desde handleGlobalError"),
			"prueba de error global"
		);
	};

	const testJavaScriptError = () => {
		// Simular un error de JavaScript
		throw new Error("Error de JavaScript simulado");
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 space-y-2">
			<button
				onClick={testError}
				className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded pixel-font text-xs transition-colors"
			>
				🧪 TEST ERROR
			</button>
			<button
				onClick={testGlobalError}
				className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded pixel-font text-xs transition-colors"
			>
				🧪 TEST GLOBAL
			</button>
			<button
				onClick={testJavaScriptError}
				className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded pixel-font text-xs transition-colors"
			>
				🧪 TEST JS ERROR
			</button>
		</div>
	);
};
