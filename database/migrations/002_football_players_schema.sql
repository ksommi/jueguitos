-- Migration: Create tables for Football Players game
-- Run this in Supabase SQL Editor

-- 1. Tabla para jugadores diarios
CREATE TABLE daily_players (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  player_name VARCHAR(200) NOT NULL,
  player_surname VARCHAR(100) NOT NULL, -- Apellido del jugador
  surname_is_unique BOOLEAN NOT NULL DEFAULT false, -- Si el apellido es único en la base
  player_wikidata_id VARCHAR(20) NOT NULL, -- El ID de Wikidata (ej: Q615)
  clubs JSONB NOT NULL, -- Array de clubes con sus nombres
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para resultados de juegos de jugadores
CREATE TABLE player_game_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_player_id INTEGER NOT NULL REFERENCES daily_players(id),
  won BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  guesses JSONB, -- Array de jugadores adivinados
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, daily_player_id) -- Un resultado por usuario por día
);

-- 3. Índices para optimizar consultas
CREATE INDEX idx_daily_players_date ON daily_players(date);
CREATE INDEX idx_player_game_results_user_id ON player_game_results(user_id);
CREATE INDEX idx_player_game_results_daily_player_id ON player_game_results(daily_player_id);
CREATE INDEX idx_player_game_results_completed_at ON player_game_results(completed_at);

-- 4. Función para obtener estadísticas del juego de jugadores
CREATE OR REPLACE FUNCTION get_player_game_stats(user_uuid UUID)
RETURNS TABLE(
  total_games INTEGER,
  total_wins INTEGER,
  current_streak INTEGER,
  best_streak INTEGER,
  average_attempts DECIMAL(4,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH user_results AS (
    SELECT 
      pgr.won,
      pgr.attempts,
      pgr.completed_at,
      ROW_NUMBER() OVER (ORDER BY pgr.completed_at DESC) as rn
    FROM player_game_results pgr
    WHERE pgr.user_id = user_uuid
    ORDER BY pgr.completed_at DESC
  ),
  streaks AS (
    SELECT 
      won,
      completed_at,
      ROW_NUMBER() OVER (ORDER BY completed_at DESC) - 
      ROW_NUMBER() OVER (PARTITION BY won ORDER BY completed_at DESC) as streak_group
    FROM user_results
  ),
  current_streak_calc AS (
    SELECT 
      CASE 
        WHEN (SELECT won FROM user_results WHERE rn = 1) THEN
          COUNT(*)
        ELSE 0
      END as current_streak_val
    FROM streaks 
    WHERE won = true AND streak_group = (
      SELECT streak_group FROM streaks WHERE won = true ORDER BY completed_at DESC LIMIT 1
    )
  ),
  best_streak_calc AS (
    SELECT COALESCE(MAX(streak_count), 0) as best_streak_val
    FROM (
      SELECT COUNT(*) as streak_count
      FROM streaks
      WHERE won = true
      GROUP BY streak_group
    ) sub
  )
  SELECT 
    COALESCE((SELECT COUNT(*)::INTEGER FROM user_results), 0) as total_games,
    COALESCE((SELECT COUNT(*)::INTEGER FROM user_results WHERE won = true), 0) as total_wins,
    COALESCE((SELECT current_streak_val FROM current_streak_calc), 0)::INTEGER as current_streak,
    COALESCE((SELECT best_streak_val FROM best_streak_calc), 0)::INTEGER as best_streak,
    COALESCE((SELECT AVG(attempts) FROM user_results WHERE won = true), 0)::DECIMAL(4,2) as average_attempts;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para obtener el ranking del juego de jugadores
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
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
