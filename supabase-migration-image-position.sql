-- ============================================
-- Migration: Ajouter image_position aux personnages
-- ============================================
-- 
-- Exécutez ce script si vous avez déjà créé la base
-- et que vous souhaitez ajouter la fonctionnalité de
-- repositionnement des images de personnages.
--
-- Exécutez dans : Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- Ajouter la colonne image_position à la table characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS image_position JSONB DEFAULT NULL;

-- Commentaire pour documentation
COMMENT ON COLUMN characters.image_position IS 'Position du focus de l''image pour le cadrage. Format: {"x": 50, "y": 50} où x et y sont des pourcentages (0-100)';

-- ============================================
-- FIN DU SCRIPT
-- ============================================
