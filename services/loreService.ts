import { supabase } from './supabaseClient';
import { LoreArticle, WorldEvent } from '../types/lore';

// ============================================
// ARTICLES LORE
// ============================================

export const getLoreArticles = async (): Promise<LoreArticle[]> => {
  const { data, error } = await supabase
    .from('lore_articles')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching lore articles:', error);
    return [];
  }

  return data?.map(dbToLoreArticle) || [];
};

export const getLoreArticleBySlug = async (slug: string): Promise<LoreArticle | null> => {
  const { data, error } = await supabase
    .from('lore_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching lore article:', error);
    return null;
  }

  return data ? dbToLoreArticle(data) : null;
};

export const getLoreArticlesByCategory = async (category: string): Promise<LoreArticle[]> => {
  const { data, error } = await supabase
    .from('lore_articles')
    .select('*')
    .eq('category', category)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching lore articles by category:', error);
    return [];
  }

  return data?.map(dbToLoreArticle) || [];
};

export const saveLoreArticle = async (article: LoreArticle): Promise<void> => {
  const dbArticle = loreArticleToDb(article);
  
  const { error } = await supabase
    .from('lore_articles')
    .upsert(dbArticle, { onConflict: 'id' });

  if (error) {
    console.error('Error saving lore article:', error);
    throw error;
  }
};

export const deleteLoreArticle = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('lore_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lore article:', error);
    throw error;
  }
};

// ============================================
// ÉVÉNEMENTS CHRONOLOGIE
// ============================================

export const getWorldEvents = async (): Promise<WorldEvent[]> => {
  const { data, error } = await supabase
    .from('world_events')
    .select('*')
    .order('year', { ascending: true });

  if (error) {
    console.error('Error fetching world events:', error);
    return [];
  }

  return data?.map(dbToWorldEvent) || [];
};

export const saveWorldEvent = async (event: WorldEvent): Promise<void> => {
  const dbEvent = worldEventToDb(event);
  
  const { error } = await supabase
    .from('world_events')
    .upsert(dbEvent, { onConflict: 'id' });

  if (error) {
    console.error('Error saving world event:', error);
    throw error;
  }
};

export const deleteWorldEvent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('world_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting world event:', error);
    throw error;
  }
};

// ============================================
// CONVERSION HELPERS
// ============================================

interface DbLoreArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  tags?: string[];
  related_articles?: string[];
  linked_campaigns?: string[];
  created_at: string;
  updated_at: string;
}

interface DbWorldEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  era: string;
  type: string;
  importance: string;
  image_url?: string;
  related_article_id?: string;
  linked_campaign_id?: string;
}

const dbToLoreArticle = (db: DbLoreArticle): LoreArticle => ({
  id: db.id,
  title: db.title,
  slug: db.slug,
  category: db.category as LoreArticle['category'],
  content: db.content,
  excerpt: db.excerpt,
  imageUrl: db.image_url,
  tags: db.tags || [],
  relatedArticles: db.related_articles || [],
  linkedCampaigns: db.linked_campaigns || [],
  createdAt: new Date(db.created_at).getTime(),
  updatedAt: new Date(db.updated_at).getTime(),
});

const loreArticleToDb = (article: LoreArticle): Partial<DbLoreArticle> => ({
  id: article.id,
  title: article.title,
  slug: article.slug,
  category: article.category,
  content: article.content,
  excerpt: article.excerpt,
  image_url: article.imageUrl,
  tags: article.tags,
  related_articles: article.relatedArticles,
  linked_campaigns: article.linkedCampaigns,
});

const dbToWorldEvent = (db: DbWorldEvent): WorldEvent => ({
  id: db.id,
  title: db.title,
  description: db.description,
  year: db.year,
  era: db.era as WorldEvent['era'],
  type: db.type as WorldEvent['type'],
  importance: db.importance as WorldEvent['importance'],
  imageUrl: db.image_url,
  relatedArticleId: db.related_article_id,
  linkedCampaignId: db.linked_campaign_id,
});

const worldEventToDb = (event: WorldEvent): Partial<DbWorldEvent> => ({
  id: event.id,
  title: event.title,
  description: event.description,
  year: event.year,
  era: event.era,
  type: event.type,
  importance: event.importance,
  image_url: event.imageUrl,
  related_article_id: event.relatedArticleId,
  linked_campaign_id: event.linkedCampaignId,
});
