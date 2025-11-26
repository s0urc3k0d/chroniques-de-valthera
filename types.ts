export type UniverseType = 'valthera' | 'hors-univers';

export interface Character {
  id: string;
  name: string;
  species: string;
  class: string;
  description: string;
  player: string;
  imageUrl: string;
}

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