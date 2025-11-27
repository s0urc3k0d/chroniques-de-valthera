// ============================================
// WIKI / LORE
// ============================================

export interface LoreArticle {
  id: string;
  title: string;
  slug: string; // URL-friendly identifier
  category: LoreCategory;
  content: string; // Markdown
  excerpt?: string; // Résumé court
  imageUrl?: string;
  tags?: string[];
  relatedArticles?: string[]; // IDs d'articles liés
  linkedCampaigns?: string[]; // IDs de campagnes liées
  createdAt: number;
  updatedAt: number;
}

export type LoreCategory = 
  | 'geography'   // Géographie: continents, régions, villes
  | 'history'     // Histoire: ères, guerres, événements
  | 'factions'    // Factions: guildes, royaumes, organisations
  | 'characters'  // Personnages importants du lore
  | 'magic'       // Magie: systèmes, écoles, artefacts
  | 'religion'    // Religion: dieux, cultes, rituels
  | 'creatures'   // Créatures: races, monstres
  | 'culture'     // Culture: traditions, langues, arts
  | 'misc';       // Divers

export const loreCategoryLabels: Record<LoreCategory, string> = {
  geography: 'Géographie',
  history: 'Histoire',
  factions: 'Factions',
  characters: 'Personnages',
  magic: 'Magie',
  religion: 'Religion',
  creatures: 'Créatures',
  culture: 'Culture',
  misc: 'Divers',
};

export const loreCategoryIcons: Record<LoreCategory, string> = {
  geography: '🗺️',
  history: '📜',
  factions: '⚔️',
  characters: '👤',
  magic: '✨',
  religion: '🙏',
  creatures: '🐉',
  culture: '🎭',
  misc: '📚',
};

// ============================================
// CHRONOLOGIE MONDE
// ============================================

export interface WorldEvent {
  id: string;
  title: string;
  description: string;
  year: number; // Année dans le calendrier de Valthera
  era: WorldEra;
  type: EventType;
  importance: 'minor' | 'major' | 'legendary';
  imageUrl?: string;
  relatedArticleId?: string; // Lien vers article wiki
  linkedCampaignId?: string; // Si lié à une campagne
}

export type WorldEra = 
  | 'age-of-dawn'      // L'Âge de l'Aube
  | 'age-of-empires'   // L'Âge des Empires
  | 'age-of-shadows'   // L'Âge des Ombres
  | 'age-of-rebirth'   // L'Âge du Renouveau
  | 'current-age';     // L'Âge Actuel

export type EventType = 
  | 'war'        // Guerre/Conflit
  | 'discovery'  // Découverte
  | 'founding'   // Fondation
  | 'catastrophe'// Catastrophe
  | 'political'  // Événement politique
  | 'magical'    // Événement magique
  | 'divine';    // Événement divin

export const worldEraLabels: Record<WorldEra, string> = {
  'age-of-dawn': "L'Âge de l'Aube",
  'age-of-empires': "L'Âge des Empires",
  'age-of-shadows': "L'Âge des Ombres",
  'age-of-rebirth': "L'Âge du Renouveau",
  'current-age': "L'Âge Actuel",
};

export const worldEraColors: Record<WorldEra, string> = {
  'age-of-dawn': 'bg-yellow-500',
  'age-of-empires': 'bg-purple-500',
  'age-of-shadows': 'bg-slate-700',
  'age-of-rebirth': 'bg-green-500',
  'current-age': 'bg-valthera-500',
};

export const worldEraYears: Record<WorldEra, { start: number; end: number | null }> = {
  'age-of-dawn': { start: 0, end: 1000 },
  'age-of-empires': { start: 1001, end: 2500 },
  'age-of-shadows': { start: 2501, end: 3200 },
  'age-of-rebirth': { start: 3201, end: 3800 },
  'current-age': { start: 3801, end: null },
};

export const eventTypeLabels: Record<EventType, string> = {
  war: 'Guerre',
  discovery: 'Découverte',
  founding: 'Fondation',
  catastrophe: 'Catastrophe',
  political: 'Politique',
  magical: 'Magie',
  divine: 'Divin',
};

export const eventTypeIcons: Record<EventType, string> = {
  war: '⚔️',
  discovery: '🔍',
  founding: '🏰',
  catastrophe: '💥',
  political: '👑',
  magical: '✨',
  divine: '✝️',
};
