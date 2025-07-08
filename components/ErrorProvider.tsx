"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ErrorInfo {
	message: string;
	details?: string;
	timestamp: Date;
}

interface ErrorContextType {
	showError: (message: string, details?: string) => void;
	clearError: () => void;
	currentError: ErrorInfo | null;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useError = () => {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error("useError must be used within an ErrorProvider");
	}
	return context;
};

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);

	const showError = (message: string, details?: string) => {
		setCurrentError({
			message,
			details,
			timestamp: new Date(),
		});
	};

	const clearError = () => {
		setCurrentError(null);
	};

	return (
		<ErrorContext.Provider value={{ showError, clearError, currentError }}>
			{children}
		</ErrorContext.Provider>
	);
};
