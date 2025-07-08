-- Migration: Create tables for Jueguitos game
-- Run this in Supabase SQL Editor

-- 1. Tabla para países diarios
CREATE TABLE daily_countries (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla para usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_attempts DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla para resultados de juegos
CREATE TABLE game_results (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_country_id INTEGER NOT NULL REFERENCES daily_countries(id),
  won BOOLEAN NOT NULL,
  attempts INTEGER NOT NULL,
  guesses JSONB, -- Array de países adivinados con distancias
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, daily_country_id) -- Un resultado por usuario por día
);

-- 4. Índices para optimizar consultas
CREATE INDEX idx_daily_countries_date ON daily_countries(date);
CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_daily_country_id ON game_results(daily_country_id);
CREATE INDEX idx_game_results_completed_at ON game_results(completed_at);
CREATE INDEX idx_users_username ON users(username);

-- 5. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger para actualizar updated_at en users
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Política RLS (Row Level Security) para usuarios
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_countries ENABLE ROW LEVEL SECURITY;

-- Política para que cualquiera pueda leer daily_countries
CREATE POLICY "Anyone can read daily countries" ON daily_countries
  FOR SELECT USING (true);

-- Política para que los usuarios puedan leer/escribir sus propios datos
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (true);

-- Política para game_results
CREATE POLICY "Users can read their own game results" ON game_results
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own game results" ON game_results
  FOR INSERT WITH CHECK (true);

-- 8. Vista para ranking (optimizada para plan gratuito)
CREATE OR REPLACE VIEW ranking_view AS
SELECT 
  u.id as user_id,
  u.username,
  u.total_wins,
  u.current_streak,
  u.best_streak,
  u.average_attempts,
  u.total_games,
  CASE 
    WHEN u.total_games > 0 
    THEN ROUND((u.total_wins::DECIMAL / u.total_games::DECIMAL) * 100, 2)
    ELSE 0 
  END as win_percentage
FROM users u
WHERE u.total_games > 0
ORDER BY u.total_wins DESC, u.best_streak DESC, u.average_attempts ASC
LIMIT 100; -- Limitar para el plan gratuito

-- 9. Función para generar país del día
CREATE OR REPLACE FUNCTION generate_daily_country()
RETURNS TABLE(country_name TEXT, country_code TEXT) AS $$
DECLARE
  countries TEXT[] := ARRAY[
    'Argentina:AR', 'Brasil:BR', 'Chile:CL', 'Colombia:CO', 'Perú:PE',
    'Uruguay:UY', 'Paraguay:PY', 'Bolivia:BO', 'Venezuela:VE', 'Ecuador:EC',
    'Estados Unidos:US', 'Canadá:CA', 'México:MX', 'España:ES', 'Francia:FR',
    'Italia:IT', 'Alemania:DE', 'Reino Unido:GB', 'Portugal:PT', 'Holanda:NL',
    'Bélgica:BE', 'Suiza:CH', 'Austria:AT', 'Irlanda:IE', 'Suecia:SE',
    'Noruega:NO', 'Dinamarca:DK', 'Finlandia:FI', 'Polonia:PL', 'República Checa:CZ',
    'Rusia:RU', 'China:CN', 'Japón:JP', 'Corea del Sur:KR', 'India:IN',
    'Australia:AU', 'Nueva Zelanda:NZ', 'Sudáfrica:ZA', 'Egipto:EG', 'Marruecos:MA'
  ];
  selected_country TEXT;
  country_parts TEXT[];
  today_date DATE := CURRENT_DATE;
  seed_value INTEGER;
BEGIN
  -- Usar la fecha como semilla para selección pseudoaleatoria
  seed_value := EXTRACT(EPOCH FROM today_date)::INTEGER;
  
  -- Seleccionar país basado en la fecha
  selected_country := countries[1 + (seed_value % array_length(countries, 1))];
  country_parts := string_to_array(selected_country, ':');
  
  country_name := country_parts[1];
  country_code := country_parts[2];
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
