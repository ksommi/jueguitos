import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "🎮 Jueguitos - Si no vas a competir ni juegues",
	description:
		"Colección de juegos divertidos y desafiantes. Adivina países, compite y diviértete.",
	keywords: "juegos, games, arcade, retro, gaming, competencia",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative overflow-x-hidden`}
			>
				{/* Fondo base gamer para toda la aplicación */}
				<div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
					{/* Fondo animado con efectos gamer */}
					<div className="absolute inset-0 bg-gradient-to-br from-purple-800/20 via-blue-800/30 to-cyan-800/20"></div>

					{/* Efectos de partículas/luces */}
					<div className="absolute inset-0">
						<div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
						<div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
						<div className="absolute bottom-32 left-16 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-1000"></div>
						<div className="absolute top-60 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-pulse delay-500"></div>
						<div className="absolute bottom-20 right-20 w-2 h-2 bg-green-400 rounded-full animate-ping delay-700"></div>
						<div className="absolute top-32 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
					</div>

					{/* Patrón de cuadrícula sutil */}
					<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

					{/* Gradiente overlay para profundidad */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10"></div>
				</div>

				{/* Contenido de la aplicación */}
				<div className="relative z-10">{children}</div>
			</body>
		</html>
	);
}
