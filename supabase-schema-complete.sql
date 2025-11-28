-- ============================================
-- CHRONIQUES DE VALTHERA - SCHÉMA COMPLET
-- ============================================
-- 
-- Ce fichier contient l'intégralité du schéma Supabase
-- nécessaire au déploiement de l'application.
--
-- Exécute ce script dans : Supabase Dashboard > SQL Editor > New Query
--
-- Version: 1.0.0
-- Date: 2025-11-28
-- ============================================

-- ============================================
-- 1. TABLES PRINCIPALES
-- ============================================

-- Table des campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    universe TEXT NOT NULL CHECK (universe IN ('valthera', 'hors-serie')),
    pitch TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'hiatus')),
    image_url TEXT,
    map_image_url TEXT,
    map_markers JSONB DEFAULT '[]'::jsonb,
    bestiary JSONB DEFAULT '[]'::jsonb,
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
    is_npc BOOLEAN DEFAULT false,
    relations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des chapitres (sessions jouées)
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    highlights TEXT[] DEFAULT '{}',
    loot TEXT[] DEFAULT '{}',
    youtube_link TEXT,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    order_num INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des articles de lore/wiki
CREATE TABLE IF NOT EXISTS lore_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'misc',
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    related_articles UUID[] DEFAULT '{}',
    linked_campaigns UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements de la chronologie
CREATE TABLE IF NOT EXISTS world_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    year INTEGER NOT NULL,
    era TEXT NOT NULL DEFAULT 'current-age',
    type TEXT NOT NULL DEFAULT 'political',
    importance TEXT NOT NULL DEFAULT 'minor',
    image_url TEXT,
    related_article_id UUID REFERENCES lore_articles(id) ON DELETE SET NULL,
    linked_campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des sessions planifiées (calendrier)
CREATE TABLE IF NOT EXISTS planned_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL DEFAULT 180, -- Durée en minutes (3h par défaut)
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    
    -- Diffusion
    twitch_link TEXT,
    youtube_link TEXT,
    is_live BOOLEAN DEFAULT false,
    
    -- Joueurs (stocké en JSONB)
    players JSONB DEFAULT '[]'::jsonb,
    max_players INTEGER,
    
    -- Notifications
    notification_sent BOOLEAN DEFAULT false,
    notification_sent_at TIMESTAMPTZ,
    reminder_sent BOOLEAN DEFAULT false,
    
    -- Notes
    gm_notes TEXT, -- Notes privées MJ
    public_notes TEXT, -- Notes publiques
    
    -- Lien avec chapitre créé après la session
    linked_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEX POUR LES PERFORMANCES
-- ============================================

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_universe ON campaigns(universe);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- Characters
CREATE INDEX IF NOT EXISTS idx_characters_campaign ON characters(campaign_id);

-- Chapters
CREATE INDEX IF NOT EXISTS idx_chapters_campaign ON chapters(campaign_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(campaign_id, order_num);

-- Lore Articles
CREATE INDEX IF NOT EXISTS idx_lore_articles_category ON lore_articles(category);
CREATE INDEX IF NOT EXISTS idx_lore_articles_slug ON lore_articles(slug);

-- World Events
CREATE INDEX IF NOT EXISTS idx_world_events_era ON world_events(era);
CREATE INDEX IF NOT EXISTS idx_world_events_year ON world_events(year);

-- Planned Sessions
CREATE INDEX IF NOT EXISTS idx_planned_sessions_campaign ON planned_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_date ON planned_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_status ON planned_sessions(status);

-- ============================================
-- 3. FONCTIONS ET TRIGGERS
-- ============================================

-- Fonction générique pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
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

DROP TRIGGER IF EXISTS update_lore_articles_updated_at ON lore_articles;
CREATE TRIGGER update_lore_articles_updated_at
    BEFORE UPDATE ON lore_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_planned_sessions_updated_at ON planned_sessions;
CREATE TRIGGER update_planned_sessions_updated_at
    BEFORE UPDATE ON planned_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_sessions ENABLE ROW LEVEL SECURITY;

-- Policies pour campaigns
DROP POLICY IF EXISTS "Lecture publique campagnes" ON campaigns;
CREATE POLICY "Lecture publique campagnes" ON campaigns
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Écriture campagnes" ON campaigns;
CREATE POLICY "Écriture campagnes" ON campaigns
    FOR ALL USING (true) WITH CHECK (true);

-- Policies pour characters
DROP POLICY IF EXISTS "Lecture publique personnages" ON characters;
CREATE POLICY "Lecture publique personnages" ON characters
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Écriture personnages" ON characters;
CREATE POLICY "Écriture personnages" ON characters
    FOR ALL USING (true) WITH CHECK (true);

-- Policies pour chapters
DROP POLICY IF EXISTS "Lecture publique chapitres" ON chapters;
CREATE POLICY "Lecture publique chapitres" ON chapters
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Écriture chapitres" ON chapters;
CREATE POLICY "Écriture chapitres" ON chapters
    FOR ALL USING (true) WITH CHECK (true);

-- Policies pour lore_articles
DROP POLICY IF EXISTS "Lecture publique lore_articles" ON lore_articles;
CREATE POLICY "Lecture publique lore_articles" ON lore_articles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access lore_articles" ON lore_articles;
CREATE POLICY "Admin full access lore_articles" ON lore_articles
    FOR ALL USING (true);

-- Policies pour world_events
DROP POLICY IF EXISTS "Lecture publique world_events" ON world_events;
CREATE POLICY "Lecture publique world_events" ON world_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access world_events" ON world_events;
CREATE POLICY "Admin full access world_events" ON world_events
    FOR ALL USING (true);

-- Policies pour planned_sessions
DROP POLICY IF EXISTS "Lecture publique planned_sessions" ON planned_sessions;
CREATE POLICY "Lecture publique planned_sessions" ON planned_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access planned_sessions" ON planned_sessions;
CREATE POLICY "Admin full access planned_sessions" ON planned_sessions
    FOR ALL USING (true);

-- ============================================
-- 5. VUES UTILITAIRES
-- ============================================

-- Sessions à venir
CREATE OR REPLACE VIEW upcoming_sessions AS
SELECT 
    ps.*,
    c.title as campaign_title,
    c.universe,
    c.image_url as campaign_image
FROM planned_sessions ps
JOIN campaigns c ON ps.campaign_id = c.id
WHERE ps.scheduled_date >= NOW()
  AND ps.status IN ('scheduled', 'live')
ORDER BY ps.scheduled_date ASC;

-- Sessions passées
CREATE OR REPLACE VIEW past_sessions AS
SELECT 
    ps.*,
    c.title as campaign_title,
    c.universe,
    c.image_url as campaign_image
FROM planned_sessions ps
JOIN campaigns c ON ps.campaign_id = c.id
WHERE ps.scheduled_date < NOW()
   OR ps.status IN ('completed', 'cancelled')
ORDER BY ps.scheduled_date DESC;

-- ============================================
-- 6. STORAGE (Images)
-- ============================================

-- Créer le bucket pour les images (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket images
DROP POLICY IF EXISTS "Images publiques en lecture" ON storage.objects;
CREATE POLICY "Images publiques en lecture"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Upload images authentifié" ON storage.objects;
CREATE POLICY "Upload images authentifié"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "Delete images authentifié" ON storage.objects;
CREATE POLICY "Delete images authentifié"
ON storage.objects FOR DELETE
USING (bucket_id = 'images');

DROP POLICY IF EXISTS "Update images authentifié" ON storage.objects;
CREATE POLICY "Update images authentifié"
ON storage.objects FOR UPDATE
USING (bucket_id = 'images');

-- ============================================
-- 7. DONNÉES DE DÉMONSTRATION (optionnel)
-- ============================================
-- Décommentez cette section pour créer des données de test

/*
-- Campagnes de démo
INSERT INTO campaigns (id, title, universe, pitch, status, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001', 
    'L''Ombre du Monolithe', 
    'valthera', 
    'Dans les terres désolées de Valthera, une ancienne structure émet une énergie corruptrice. Un groupe d''aventuriers improbables doit enquêter avant que la corruption ne s''étende à la capitale.',
    'active', 
    'https://picsum.photos/id/1033/800/400'
),
(
    '550e8400-e29b-41d4-a716-446655440002', 
    'Cyber-Heist 2099', 
    'hors-serie',
    'Neo-Tokyo. Une corpo a volé l''âme numérique d''une IA sentiente. Vous êtes les runners engagés pour la récupérer.',
    'completed', 
    'https://picsum.photos/id/1076/800/400'
)
ON CONFLICT (id) DO NOTHING;

-- Personnages de démo
INSERT INTO characters (campaign_id, name, species, class, description, player, image_url) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001', 
    'Kaelen', 
    'Elfe Stellaire', 
    'Mage-Lame',
    'Un guerrier mystique cherchant à racheter son honneur perdu. Il possède une lame ancestrale qui murmure des prophéties oubliées.',
    'Thomas', 
    'https://picsum.photos/id/1025/200/200'
),
(
    '550e8400-e29b-41d4-a716-446655440001', 
    'Brog', 
    'Orc des Cendres', 
    'Barbare',
    'Il parle peu, il frappe fort, mais il a un cœur d''or. Ancien gladiateur des fosses de lave.',
    'Sarah', 
    'https://picsum.photos/id/1005/200/200'
)
ON CONFLICT DO NOTHING;

-- Chapitre de démo
INSERT INTO chapters (campaign_id, title, summary, highlights, loot, session_date, order_num) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001', 
    'L''Appel du Néant',
    'Le groupe se rencontre à la taverne du ''Dernier Soupir''. Une bagarre éclate, révélant les pouvoirs de Kaelen. Un mystérieux commanditaire les approche.',
    ARRAY['La bagarre de taverne épique', 'Rencontre avec l''homme encapuchonné', 'Le vol de la carte'],
    ARRAY['50 pièces d''or', 'Dague rouillée'],
    '2023-10-01', 
    1
)
ON CONFLICT DO NOTHING;

-- Articles de lore de démo
INSERT INTO lore_articles (title, slug, category, content, excerpt, tags) VALUES
(
    'Le Continent de Valthera',
    'continent-valthera',
    'geography',
    '# Le Continent de Valthera

Valthera est le continent principal où se déroulent la majorité des aventures. Entouré par l''Océan des Tempêtes à l''ouest et la Mer de Jade à l''est, il s''étend sur près de trois mille lieues du nord au sud.

## Régions Principales

### Les Terres du Nord
Montagnes glacées habitées par les clans nains et les tribus barbares. Le pic du Dragon Endormi domine la région.

### Le Royaume Central
Vastes plaines fertiles sous la protection de la Couronne de Lumière. La capitale Solhaven est un joyau d''architecture.

### Les Marches du Sud
Forêts denses et mystérieuses où vivent les elfes sylvains. On dit que les arbres y murmurent des secrets anciens.',
    'Le continent principal où se déroulent les aventures de Valthera.',
    ARRAY['géographie', 'continent', 'monde']
),
(
    'La Couronne de Lumière',
    'couronne-lumiere',
    'factions',
    '# La Couronne de Lumière

La Couronne de Lumière est le royaume humain le plus puissant de Valthera. Fondé il y a plus de mille ans après la Guerre des Ombres, il représente l''espoir et la civilisation face aux forces du chaos.

## Organisation

Le royaume est dirigé par un monarque élu par le Conseil des Sept, composé des représentants des grandes maisons nobles.',
    'Le plus puissant royaume humain de Valthera.',
    ARRAY['faction', 'royaume', 'humains', 'paladins']
),
(
    'La Magie Primordiale',
    'magie-primordiale',
    'magic',
    '# La Magie Primordiale

La magie de Valthera puise sa source dans les Cinq Essences Primordiales, des forces cosmiques qui façonnent la réalité.

## Les Cinq Essences

1. **L''Éther** - Source de la magie pure et des enchantements
2. **La Flamme** - Destruction et purification
3. **L''Onde** - Guérison et transformation
4. **La Pierre** - Protection et permanence
5. **L''Ombre** - Illusion et secrets',
    'Le système magique de Valthera basé sur les Cinq Essences.',
    ARRAY['magie', 'système', 'essences', 'mages']
)
ON CONFLICT (slug) DO NOTHING;

-- Événements chronologiques de démo
INSERT INTO world_events (title, description, year, era, type, importance) VALUES
(
    'La Création du Monde',
    'Selon les mythes, les Dieux Anciens façonnèrent Valthera à partir du chaos primordial.',
    0, 'age-of-dawn', 'divine', 'legendary'
),
(
    'L''Éveil des Premiers Peuples',
    'Les elfes, nains et humains apparurent sur Valthera, guidés par les serviteurs des Dieux.',
    500, 'age-of-dawn', 'divine', 'major'
),
(
    'Fondation de l''Empire Solaire',
    'Les premières cités humaines s''unissent sous la bannière de l''Empereur Solaire.',
    1001, 'age-of-empires', 'founding', 'legendary'
),
(
    'La Bataille de l''Aube',
    'L''alliance des races libres vainc le Seigneur des Ténèbres. La Couronne de Lumière est fondée.',
    3201, 'age-of-rebirth', 'war', 'legendary'
)
ON CONFLICT DO NOTHING;

-- Session planifiée de démo
INSERT INTO planned_sessions (campaign_id, title, description, scheduled_date, duration, status, twitch_link, players, max_players)
SELECT 
    id,
    'Session 5 - La Forteresse Oubliée',
    'Après avoir découvert les indices dans la crypte, le groupe se dirige vers l''ancienne forteresse naine.',
    NOW() + INTERVAL '7 days',
    240,
    'scheduled',
    'https://twitch.tv/votre_chaine',
    '[{"id": "1", "name": "Thomas", "confirmed": true}, {"id": "2", "name": "Sarah", "confirmed": true}, {"id": "3", "name": "Marc", "confirmed": false}]'::jsonb,
    5
FROM campaigns
WHERE id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- 
-- Pour vérifier l'installation, exécutez :
-- 
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;
--
-- ============================================
