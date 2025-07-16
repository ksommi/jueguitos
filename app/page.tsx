import Link from "next/link";

export default function Home() {
	const games = [
		{
			id: "guiate",
			title: "Guiate",
			description:
				"Adivina el país secreto usando pistas de ubicación en el mapa",
			emoji: "🌍",
			href: "/guiate",
			disabled: false,
		},
		{
			id: "futbolista",
			title: "Adivina el Futbolista",
			description:
				"Adivina el jugador argentino basándote en los clubes donde jugó",
			emoji: "⚽",
			href: "/futbolista",
			disabled: false,
		},
	];

	return (
		<div className="min-h-screen relative">
			<div className="container mx-auto px-4 py-16 relative z-10">
				<header className="text-center mb-16">
					{/* Título con estética 8-bit */}
					<div className="relative mb-6">
						<h1 className="text-5xl md:text-7xl font-black tracking-wider text-white mb-2 relative">
							<span className="inline-block transform hover:scale-110 transition-transform duration-300">
								🎮
							</span>
							<span className="mx-4 bg-gradient-to-r from-lime-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono tracking-widest pixel-font">
								JUEGUITOS
							</span>
							<span className="inline-block transform hover:scale-110 transition-transform duration-300">
								🕹️
							</span>
						</h1>

						{/* Efectos de scanlines */}
						<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent opacity-30 pointer-events-none"></div>

						{/* Bordes pixelados */}
						<div className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400"></div>
						<div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-400"></div>
						<div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-400"></div>
						<div className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400"></div>
					</div>

					{/* Subtítulo con efectos retro */}
					<div className="relative inline-block">
						<div className="bg-gray-900/80 backdrop-blur-sm px-8 py-4 rounded-none border-2 border-lime-400 relative overflow-hidden">
							{/* Efecto de interferencia */}
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-lime-400/20 to-transparent animate-pulse"></div>

							<p className="text-lg md:text-xl text-lime-400 font-mono tracking-wider relative z-10 pixel-text">
								&gt; SI NO VAS A COMPETIR NI JUEGUES
							</p>

							{/* Cursor parpadeante */}
							<span className="inline-block w-2 h-5 bg-lime-400 animate-pulse ml-1"></span>
						</div>

						{/* Píxeles decorativos */}
						<div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-400"></div>
						<div className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400"></div>
						<div className="absolute -bottom-1 -left-1 w-2 h-2 bg-lime-400"></div>
						<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-lime-400"></div>
					</div>

					{/* Elementos decorativos tipo arcade */}
					<div className="flex justify-center items-center mt-8 space-x-8">
						<div className="flex space-x-1">
							<div className="w-3 h-3 bg-red-500 animate-pulse"></div>
							<div className="w-3 h-3 bg-yellow-500 animate-pulse delay-200"></div>
							<div className="w-3 h-3 bg-green-500 animate-pulse delay-400"></div>
						</div>
						<div className="text-cyan-400 font-mono text-sm tracking-widest">
							[ ARCADE MODE ]
						</div>
						<div className="flex space-x-1">
							<div className="w-3 h-3 bg-blue-500 animate-pulse delay-600"></div>
							<div className="w-3 h-3 bg-purple-500 animate-pulse delay-800"></div>
							<div className="w-3 h-3 bg-pink-500 animate-pulse delay-1000"></div>
						</div>
					</div>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{games.map((game) => (
						<Link
							key={game.id}
							href={game.href}
							className={`
                group relative overflow-hidden p-8 transition-all duration-500 transform
                ${
							game.disabled
								? "bg-gray-900/70 backdrop-blur-sm border-2 border-gray-600/50 cursor-not-allowed opacity-50"
								: "bg-gray-900/80 backdrop-blur-sm border-2 border-cyan-400/50 hover:border-lime-400 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25 cursor-pointer"
						}
                shadow-xl pixel-border
              `}
							style={{
								clipPath: game.disabled
									? undefined
									: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
							}}
						>
							{/* Líneas de scanline */}
							<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-50 pointer-events-none"></div>

							{/* Píxeles decorativos en las esquinas */}
							{!game.disabled && (
								<>
									<div className="absolute top-2 left-2 w-2 h-2 bg-lime-400 animate-pulse"></div>
									<div className="absolute top-2 right-2 w-2 h-2 bg-cyan-400 animate-pulse delay-500"></div>
									<div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 animate-pulse delay-1000"></div>
									<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>
								</>
							)}

							<div className="flex flex-col items-center text-center relative z-10">
								<div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 filter group-hover:drop-shadow-lg pixel-emoji">
									{game.emoji}
								</div>
								<h2 className="text-2xl font-bold text-white mb-3 font-mono tracking-wider group-hover:text-lime-400 transition-all duration-300 pixel-title">
									{game.title.toUpperCase()}
								</h2>
								<p className="text-cyan-300 mb-6 group-hover:text-white transition-colors duration-300 font-mono text-sm tracking-wide">
									{game.description}
								</p>
								{!game.disabled && (
									<div className="mt-auto">
										<div className="relative">
											<span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-lime-500 to-cyan-500 text-black font-mono font-bold tracking-wider transition-all duration-300 shadow-lg group-hover:shadow-lime-500/50 transform group-hover:scale-105 pixel-button">
												&gt; Jugar ahora
												<svg
													className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
												</svg>
											</span>
											{/* Bordes pixelados del botón */}
											<div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-400"></div>
											<div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400"></div>
											<div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400"></div>
											<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-lime-400"></div>
										</div>
									</div>
								)}
							</div>
						</Link>
					))}
				</div>

				<footer className="text-center mt-16 relative z-10">
					<div className="inline-block relative">
						{/* Contenedor estilo terminal */}
						<div className="bg-black/80 backdrop-blur-sm border-2 border-lime-400 p-6 relative overflow-hidden">
							{/* Líneas de barrido */}
							<div className="absolute inset-0 bg-gradient-to-b from-transparent via-lime-400/10 to-transparent opacity-50"></div>

							<div className="relative z-10">
								<div className="flex items-center justify-center mb-2">
									<div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
									<div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
								</div>
								<p className="text-lime-400 font-mono text-sm tracking-wider">
									&gt; CARGANDO MÁS JUEGOS...
								</p>
								<div className="flex items-center justify-center mt-2">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-lime-400 animate-bounce"></div>
										<div className="w-2 h-2 bg-lime-400 animate-bounce delay-100"></div>
										<div className="w-2 h-2 bg-lime-400 animate-bounce delay-200"></div>
									</div>
									<span className="text-lime-400 font-mono ml-2 text-lg">
										🚀
									</span>
								</div>
							</div>

							{/* Píxeles en las esquinas */}
							<div className="absolute -top-1 -left-1 w-2 h-2 bg-lime-400"></div>
							<div className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400"></div>
							<div className="absolute -bottom-1 -left-1 w-2 h-2 bg-lime-400"></div>
							<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-lime-400"></div>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
