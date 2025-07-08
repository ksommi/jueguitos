"use client";

import { useState, useEffect } from "react";
import { getRanking, RankingEntry } from "@/lib/supabase";

export default function RankingModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const [ranking, setRanking] = useState<RankingEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (isOpen) {
			loadRanking();
		}
	}, [isOpen]);

	const loadRanking = async () => {
		setLoading(true);
		try {
			const data = await getRanking(50);
			setRanking(data);
		} catch (error) {
			console.error("Error loading ranking:", error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
			<div className="bg-gray-900/95 backdrop-blur-sm border-2 border-cyan-400 shadow-2xl max-w-4xl w-full max-h-[80vh] relative overflow-hidden">
				{/* Efectos de scanline */}
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent opacity-50 pointer-events-none"></div>

				<div className="relative z-10 p-6 h-full flex flex-col">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold text-cyan-400 font-mono tracking-wider">
							🏆 &gt; RANKING GLOBAL
						</h2>
						<button
							onClick={onClose}
							className="text-lime-400 hover:text-cyan-400 text-2xl font-mono transition-colors"
						>
							[X]
						</button>
					</div>

					{loading ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
								<p className="text-cyan-400 font-mono">
									&gt; Cargando ranking...
								</p>
							</div>
						</div>
					) : (
						<div className="flex-1 overflow-auto">
							{ranking.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-cyan-300 font-mono">
										No hay datos de ranking disponibles
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{/* Header */}
									<div className="grid grid-cols-12 gap-2 px-4 py-2 bg-black/50 border border-cyan-400/30 font-mono text-xs text-cyan-300">
										<div className="col-span-1 text-center">#</div>
										<div className="col-span-4">JUGADOR</div>
										<div className="col-span-2 text-center">
											VICTORIAS
										</div>
										<div className="col-span-2 text-center">
											RACHA
										</div>
										<div className="col-span-2 text-center">
											PROMEDIO
										</div>
										<div className="col-span-1 text-center">%</div>
									</div>

									{/* Ranking entries */}
									{ranking.map((entry, index) => (
										<div
											key={entry.user_id}
											className={`grid grid-cols-12 gap-2 px-4 py-3 font-mono text-sm transition-colors
                        ${
									index === 0
										? "bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 border border-yellow-400/50"
										: index === 1
										? "bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400/50"
										: index === 2
										? "bg-gradient-to-r from-amber-600/20 to-amber-400/20 border border-amber-400/50"
										: "bg-black/30 border border-cyan-400/20 hover:border-cyan-400/50"
								}`}
										>
											<div className="col-span-1 text-center text-cyan-400 font-bold">
												{index + 1}
												{index === 0 && " 🥇"}
												{index === 1 && " 🥈"}
												{index === 2 && " 🥉"}
											</div>
											<div className="col-span-4 text-white truncate">
												{entry.username}
											</div>
											<div className="col-span-2 text-center text-lime-400 font-bold">
												{entry.total_wins}
											</div>
											<div className="col-span-2 text-center text-purple-400">
												{entry.best_streak}
												{entry.current_streak > 0 && (
													<span className="text-xs text-cyan-300 ml-1">
														(actual: {entry.current_streak})
													</span>
												)}
											</div>
											<div className="col-span-2 text-center text-cyan-300">
												{entry.average_attempts.toFixed(1)}
											</div>
											<div className="col-span-1 text-center text-pink-400">
												{entry.win_percentage}%
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					<div className="mt-6 text-center">
						<button
							onClick={onClose}
							className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-lime-500 text-black font-mono font-bold tracking-wider transition-colors hover:scale-105"
						>
							&gt; CERRAR
						</button>
					</div>
				</div>

				{/* Píxeles decorativos */}
				<div className="absolute top-2 left-2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
				<div className="absolute top-2 right-2 w-2 h-2 bg-lime-400 animate-pulse delay-500"></div>
				<div className="absolute bottom-2 left-2 w-2 h-2 bg-purple-400 animate-pulse delay-1000"></div>
				<div className="absolute bottom-2 right-2 w-2 h-2 bg-pink-400 animate-pulse delay-300"></div>
			</div>
		</div>
	);
}
