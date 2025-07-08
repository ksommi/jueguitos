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
			return false;
		} catch (error) {
			console.error("Error signing up:", error);
			return false;
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
			return false;
		} catch (error) {
			console.error("Error signing in:", error);
			return false;
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
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const [mode, setMode] = useState<"login" | "signup" | "anonymous">(
		"anonymous"
	);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const { signInAnonymous, signUp, signIn } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			let success = false;

			if (mode === "anonymous") {
				success = await signInAnonymous();
			} else if (mode === "signup") {
				if (!username.trim() || username.length < 3) {
					setError(
						"El nombre de usuario debe tener al menos 3 caracteres"
					);
					return;
				}
				success = await signUp(email, password, username);
			} else {
				success = await signIn(email, password);
			}

			if (success) {
				onClose();
			} else {
				setError("Error al autenticarse. Inténtalo de nuevo.");
			}
		} catch (error) {
			console.error("Error al autenticarse:", error);
			setError("Error al autenticarse. Inténtalo de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
				<h2 className="text-xl font-bold mb-4">Autenticación</h2>

				<div className="flex gap-2 mb-4">
					<button
						onClick={() => setMode("anonymous")}
						className={`px-3 py-1 rounded text-sm ${
							mode === "anonymous"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
					>
						Anónimo
					</button>
					<button
						onClick={() => setMode("login")}
						className={`px-3 py-1 rounded text-sm ${
							mode === "login"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
					>
						Iniciar Sesión
					</button>
					<button
						onClick={() => setMode("signup")}
						className={`px-3 py-1 rounded text-sm ${
							mode === "signup"
								? "bg-blue-600 text-white"
								: "bg-gray-200 text-gray-700"
						}`}
					>
						Registrarse
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === "anonymous" ? (
						<p className="text-gray-600 text-sm">
							Continúa como usuario anónimo. Podrás jugar pero no se
							guardarán tus estadísticas permanentemente.
						</p>
					) : (
						<>
							{mode === "signup" && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Nombre de usuario
									</label>
									<input
										type="text"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Elige un nombre de usuario"
										required
									/>
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="tu@email.com"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Contraseña
								</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="••••••••"
									required
									minLength={6}
								/>
							</div>
						</>
					)}

					{error && <p className="text-red-600 text-sm">{error}</p>}

					<div className="flex gap-3">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
						>
							{loading
								? "Cargando..."
								: mode === "anonymous"
								? "Continuar"
								: mode === "signup"
								? "Registrarse"
								: "Iniciar Sesión"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
