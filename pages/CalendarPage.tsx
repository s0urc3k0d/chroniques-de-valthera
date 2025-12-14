import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { PlannedSession, Campaign } from '../types';
import SessionCalendar from '../components/SessionCalendar';
import AdminSessionForm from './AdminSessionForm';
import { 
  getAllSessions, 
  saveSession,
  createSession,
  deleteSession as deleteSessionService
} from '../services/sessionService';
import { getCampaigns } from '../services/supabaseService';
import { Calendar, Plus, ArrowLeft } from '../components/Icons';
import { Link } from 'react-router-dom';

// Type pour les sessions enrichies avec les infos de campagne
type SessionWithCampaign = PlannedSession & {
  campaignTitle?: string;
  universe?: string;
  campaignImage?: string;
};

const CalendarPage: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [sessions, setSessions] = useState<SessionWithCampaign[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<PlannedSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [sessionsData, campaignsData] = await Promise.all([
        getAllSessions(),
        getCampaigns(),
      ]);
      
      // Enrichir les sessions avec les infos de campagne
      const enrichedSessions = sessionsData.map(session => {
        const campaign = campaignsData.find(c => c.id === session.campaignId);
        return {
          ...session,
          campaignTitle: campaign?.title,
          universe: campaign?.universe,
          campaignImage: campaign?.imageUrl,
        };
      });
      
      setSessions(enrichedSessions);
      setCampaigns(campaignsData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Impossible de charger les sessions. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ouvrir le formulaire de création
  const handleAddSession = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  // Ouvrir le formulaire d'édition
  const handleEditSession = (session: PlannedSession) => {
    setEditingSession(session);
    setShowForm(true);
  };

  // Fermer le formulaire
  const handleCancelForm = () => {
    setEditingSession(null);
    setShowForm(false);
  };

  // Sauvegarder une session
  const handleSaveSession = async (sessionData: Partial<PlannedSession>) => {
    try {
      setIsSaving(true);
      
      if (editingSession) {
        // Mise à jour
        await saveSession({
          ...editingSession,
          ...sessionData,
          updatedAt: new Date().toISOString(),
        } as PlannedSession);
      } else {
        // Création - utiliser createSession qui génère un UUID valide
        await createSession({
          ...sessionData,
          players: sessionData.players || [],
          status: sessionData.status || 'scheduled',
          duration: sessionData.duration || 180,
        } as Omit<PlannedSession, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      await loadData();
      handleCancelForm();
    } catch (err) {
      console.error('Erreur sauvegarde session:', err);
      setError('Impossible de sauvegarder la session. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer une session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionService(sessionId);
      await loadData();
    } catch (err) {
      console.error('Erreur suppression session:', err);
      setError('Impossible de supprimer la session. Veuillez réessayer.');
    }
  };

  // Session en direct
  const liveSession = sessions.find(s => s.status === 'live');

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-valthera-200/60 hover:text-valthera-100 mb-4 transition-colors"
          >
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-valthera-100 flex items-center gap-3">
                <Calendar size={36} className="text-valthera-400" />
                Calendrier des Sessions
              </h1>
              <p className="text-valthera-200/60 mt-2">
                Planification et historique des parties de jeu de rôle
              </p>
            </div>
          </div>
        </div>

        {/* Alerte session en direct */}
        {liveSession && (
          <div className="mb-6 p-4 bg-blood-500/10 border border-blood-500/30 rounded-xl animate-pulse">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-blood-400 font-bold">
                  <span className="w-3 h-3 bg-blood-500 rounded-full animate-pulse"></span>
                  EN DIRECT
                </span>
                <span className="text-valthera-100 font-medium">{liveSession.title}</span>
                {liveSession.campaignTitle && (
                  <span className="text-valthera-200/60">• {liveSession.campaignTitle}</span>
                )}
              </div>
              {liveSession.twitchLink && (
                <a
                  href={liveSession.twitchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-valthera-100 rounded-lg transition-colors"
                >
                  📺 Regarder sur Twitch
                </a>
              )}
            </div>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-blood-500/10 border border-blood-500/30 text-blood-400 rounded-xl">
            {error}
            <button 
              onClick={loadData}
              className="ml-3 underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Chargement */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Contenu principal */}
        {!isLoading && (
          <>
            {/* Modal formulaire */}
            {showForm && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="glass-panel rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <AdminSessionForm
                    session={editingSession || undefined}
                    campaigns={campaigns}
                    onSave={handleSaveSession}
                    onCancel={handleCancelForm}
                    isLoading={isSaving}
                  />
                </div>
              </div>
            )}

            {/* Calendrier */}
            <SessionCalendar
              sessions={sessions}
              editable={isAuthenticated}
              onAddSession={handleAddSession}
              onEditSession={handleEditSession}
              onDeleteSession={handleDeleteSession}
            />

            {/* Message si aucune session */}
            {sessions.length === 0 && !showForm && (
              <div className="text-center py-16 glass-panel rounded-xl mt-8">
                <Calendar size={64} className="mx-auto text-valthera-600 mb-4" />
                <h3 className="text-xl font-bold text-valthera-100 mb-2">
                  Aucune session planifiée
                </h3>
                <p className="text-valthera-200/60 mb-6">
                  Commencez par planifier votre première session de jeu de rôle
                </p>
                {isAuthenticated && (
                  <button
                    onClick={handleAddSession}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-xl transition-colors"
                  >
                    <Plus size={20} />
                    Planifier une session
                  </button>
                )}
              </div>
            )}

            {/* Légende des statuts */}
            <div className="mt-8 glass-panel rounded-xl p-4">
              <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-3">
                Légende des statuts
              </h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span className="text-sm text-valthera-200/80">Planifiée</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blood-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-valthera-200/80">En direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-forest-500 rounded-full"></span>
                  <span className="text-sm text-valthera-200/80">Terminée</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-valthera-500 rounded-full"></span>
                  <span className="text-sm text-valthera-200/80">Annulée</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
