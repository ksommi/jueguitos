// Función global para manejar errores
let globalErrorHandler: ((message: string, details?: string) => void) | null =
	null;

export const setGlobalErrorHandler = (
	handler: (message: string, details?: string) => void
) => {
	globalErrorHandler = handler;
};

export const handleGlobalError = (error: unknown, context?: string) => {
	console.error("Error capturado:", error);

	if (globalErrorHandler) {
		const message = context
			? `Error en ${context}`
			: "Ha ocurrido un error inesperado";
		const details =
			error instanceof Error
				? error.message
				: JSON.stringify(error, null, 2);
		globalErrorHandler(message, details);
	}
};

// Wrapper para funciones async que maneja errores automáticamente
export const withErrorHandler = <
	T extends (...args: unknown[]) => Promise<unknown>
>(
	fn: T,
	context: string
): T => {
	return (async (...args: Parameters<T>) => {
		try {
			return await fn(...args);
		} catch (error) {
			handleGlobalError(error, context);
			throw error; // Re-lanzar para mantener el comportamiento original
		}
	}) as T;
};

// Hook para setup global de error handling
export const setupGlobalErrorHandling = () => {
	// Capturar errores no manejados
	window.addEventListener("error", (event) => {
		handleGlobalError(event.error, "Error global no manejado");
	});

	// Capturar promesas rechazadas
	window.addEventListener("unhandledrejection", (event) => {
		handleGlobalError(event.reason, "Promesa rechazada no manejada");
	});
};
