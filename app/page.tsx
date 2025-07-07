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
		},
		// Aquí puedes agregar más juegos en el futuro
		{
			id: "coming-soon",
			title: "Próximamente...",
			description: "Más juegos divertidos están en camino",
			emoji: "🎮",
			href: "#",
			disabled: true,
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-16">
				<header className="text-center mb-16">
					<h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-4">
						🎮 Jueguitos
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300">
						Si no vas a competir ni juegues
					</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
					{games.map((game) => (
						<Link
							key={game.id}
							href={game.href}
							className={`
                group relative overflow-hidden rounded-2xl p-8 transition-all duration-300
                ${
							game.disabled
								? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50"
								: "bg-white dark:bg-gray-800 hover:scale-105 hover:shadow-2xl cursor-pointer"
						}
                shadow-lg
              `}
						>
							<div className="flex flex-col items-center text-center">
								<div className="text-6xl mb-4">{game.emoji}</div>
								<h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
									{game.title}
								</h2>
								<p className="text-gray-600 dark:text-gray-300 mb-6">
									{game.description}
								</p>
								{!game.disabled && (
									<div className="mt-auto">
										<span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-medium group-hover:bg-blue-700 transition-colors">
											Jugar ahora
											<svg
												className="ml-2 w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 5l7 7-7 7"
												/>
											</svg>
										</span>
									</div>
								)}
							</div>
						</Link>
					))}
				</div>

				<footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
					<p>¡Más juegos próximamente! 🚀</p>
				</footer>
			</div>
		</div>
	);
}
