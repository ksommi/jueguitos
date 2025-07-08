"use client";

import { useEffect } from "react";
import { useError } from "./ErrorProvider";
import {
	setGlobalErrorHandler,
	setupGlobalErrorHandling,
} from "@/lib/errorHandler";

export const ErrorSetup: React.FC = () => {
	const { showError } = useError();

	useEffect(() => {
		// Configurar el manejador global de errores
		setGlobalErrorHandler(showError);

		// Configurar listeners globales para errores
		setupGlobalErrorHandling();
	}, [showError]);

	return null; // Este componente no renderiza nada
};
