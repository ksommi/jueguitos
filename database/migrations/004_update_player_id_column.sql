-- Migration: Update player_wikidata_id to player_id
-- Run this in Supabase SQL Editor

-- 1. Cambiar el nombre de la columna player_wikidata_id a player_id
ALTER TABLE daily_players 
RENAME COLUMN player_wikidata_id TO player_id;

-- 2. Actualizar el tipo de datos para que sea más genérico (ya no solo para Wikidata)
ALTER TABLE daily_players 
ALTER COLUMN player_id TYPE VARCHAR(50);

-- 3. Agregar comentario para clarificar el propósito de la columna
COMMENT ON COLUMN daily_players.player_id IS 'Identificador único del jugador generado localmente';
