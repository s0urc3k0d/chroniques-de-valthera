-- ============================================
-- MIGRATION: Calendrier & Sessions Planifiées
-- ============================================
-- Exécute ce script dans Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- Table des sessions planifiées
CREATE TABLE IF NOT EXISTS planned_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
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
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent BOOLEAN DEFAULT false,
    
    -- Notes
    gm_notes TEXT, -- Notes privées MJ
    public_notes TEXT, -- Notes publiques
    
    -- Lien avec chapitre créé après la session
    linked_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_planned_sessions_campaign ON planned_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_date ON planned_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_planned_sessions_status ON planned_sessions(status);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_planned_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_planned_sessions_updated_at ON planned_sessions;
CREATE TRIGGER trigger_planned_sessions_updated_at
    BEFORE UPDATE ON planned_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_planned_sessions_updated_at();

-- RLS: Lecture publique
ALTER TABLE planned_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique planned_sessions" ON planned_sessions;
CREATE POLICY "Lecture publique planned_sessions" ON planned_sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access planned_sessions" ON planned_sessions;
CREATE POLICY "Admin full access planned_sessions" ON planned_sessions
    FOR ALL USING (true);

-- ============================================
-- VUE pour faciliter les requêtes
-- ============================================

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
-- DONNÉES DE DÉMONSTRATION
-- ============================================

-- Insérer quelques sessions de démo (ajuster les campaign_id selon vos données)
INSERT INTO planned_sessions (
    campaign_id,
    title,
    description,
    scheduled_date,
    duration,
    status,
    twitch_link,
    players,
    max_players
) 
SELECT 
    id,
    'Session 5 - La Forteresse Oubliée',
    'Après avoir découvert les indices dans la crypte, le groupe se dirige vers l''ancienne forteresse naine. Qu''est-ce qui les attend dans les profondeurs ?',
    NOW() + INTERVAL '7 days',
    240,
    'scheduled',
    'https://twitch.tv/votre_chaine',
    '[{"id": "1", "name": "Thomas", "confirmed": true}, {"id": "2", "name": "Sarah", "confirmed": true}, {"id": "3", "name": "Marc", "confirmed": false}]'::jsonb,
    5
FROM campaigns
WHERE title = 'L''Ombre du Monolithe'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Session passée (pour le test)
INSERT INTO planned_sessions (
    campaign_id,
    title,
    description,
    scheduled_date,
    duration,
    status,
    youtube_link,
    players
)
SELECT 
    id,
    'Session 4 - Les Secrets de la Crypte',
    'Le groupe explore la crypte ancienne sous le temple abandonné. Des révélations sur le passé de Kaelen sont découvertes.',
    NOW() - INTERVAL '14 days',
    210,
    'completed',
    'https://youtube.com/watch?v=example',
    '[{"id": "1", "name": "Thomas", "confirmed": true}, {"id": "2", "name": "Sarah", "confirmed": true}]'::jsonb
FROM campaigns
WHERE title = 'L''Ombre du Monolithe'
LIMIT 1
ON CONFLICT DO NOTHING;
