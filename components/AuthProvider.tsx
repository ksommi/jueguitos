"use client";

import React, { useState, useEffect } from "react";
import {
	signInAnonymously,
	signUpUser,
	signInUser,
	getCurrentUser,
	signOut,
	User,
} from "@/lib/supabase";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signInAnonymous: () => Promise<boolean>;
	signUp: (
		email: string,
		password: string,
		username: string
	) => Promise<boolean>;
	signIn: (email: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Cargar usuario autenticado al iniciar
		checkUser();
	}, []);

	const checkUser = async () => {
		try {
			const { user: authUser, userRecord } = await getCurrentUser();
			if (authUser && userRecord) {
				setUser(userRecord);
			}
		} catch (error) {
			console.error("Error checking user:", error);
		} finally {
			setLoading(false);
		}
	};

	const signInAnonymous = async (): Promise<boolean> => {
		setLoading(true);
		try {
			const { user: authUser, userRecord } = await signInAnonymously();
			if (authUser && userRecord) {
				setUser(userRecord);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Error signing in anonymously:", error);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (
		email: string,
		password: string,
		username: string
	): Promise<boolean> => {
		setLoading(true);
		try {
			const { user: authUser, userRecord } = await signUpUser(
				email,
				password,
				username
			);
			if (authUser && userRecord) {
				setUser(userRecord);
				return true;
			}
			throw new Error("Error al crear la cuenta. Inténtalo de nuevo.");
		} catch (error) {
			console.error("Error signing up:", error);
			throw error; // Re-lanzar el error para que el modal lo capture
		} finally {
			setLoading(false);
		}
	};

	const signIn = async (email: string, password: string): Promise<boolean> => {
		setLoading(true);
		try {
			const { user: authUser, userRecord } = await signInUser(
				email,
				password
			);
			if (authUser && userRecord) {
				setUser(userRecord);
				return true;
			}
			throw new Error(
				"Credenciales incorrectas. Verifica tu email y contraseña."
			);
		} catch (error) {
			console.error("Error signing in:", error);
			throw error; // Re-lanzar el error para que el modal lo capture
		} finally {
			setLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		try {
			await signOut();
			setUser(null);
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				signInAnonymous,
				signUp,
				signIn,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// Componente para modal de autenticación
export function AuthModal({
	isOpen,
	onClose,
	onSuccess,
	initialMode = "signup",
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	initialMode?: "login" | "signup";
}) {
	const [mode, setMode] = useState<"login" | "signup">(initialMode);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { signUp, signIn } = useAuth();

	// Actualizar el modo si cambia el initialMode
	// Solo cambiar el modo si el modal se abre manualmente
	useEffect(() => {
		if (isOpen) {
			setMode(initialMode);
		}
	}, [initialMode, isOpen]);

	// Limpiar campos y error solo cuando el modal se cierra
	useEffect(() => {
		if (!isOpen) {
			setEmail("");
			setPassword("");
			setUsername("");
			setError("");
		}
	}, [isOpen]);

	// Limpiar errores cuando se cambia de modo
	const handleModeChange = (newMode: "login" | "signup") => {
		setMode(newMode);
		setError(""); // Limpiar errores al cambiar de modo
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			if (mode === "signup") {
				if (!username.trim() || username.length < 3) {
					setError(
						"El nombre de usuario debe tener al menos 3 caracteres"
					);
					return;
				}
				if (password.length < 6) {
					setError("La contraseña debe tener al menos 6 caracteres");
					return;
				}
				await signUp(email, password, username);
				// Si llegamos aquí, la autenticación fue exitosa
				setEmail("");
				setPassword("");
				setUsername("");
				setError("");
				onSuccess();
			} else {
				if (!email.trim() || !password.trim()) {
					setError("Por favor completa todos los campos");
					return;
				}
				await signIn(email, password);
				// Si llegamos aquí, la autenticación fue exitosa
				setEmail("");
				setPassword("");
				setUsername("");
				setError("");
				onSuccess();
			}
		} catch (error: unknown) {
			console.error("Error al autenticarse:", error);

			// Manejo específico de errores de Supabase
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			if (
				errorMessage.includes("Invalid login credentials") ||
				errorMessage.includes("Credenciales inválidas") ||
				errorMessage.includes("Error de autenticación")
			) {
				setError("❌ Email o contraseña incorrectos");
			} else if (errorMessage.includes("Email not confirmed")) {
				setError("❌ Debes confirmar tu email antes de iniciar sesión");
			} else if (errorMessage.includes("User already registered")) {
				setError(
					"❌ Este email ya está registrado. Intenta iniciar sesión."
				);
			} else if (errorMessage.includes("Password should be at least")) {
				setError("❌ La contraseña debe tener al menos 6 caracteres");
			} else if (errorMessage.includes("Invalid email")) {
				setError("❌ Formato de email inválido");
			} else if (mode === "signup") {
				setError("❌ Error al crear la cuenta. Inténtalo de nuevo.");
			} else {
				setError("❌ Error al iniciar sesión. Verifica tus credenciales.");
			}
			// No limpiar campos ni cerrar modal si hay error
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
			{/* Modal con estética gamer */}
			<div className="relative w-full max-w-md mx-4">
				{/* Fondo del modal con gradiente gamer */}
				<div className="relative bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 rounded-xl p-6 border border-purple-500/30 shadow-2xl backdrop-blur-md">
					{/* Efectos de luz en las esquinas */}
					<div className="absolute top-0 left-0 w-full h-full rounded-xl bg-gradient-to-br from-cyan-400/10 via-purple-400/5 to-blue-400/10 pointer-events-none"></div>

					{/* Patrón de cuadrícula sutil */}
					<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] rounded-xl pointer-events-none"></div>

					{/* Partículas decorativas */}
					<div className="absolute top-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
					<div className="absolute top-8 left-6 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping delay-500"></div>
					<div className="absolute bottom-6 right-8 w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse delay-1000"></div>

					{/* Contenido del modal */}
					<div className="relative z-10">
						<h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 text-center">
							🎮 AUTENTICACIÓN
						</h2>

						<div className="flex gap-2 mb-6">
							<button
								type="button"
								onClick={() => handleModeChange("login")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
									mode === "login"
										? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/50"
										: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30 hover:border-purple-500/50"
								}`}
							>
								🔑 Iniciar Sesión
							</button>
							<button
								type="button"
								onClick={() => handleModeChange("signup")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
									mode === "signup"
										? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25 border border-pink-400/50"
										: "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30 hover:border-purple-500/50"
								}`}
							>
								✨ Registrarse
							</button>
						</div>

						<form onSubmit={handleSubmit} className="space-y-4">
							{mode === "signup" && (
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">
										👤 Nombre de usuario
									</label>
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
										placeholder="Elige un nombre de usuario"
										required
									/>
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									📧 Email
								</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
									placeholder="tu@email.com"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-300 mb-2">
									🔒 Contraseña
								</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
									placeholder="••••••••"
									required
									minLength={6}
								/>
							</div>

							{error && (
								<div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm">
									<p className="text-red-300 text-sm text-center">
										⚠️ {error}
									</p>
								</div>
							)}

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={onClose}
									className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-200 font-medium backdrop-blur-sm"
								>
									❌ Cancelar
								</button>
								<button
									type="submit"
									disabled={loading}
									className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 border border-purple-400/50"
								>
									{loading
										? "⏳ Cargando..."
										: mode === "signup"
										? "✨ Registrarse"
										: "🔑 Iniciar Sesión"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
