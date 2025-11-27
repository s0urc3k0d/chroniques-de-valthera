-- ============================================
-- SUPABASE STORAGE - Bucket pour les images
-- ============================================
-- Exécute ce script dans Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- Créer le bucket pour les images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique: Tout le monde peut lire les images
CREATE POLICY "Images publiques en lecture"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Politique: Les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Upload images authentifié"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

-- Politique: Les utilisateurs authentifiés peuvent supprimer leurs images
CREATE POLICY "Delete images authentifié"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

-- Politique: Les utilisateurs authentifiés peuvent mettre à jour
CREATE POLICY "Update images authentifié"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');
