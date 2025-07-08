"use client";

import { useState, useEffect } from "react";

// Página simple de administración para generar nuevos países
export default function AdminPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Verificar si ya está autenticado
	useEffect(() => {
		const authStatus = sessionStorage.getItem("admin_authenticated");
		if (authStatus === "true") {
			setIsAuthenticated(true);
		}
	}, []);

	const handleLogin = async () => {
		try {
			const response = await fetch("/api/admin/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ password }),
			});

			const result = await response.json();

			if (result.success) {
				setIsAuthenticated(true);
				sessionStorage.setItem("admin_authenticated", "true");
				setPassword("");
			} else {
				alert("❌ " + result.message);
				setPassword("");
			}
		} catch {
			alert("❌ Error de conexión");
			setPassword("");
		}
	};

	const handleLogout = () => {
		setIsAuthenticated(false);
		sessionStorage.removeItem("admin_authenticated");
	};

	const handleKeyPress = async (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			await handleLogin();
		}
	};

	const generateNewCountry = async () => {
		try {
			const response = await fetch("/api/daily-country", {
				method: "POST",
			});
			const result = await response.json();

			if (result.success) {
				alert(`¡Nuevo país generado: ${result.data.country_name}!`);
				window.location.reload();
			} else {
				alert(`Error: ${result.error}`);
			}
		} catch (error) {
			alert(`Error: ${error}`);
		}
	};

	const getCurrentCountry = async () => {
		try {
			const response = await fetch("/api/daily-country");
			const result = await response.json();

			if (result.success) {
				alert(
					`País actual: ${result.data.country_name} (${result.data.date})`
				);
			} else {
				alert(`Error: ${result.error}`);
			}
		} catch (error) {
			alert(`Error: ${error}`);
		}
	};

	// Pantalla de login
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
				<div className="max-w-md w-full mx-auto p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-red-400 font-mono mb-4">
							🔒 ACCESO RESTRINGIDO
						</h1>
						<p className="text-cyan-300 font-mono text-sm">
							Solo administradores autorizados
						</p>
					</div>

					<div className="bg-gray-800 border-2 border-red-400/50 p-6 space-y-4">
						<div>
							<label className="block text-red-400 font-mono text-sm mb-2">
								CONTRASEÑA DE ADMINISTRADOR:
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									onKeyPress={handleKeyPress}
									className="w-full px-4 py-2 bg-black border border-red-400/50 text-white font-mono focus:border-red-400 focus:outline-none"
									placeholder="Ingresa la contraseña..."
									autoFocus
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-300"
								>
									{showPassword ? "👁️" : "👁️‍🗨️"}
								</button>
							</div>
						</div>

						<button
							onClick={handleLogin}
							disabled={!password.trim()}
							className="w-full px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-mono font-bold tracking-wider transition-all duration-300"
						>
							🔓 ACCEDER
						</button>

						<div className="text-center text-xs text-gray-400 font-mono mt-4">
							Contacta al desarrollador si necesitas acceso
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Panel de administración (solo si está autenticado)
	return (
		<div className="min-h-screen bg-gray-900 text-white p-8">
			<div className="max-w-md mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-cyan-400 font-mono">
						🌍 GUÍATE ADMIN
					</h1>
					<button
						onClick={handleLogout}
						className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-sm transition-colors"
					>
						🚪 SALIR
					</button>
				</div>

				<div className="space-y-4">
					<button
						onClick={getCurrentCountry}
						className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105"
					>
						📋 VER PAÍS ACTUAL
					</button>

					<button
						onClick={generateNewCountry}
						className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-all duration-300 hover:scale-105"
					>
						🎲 GENERAR NUEVO PAÍS
					</button>

					<div className="mt-8 p-4 bg-gray-800 border border-cyan-400/30">
						<h3 className="text-lime-400 font-mono font-bold mb-2">
							ℹ️ INSTRUCCIONES:
						</h3>
						<ul className="text-sm text-cyan-300 font-mono space-y-1">
							<li>
								• Ver país actual: Muestra qué país está activo hoy
							</li>
							<li>
								• Generar nuevo: Elimina el país actual y crea uno
								aleatorio
							</li>
							<li>• Los países no se repiten en los últimos 7 días</li>
							<li>• La sesión expira al cerrar el navegador</li>
						</ul>
					</div>

					<div className="mt-8 p-4 bg-green-900/20 border border-green-400/30">
						<h3 className="text-green-400 font-mono font-bold mb-2">
							🔒 SEGURIDAD MEJORADA:
						</h3>
						<ul className="text-sm text-green-300 font-mono space-y-1">
							<li>
								• Contraseña protegida en servidor:{" "}
								<span className="text-yellow-400">ADMIN_PASSWORD</span>
							</li>
							<li>• NO expuesta al navegador (segura)</li>
							<li>• Autenticación vía API route</li>
							<li>• Sesión se borra al cerrar navegador</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
