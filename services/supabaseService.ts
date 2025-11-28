import { supabase, DbCampaign, DbCharacter, DbChapter, generateUUID } from './supabaseClient';
import { Campaign, Chapter, Character } from '../types';

// ============================================
// CONVERSION HELPERS
// ============================================

// Vérifie si une chaîne est un UUID valide
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const dbToCampaign = (
  dbCampaign: DbCampaign,
  characters: DbCharacter[],
  chapters: DbChapter[]
): Campaign => ({
  id: dbCampaign.id,
  title: dbCampaign.title,
  universe: dbCampaign.universe,
  pitch: dbCampaign.pitch,
  status: dbCampaign.status === 'paused' ? 'hiatus' : dbCampaign.status,
  imageUrl: dbCampaign.image_url || '',
  mapImageUrl: dbCampaign.map_image_url || undefined,
  mapMarkers: dbCampaign.map_markers || [],
  bestiary: dbCampaign.bestiary || [],
  createdAt: new Date(dbCampaign.created_at).getTime(),
  characters: characters.map(c => ({
    id: c.id,
    name: c.name,
    species: c.species,
    class: c.class,
    description: c.description,
    player: c.player,
    imageUrl: c.image_url || '',
    imagePosition: c.image_position || undefined,
    isNPC: c.is_npc || false,
    relations: c.relations || []
  })),
  chapters: chapters
    .sort((a, b) => a.order_num - b.order_num)
    .map(ch => ({
      id: ch.id,
      campaignId: ch.campaign_id,
      title: ch.title,
      summary: ch.summary,
      highlights: ch.highlights || [],
      loot: ch.loot || [],
      youtubeLink: ch.youtube_link || undefined,
      sessionDate: ch.session_date,
      order: ch.order_num
    }))
});

// ============================================
// READ OPERATIONS
// ============================================

export const getCampaigns = async (): Promise<Campaign[]> => {
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (campError) {
    console.error('Erreur chargement campagnes:', campError);
    return [];
  }

  if (!campaigns || campaigns.length === 0) return [];

  // Charger tous les personnages et chapitres
  const campaignIds = campaigns.map(c => c.id);

  const [{ data: characters }, { data: chapters }] = await Promise.all([
    supabase.from('characters').select('*').in('campaign_id', campaignIds),
    supabase.from('chapters').select('*').in('campaign_id', campaignIds)
  ]);

  return campaigns.map(c => 
    dbToCampaign(
      c as DbCampaign,
      (characters || []).filter(ch => ch.campaign_id === c.id) as DbCharacter[],
      (chapters || []).filter(ch => ch.campaign_id === c.id) as DbChapter[]
    )
  );
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !campaign) {
    console.error('Erreur chargement campagne:', error);
    return null;
  }

  const [{ data: characters }, { data: chapters }] = await Promise.all([
    supabase.from('characters').select('*').eq('campaign_id', id),
    supabase.from('chapters').select('*').eq('campaign_id', id)
  ]);

  return dbToCampaign(
    campaign as DbCampaign,
    (characters || []) as DbCharacter[],
    (chapters || []) as DbChapter[]
  );
};

// ============================================
// WRITE OPERATIONS
// ============================================

export const saveCampaign = async (campaign: Campaign): Promise<boolean> => {
  try {
    // Générer un UUID si l'ID n'est pas valide
    const campaignId = isValidUUID(campaign.id) ? campaign.id : generateUUID();
    
    // Mapper le status pour la DB (hiatus -> paused)
    const dbStatus = campaign.status === 'hiatus' ? 'paused' : campaign.status;
    
    // Upsert campagne
    const { error: campError } = await supabase
      .from('campaigns')
      .upsert({
        id: campaignId,
        title: campaign.title,
        universe: campaign.universe,
        pitch: campaign.pitch,
        status: dbStatus,
        image_url: campaign.imageUrl || null,
        map_image_url: campaign.mapImageUrl || null,
        map_markers: campaign.mapMarkers || [],
        bestiary: campaign.bestiary || [],
        created_at: new Date(campaign.createdAt).toISOString()
      });

    if (campError) throw campError;

    // Supprimer les anciens personnages et chapitres pour cette campagne
    await Promise.all([
      supabase.from('characters').delete().eq('campaign_id', campaignId),
      supabase.from('chapters').delete().eq('campaign_id', campaignId)
    ]);

    // Insérer les nouveaux personnages
    if (campaign.characters.length > 0) {
      const { error: charError } = await supabase
        .from('characters')
        .insert(campaign.characters.map(c => ({
          id: isValidUUID(c.id) ? c.id : generateUUID(),
          campaign_id: campaignId,
          name: c.name,
          species: c.species,
          class: c.class,
          description: c.description,
          player: c.player,
          image_url: c.imageUrl || null,
          image_position: c.imagePosition || null,
          is_npc: c.isNPC || false,
          relations: c.relations || []
        })));

      if (charError) throw charError;
    }

    // Insérer les nouveaux chapitres
    if (campaign.chapters.length > 0) {
      const { error: chapError } = await supabase
        .from('chapters')
        .insert(campaign.chapters.map(ch => ({
          id: isValidUUID(ch.id) ? ch.id : generateUUID(),
          campaign_id: campaignId,
          title: ch.title,
          summary: ch.summary,
          highlights: ch.highlights,
          loot: ch.loot,
          session_date: ch.sessionDate,
          order_num: ch.order,
          youtube_link: ch.youtubeLink || null
        })));

      if (chapError) throw chapError;
    }

    return true;
  } catch (error) {
    console.error('Erreur sauvegarde campagne:', error);
    return false;
  }
};

export const deleteCampaign = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur suppression campagne:', error);
    return false;
  }
  return true;
};

export const deleteChapter = async (campaignId: string, chapterId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId)
    .eq('campaign_id', campaignId);

  if (error) {
    console.error('Erreur suppression chapitre:', error);
    return false;
  }
  return true;
};
