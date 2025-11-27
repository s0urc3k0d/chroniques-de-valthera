-- ============================================
-- MISE À JOUR DU SCHEMA - Ajout colonnes manquantes
-- ============================================
-- Exécute ce script dans Supabase SQL Editor

-- Modifier le type status pour accepter 'hiatus'
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'completed', 'paused', 'hiatus'));

-- Ajouter colonne youtube_link aux chapitres
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS youtube_link TEXT;

-- Ajouter colonne is_npc aux personnages
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS is_npc BOOLEAN DEFAULT false;

-- Ajouter colonne relations aux personnages (JSONB)
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS relations JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- CARTE INTERACTIVE & BESTIAIRE
-- ============================================

-- Ajouter colonnes pour la carte interactive
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS map_image_url TEXT;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS map_markers JSONB DEFAULT '[]'::jsonb;

-- Ajouter colonne pour le bestiaire (stocké en JSONB dans la campagne)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS bestiary JSONB DEFAULT '[]'::jsonb;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier les colonnes de campaigns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;

-- Vérifier les colonnes de characters
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'characters'
ORDER BY ordinal_position;

-- Vérifier les colonnes de chapters
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'chapters'
ORDER BY ordinal_position;
