export type UniverseType = 'valthera' | 'hors-serie';

// ============================================
// MARQUEURS DE CARTE
// ============================================

export interface MapMarker {
  id: string;
  x: number; // Position en % (0-100)
  y: number; // Position en % (0-100)
  label: string;
  type: 'city' | 'dungeon' | 'landmark' | 'camp' | 'battle' | 'quest' | 'treasure' | 'danger';
  description?: string;
  linkedChapterId?: string; // Lien optionnel vers un chapitre
  icon?: string; // Emoji personnalisé
}

// ============================================
// BESTIAIRE
// ============================================

export interface BestiaryCreature {
  id: string;
  name: string;
  type: 'beast' | 'humanoid' | 'undead' | 'dragon' | 'demon' | 'elemental' | 'construct' | 'aberration' | 'celestial' | 'fey' | 'giant' | 'ooze' | 'plant' | 'monstrosity';
  dangerLevel: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly' | 'legendary';
  imageUrl?: string;
  description: string;
  habitat?: string;
  abilities?: string[];
  loot?: string[];
  encounteredInChapter?: string; // ID du chapitre où rencontré
  isDefeated?: boolean;
  notes?: string; // Notes du MJ
}

// ============================================
// PERSONNAGES
// ============================================

export interface Character {
  id: string;
  name: string;
  species: string;
  class: string;
  description: string;
  player: string;
  imageUrl: string;
  isNPC?: boolean; // Personnage non-joueur
  relations?: CharacterRelation[]; // Relations avec autres personnages
}

export interface CharacterRelation {
  targetId: string; // ID du personnage lié
  type: 'ally' | 'enemy' | 'family' | 'romantic' | 'rival' | 'mentor' | 'neutral';
  description?: string; // Description de la relation
}

// ============================================
// CHAPITRES & CAMPAGNES
// ============================================

export interface Chapter {
  id: string;
  campaignId: string;
  title: string;
  summary: string; // Markdown/HTML supported
  highlights: string[]; // Notable moments
  loot?: string[];
  youtubeLink?: string;
  sessionDate: string;
  order: number;
}

export interface Campaign {
  id: string;
  title: string;
  universe: UniverseType;
  pitch: string;
  status: 'active' | 'completed' | 'hiatus';
  imageUrl: string;
  mapImageUrl?: string; // Image de la carte de la campagne
  mapMarkers?: MapMarker[]; // Marqueurs sur la carte
  bestiary?: BestiaryCreature[]; // Créatures rencontrées
  characters: Character[];
  chapters: Chapter[];
  createdAt: number;
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'UNIVERSE', universe: UniverseType }
  | { type: 'CAMPAIGN', campaignId: string }
  | { type: 'ADMIN_LOGIN' }
  | { type: 'ADMIN_DASHBOARD' }
  | { type: 'ADMIN_EDIT_CAMPAIGN', campaignId?: string } // ID missing means create new
  | { type: 'ADMIN_EDIT_CHAPTER', campaignId: string, chapterId?: string }; // ID missing means create new