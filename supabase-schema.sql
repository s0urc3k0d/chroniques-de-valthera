-- ============================================
-- SCHEMA SUPABASE - Chroniques de Valthera
-- ============================================
-- Exécute ce script dans Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  universe TEXT NOT NULL CHECK (universe IN ('valthera', 'hors-serie')),
  pitch TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des personnages
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT '',
  class TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  player TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des chapitres (sessions)
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  loot TEXT[] DEFAULT '{}',
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  order_num INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_characters_campaign ON characters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_chapters_campaign ON chapters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_universe ON campaigns(universe);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chapters_updated_at ON chapters;
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Permet la lecture publique, écriture réservée aux admins

-- Activer RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tout le monde peut lire)
CREATE POLICY "Lecture publique campagnes" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Lecture publique personnages" ON characters
  FOR SELECT USING (true);

CREATE POLICY "Lecture publique chapitres" ON chapters
  FOR SELECT USING (true);

-- Politique d'écriture (tout le monde pour l'instant, à sécuriser avec Auth0 JWT plus tard)
-- Pour une vraie sécurité, utilise les JWT Auth0 avec Supabase
CREATE POLICY "Écriture campagnes" ON campaigns
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Écriture personnages" ON characters
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Écriture chapitres" ON chapters
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DONNÉES DE DÉMONSTRATION (optionnel)
-- ============================================

INSERT INTO campaigns (id, title, universe, pitch, status, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'L''Ombre du Monolithe', 'valthera', 
   'Dans les terres désolées de Valthera, une ancienne structure émet une énergie corruptrice. Un groupe d''aventuriers improbables doit enquêter avant que la corruption ne s''étende à la capitale.',
   'active', 'https://picsum.photos/id/1033/800/400'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cyber-Heist 2099', 'hors-serie',
   'Neo-Tokyo. Une corpo a volé l''âme numérique d''une IA sentiente. Vous êtes les runners engagés pour la récupérer.',
   'completed', 'https://picsum.photos/id/1076/800/400')
ON CONFLICT (id) DO NOTHING;

INSERT INTO characters (campaign_id, name, species, class, description, player, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Kaelen', 'Elfe Stellaire', 'Mage-Lame',
   'Un guerrier mystique cherchant à racheter son honneur perdu. Il possède une lame ancestrale qui murmure des prophéties oubliées.',
   'Thomas', 'https://picsum.photos/id/1025/200/200'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Brog', 'Orc des Cendres', 'Barbare',
   'Il parle peu, il frappe fort, mais il a un cœur d''or. Ancien gladiateur des fosses de lave.',
   'Sarah', 'https://picsum.photos/id/1005/200/200')
ON CONFLICT DO NOTHING;

INSERT INTO chapters (campaign_id, title, summary, highlights, loot, session_date, order_num) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'L''Appel du Néant',
   'Le groupe se rencontre à la taverne du ''Dernier Soupir''. Une bagarre éclate, révélant les pouvoirs de Kaelen. Un mystérieux commanditaire les approche.',
   ARRAY['La bagarre de taverne épique', 'Rencontre avec l''homme encapuchonné', 'Le vol de la carte'],
   ARRAY['50 pièces d''or', 'Dague rouillée'],
   '2023-10-01', 1)
ON CONFLICT DO NOTHING;
