-- ============================================
-- MIGRATION: Wiki/Lore et Chronologie Monde
-- ============================================

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_lore_articles_category ON lore_articles(category);
CREATE INDEX IF NOT EXISTS idx_lore_articles_slug ON lore_articles(slug);
CREATE INDEX IF NOT EXISTS idx_world_events_era ON world_events(era);
CREATE INDEX IF NOT EXISTS idx_world_events_year ON world_events(year);

-- Trigger pour updated_at sur lore_articles
CREATE OR REPLACE FUNCTION update_lore_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_lore_articles_updated_at ON lore_articles;
CREATE TRIGGER trigger_lore_articles_updated_at
    BEFORE UPDATE ON lore_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_lore_articles_updated_at();

-- RLS: Lecture publique pour tous
ALTER TABLE lore_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture publique lore_articles" ON lore_articles;
CREATE POLICY "Lecture publique lore_articles" ON lore_articles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lecture publique world_events" ON world_events;
CREATE POLICY "Lecture publique world_events" ON world_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access lore_articles" ON lore_articles;
CREATE POLICY "Admin full access lore_articles" ON lore_articles
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Admin full access world_events" ON world_events;
CREATE POLICY "Admin full access world_events" ON world_events
    FOR ALL USING (true);

-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================

-- Articles de lore exemple
INSERT INTO lore_articles (id, title, slug, category, content, excerpt, tags) VALUES
(
    gen_random_uuid(),
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
Forêts denses et mystérieuses où vivent les elfes sylvains. On dit que les arbres y murmurent des secrets anciens.

### L''Archipel des Brumes
Îles volcaniques au sud-est, repaire de pirates et de marchands d''épices exotiques.',
    'Le continent principal où se déroulent les aventures de Valthera.',
    ARRAY['géographie', 'continent', 'monde']
),
(
    gen_random_uuid(),
    'La Couronne de Lumière',
    'couronne-lumiere',
    'factions',
    '# La Couronne de Lumière

La Couronne de Lumière est le royaume humain le plus puissant de Valthera. Fondé il y a plus de mille ans après la Guerre des Ombres, il représente l''espoir et la civilisation face aux forces du chaos.

## Organisation

Le royaume est dirigé par un monarque élu par le Conseil des Sept, composé des représentants des grandes maisons nobles.

## L''Ordre des Paladins

L''élite militaire du royaume, les Paladins de la Lumière sont voués à la protection des innocents et à la lutte contre les forces obscures.',
    'Le plus puissant royaume humain de Valthera.',
    ARRAY['faction', 'royaume', 'humains', 'paladins']
),
(
    gen_random_uuid(),
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
5. **L''Ombre** - Illusion et secrets

## Les Mages

Ceux qui manipulent ces essences sont appelés Tisseurs. Leur formation dure une décennie dans les Académies Arcaniques.',
    'Le système magique de Valthera basé sur les Cinq Essences.',
    ARRAY['magie', 'système', 'essences', 'mages']
)
ON CONFLICT (slug) DO NOTHING;

-- Événements chronologiques exemple
INSERT INTO world_events (title, description, year, era, type, importance) VALUES
(
    'La Création du Monde',
    'Selon les mythes, les Dieux Anciens façonnèrent Valthera à partir du chaos primordial. Les cinq Essences naquirent de leur souffle divin.',
    0,
    'age-of-dawn',
    'divine',
    'legendary'
),
(
    'L''Éveil des Premiers Peuples',
    'Les elfes, nains et humains apparurent sur Valthera, guidés par les serviteurs des Dieux.',
    500,
    'age-of-dawn',
    'divine',
    'major'
),
(
    'Fondation de l''Empire Solaire',
    'Les premières cités humaines s''unissent sous la bannière de l''Empereur Solaire, marquant le début de l''Âge des Empires.',
    1001,
    'age-of-empires',
    'founding',
    'legendary'
),
(
    'La Guerre des Mille Lames',
    'Conflit majeur entre l''Empire Solaire et les clans nains pour le contrôle des mines de mithril.',
    1850,
    'age-of-empires',
    'war',
    'major'
),
(
    'L''Invasion des Ombres',
    'Les forces du Seigneur des Ténèbres déferlent sur Valthera, plongeant le monde dans les ténèbres pour trois siècles.',
    2501,
    'age-of-shadows',
    'catastrophe',
    'legendary'
),
(
    'La Chute de l''Empire Solaire',
    'L''Empire s''effondre face aux hordes démoniaques. Les derniers défenseurs se réfugient à Solhaven.',
    2650,
    'age-of-shadows',
    'war',
    'legendary'
),
(
    'La Bataille de l''Aube',
    'L''alliance des races libres vainc le Seigneur des Ténèbres. La Couronne de Lumière est fondée.',
    3201,
    'age-of-rebirth',
    'war',
    'legendary'
),
(
    'Fondation de l''Académie Arcanique',
    'Les mages survivants fondent la première Académie pour préserver et enseigner les arts magiques.',
    3350,
    'age-of-rebirth',
    'founding',
    'major'
),
(
    'Le Couronnement du Roi Aldric III',
    'Le roi actuel monte sur le trône après la mort mystérieuse de son père.',
    3842,
    'current-age',
    'political',
    'minor'
)
ON CONFLICT DO NOTHING;
