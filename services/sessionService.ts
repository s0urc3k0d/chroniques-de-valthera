import { supabase, generateUUID } from './supabaseClient';
import { PlannedSession, SessionPlayer, SessionStatus } from '../types';

// ============================================
// TYPES DB
// ============================================

interface DbPlannedSession {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration: number;
  status: SessionStatus;
  twitch_link: string | null;
  youtube_link: string | null;
  is_live: boolean;
  players: SessionPlayer[];
  max_players: number | null;
  notification_sent: boolean;
  notification_sent_at: string | null;
  reminder_sent: boolean;
  gm_notes: string | null;
  public_notes: string | null;
  linked_chapter_id: string | null;
  created_at: string;
  updated_at: string;
  // Champs de la vue (optionnels)
  campaign_title?: string;
  universe?: string;
  campaign_image?: string;
}

// ============================================
// CONVERSION HELPERS
// ============================================

const dbToPlannedSession = (db: DbPlannedSession): PlannedSession & { 
  campaignTitle?: string; 
  universe?: string; 
  campaignImage?: string;
} => ({
  id: db.id,
  campaignId: db.campaign_id,
  title: db.title,
  description: db.description,
  scheduledDate: db.scheduled_date,
  duration: db.duration,
  status: db.status,
  twitchLink: db.twitch_link || undefined,
  youtubeLink: db.youtube_link || undefined,
  isLive: db.is_live,
  players: db.players || [],
  maxPlayers: db.max_players || undefined,
  notificationSent: db.notification_sent,
  notificationSentAt: db.notification_sent_at || undefined,
  reminderSent: db.reminder_sent,
  gmNotes: db.gm_notes || undefined,
  publicNotes: db.public_notes || undefined,
  linkedChapterId: db.linked_chapter_id || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  // Champs additionnels de la vue
  campaignTitle: db.campaign_title,
  universe: db.universe,
  campaignImage: db.campaign_image,
});

const plannedSessionToDb = (session: PlannedSession): Partial<DbPlannedSession> => ({
  id: session.id,
  campaign_id: session.campaignId,
  title: session.title,
  description: session.description,
  scheduled_date: session.scheduledDate,
  duration: session.duration,
  status: session.status,
  twitch_link: session.twitchLink || null,
  youtube_link: session.youtubeLink || null,
  is_live: session.isLive || false,
  players: session.players,
  max_players: session.maxPlayers || null,
  notification_sent: session.notificationSent || false,
  notification_sent_at: session.notificationSentAt || null,
  reminder_sent: session.reminderSent || false,
  gm_notes: session.gmNotes || null,
  public_notes: session.publicNotes || null,
  linked_chapter_id: session.linkedChapterId || null,
});

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Récupère toutes les sessions planifiées
 */
export const getAllSessions = async (): Promise<PlannedSession[]> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return (data || []).map(row => {
    const campaign = row.campaigns as any;
    return dbToPlannedSession({
      ...row,
      campaign_title: campaign?.title,
      universe: campaign?.universe,
      campaign_image: campaign?.image_url,
    } as DbPlannedSession);
  });
};

/**
 * Récupère les sessions à venir
 */
export const getUpcomingSessions = async (): Promise<PlannedSession[]> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .gte('scheduled_date', new Date().toISOString())
    .in('status', ['scheduled', 'live'])
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching upcoming sessions:', error);
    return [];
  }

  return (data || []).map(row => {
    const campaign = row.campaigns as any;
    return dbToPlannedSession({
      ...row,
      campaign_title: campaign?.title,
      universe: campaign?.universe,
      campaign_image: campaign?.image_url,
    } as DbPlannedSession);
  });
};

/**
 * Récupère les sessions passées
 */
export const getPastSessions = async (): Promise<PlannedSession[]> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .or(`scheduled_date.lt.${new Date().toISOString()},status.in.(completed,cancelled)`)
    .order('scheduled_date', { ascending: false });

  if (error) {
    console.error('Error fetching past sessions:', error);
    return [];
  }

  return (data || []).map(row => {
    const campaign = row.campaigns as any;
    return dbToPlannedSession({
      ...row,
      campaign_title: campaign?.title,
      universe: campaign?.universe,
      campaign_image: campaign?.image_url,
    } as DbPlannedSession);
  });
};

/**
 * Récupère les sessions d'une campagne spécifique
 */
export const getSessionsByCampaign = async (campaignId: string): Promise<PlannedSession[]> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('scheduled_date', { ascending: false });

  if (error) {
    console.error('Error fetching campaign sessions:', error);
    return [];
  }

  return (data || []).map(row => dbToPlannedSession(row as DbPlannedSession));
};

/**
 * Récupère une session par son ID
 */
export const getSessionById = async (id: string): Promise<PlannedSession | null> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  const campaign = data.campaigns as any;
  return dbToPlannedSession({
    ...data,
    campaign_title: campaign?.title,
    universe: campaign?.universe,
    campaign_image: campaign?.image_url,
  } as DbPlannedSession);
};

/**
 * Récupère la prochaine session (pour l'affichage homepage)
 */
export const getNextSession = async (): Promise<PlannedSession | null> => {
  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .gte('scheduled_date', new Date().toISOString())
    .in('status', ['scheduled', 'live'])
    .order('scheduled_date', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // "No rows returned"
      console.error('Error fetching next session:', error);
    }
    return null;
  }

  const campaign = data.campaigns as any;
  return dbToPlannedSession({
    ...data,
    campaign_title: campaign?.title,
    universe: campaign?.universe,
    campaign_image: campaign?.image_url,
  } as DbPlannedSession);
};

// ============================================
// WRITE OPERATIONS
// ============================================

/**
 * Crée ou met à jour une session
 */
export const saveSession = async (session: PlannedSession): Promise<boolean> => {
  const dbSession = plannedSessionToDb(session);
  
  const { error } = await supabase
    .from('planned_sessions')
    .upsert(dbSession, { onConflict: 'id' });

  if (error) {
    console.error('Error saving session:', error);
    return false;
  }

  return true;
};

/**
 * Crée une nouvelle session
 */
export const createSession = async (session: Omit<PlannedSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlannedSession | null> => {
  const newSession: PlannedSession = {
    ...session,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const success = await saveSession(newSession);
  return success ? newSession : null;
};

/**
 * Supprime une session
 */
export const deleteSession = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting session:', error);
    return false;
  }

  return true;
};

// ============================================
// STATUS OPERATIONS
// ============================================

/**
 * Met à jour le statut d'une session
 */
export const updateSessionStatus = async (id: string, status: SessionStatus): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error updating session status:', error);
    return false;
  }

  return true;
};

/**
 * Passe une session en live
 */
export const startSession = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      status: 'live', 
      is_live: true,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    console.error('Error starting session:', error);
    return false;
  }

  return true;
};

/**
 * Termine une session
 */
export const endSession = async (id: string, youtubeLink?: string): Promise<boolean> => {
  const updateData: any = { 
    status: 'completed', 
    is_live: false,
    updated_at: new Date().toISOString() 
  };
  
  if (youtubeLink) {
    updateData.youtube_link = youtubeLink;
  }

  const { error } = await supabase
    .from('planned_sessions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error ending session:', error);
    return false;
  }

  return true;
};

// ============================================
// PLAYER OPERATIONS
// ============================================

/**
 * Met à jour la confirmation d'un joueur
 */
export const updatePlayerConfirmation = async (
  sessionId: string, 
  playerId: string, 
  confirmed: boolean
): Promise<boolean> => {
  // Récupérer la session actuelle
  const session = await getSessionById(sessionId);
  if (!session) return false;

  // Mettre à jour le joueur
  const updatedPlayers = session.players.map(p => 
    p.id === playerId ? { ...p, confirmed } : p
  );

  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      players: updatedPlayers,
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating player confirmation:', error);
    return false;
  }

  return true;
};

/**
 * Ajoute un joueur à une session
 */
export const addPlayerToSession = async (
  sessionId: string, 
  player: SessionPlayer
): Promise<boolean> => {
  const session = await getSessionById(sessionId);
  if (!session) return false;

  // Vérifier si le joueur n'est pas déjà présent
  if (session.players.some(p => p.id === player.id)) {
    return false;
  }

  // Vérifier le nombre max de joueurs
  if (session.maxPlayers && session.players.length >= session.maxPlayers) {
    return false;
  }

  const updatedPlayers = [...session.players, player];

  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      players: updatedPlayers,
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error adding player:', error);
    return false;
  }

  return true;
};

/**
 * Retire un joueur d'une session
 */
export const removePlayerFromSession = async (
  sessionId: string, 
  playerId: string
): Promise<boolean> => {
  const session = await getSessionById(sessionId);
  if (!session) return false;

  const updatedPlayers = session.players.filter(p => p.id !== playerId);

  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      players: updatedPlayers,
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error removing player:', error);
    return false;
  }

  return true;
};

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Marque la notification comme envoyée
 */
export const markNotificationSent = async (sessionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      notification_sent: true,
      notification_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error marking notification sent:', error);
    return false;
  }

  return true;
};

/**
 * Marque le rappel comme envoyé
 */
export const markReminderSent = async (sessionId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      reminder_sent: true,
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error marking reminder sent:', error);
    return false;
  }

  return true;
};

// ============================================
// CALENDAR HELPERS
// ============================================

/**
 * Récupère les sessions pour un mois donné
 */
export const getSessionsForMonth = async (year: number, month: number): Promise<PlannedSession[]> => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const { data, error } = await supabase
    .from('planned_sessions')
    .select(`
      *,
      campaigns:campaign_id (
        title,
        universe,
        image_url
      )
    `)
    .gte('scheduled_date', startDate.toISOString())
    .lte('scheduled_date', endDate.toISOString())
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching sessions for month:', error);
    return [];
  }

  return (data || []).map(row => {
    const campaign = row.campaigns as any;
    return dbToPlannedSession({
      ...row,
      campaign_title: campaign?.title,
      universe: campaign?.universe,
      campaign_image: campaign?.image_url,
    } as DbPlannedSession);
  });
};

/**
 * Lier une session à un chapitre (après création du résumé)
 */
export const linkSessionToChapter = async (sessionId: string, chapterId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('planned_sessions')
    .update({ 
      linked_chapter_id: chapterId,
      updated_at: new Date().toISOString() 
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error linking session to chapter:', error);
    return false;
  }

  return true;
};
