-- Migration: Create ranking view for Football Players game
-- Run this in Supabase SQL Editor

-- 1. Vista para ranking del juego de jugadores (optimizada para plan gratuito)
CREATE OR REPLACE VIEW player_game_ranking_view AS
SELECT 
  u.id as user_id,
  u.username,
  COUNT(pgr.id)::INTEGER as total_games,
  COUNT(CASE WHEN pgr.won THEN 1 END)::INTEGER as total_wins,
  CASE 
    WHEN COUNT(pgr.id) > 0 THEN 
      ROUND((COUNT(CASE WHEN pgr.won THEN 1 END)::DECIMAL / COUNT(pgr.id)::DECIMAL * 100), 2)
    ELSE 0
  END as win_rate,
  COALESCE(stats.current_streak, 0) as current_streak,
  COALESCE(stats.best_streak, 0) as best_streak,
  COALESCE(stats.average_attempts, 0) as average_attempts
FROM users u
LEFT JOIN player_game_results pgr ON u.id = pgr.user_id
LEFT JOIN LATERAL get_player_game_stats(u.id) stats ON true
GROUP BY u.id, u.username, stats.current_streak, stats.best_streak, stats.average_attempts
HAVING COUNT(pgr.id) > 0
ORDER BY win_rate DESC, total_wins DESC, average_attempts ASC
LIMIT 100; -- Limitar para el plan gratuito

-- 2. Actualizar la función para usar la vista (opcional, pero más eficiente)
CREATE OR REPLACE FUNCTION get_player_game_ranking()
RETURNS TABLE(
  username VARCHAR(50),
  total_games INTEGER,
  total_wins INTEGER,
  win_rate DECIMAL(5,2),
  current_streak INTEGER,
  best_streak INTEGER,
  average_attempts DECIMAL(4,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pgrv.username,
    pgrv.total_games,
    pgrv.total_wins,
    pgrv.win_rate,
    pgrv.current_streak,
    pgrv.best_streak,
    pgrv.average_attempts
  FROM player_game_ranking_view pgrv
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
