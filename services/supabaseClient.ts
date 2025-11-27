import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyegowbnmlaoqzmczwqg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper pour générer un UUID v4 compatible Supabase
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Types pour les tables Supabase
export interface DbCampaign {
  id: string;
  title: string;
  universe: 'valthera' | 'hors-serie';
  pitch: string;
  status: 'active' | 'completed' | 'paused' | 'hiatus';
  image_url: string | null;
  map_image_url: string | null;
  map_markers: any[] | null;
  bestiary: any[] | null;
  created_at: string;
  updated_at: string;
}

export interface DbCharacter {
  id: string;
  campaign_id: string;
  name: string;
  species: string;
  class: string;
  description: string;
  player: string;
  image_url: string | null;
  is_npc: boolean;
  relations: any[];
  created_at: string;
}

export interface DbChapter {
  id: string;
  campaign_id: string;
  title: string;
  summary: string;
  highlights: string[];
  loot: string[];
  youtube_link: string | null;
  session_date: string;
  order_num: number;
  created_at: string;
  updated_at: string;
}
