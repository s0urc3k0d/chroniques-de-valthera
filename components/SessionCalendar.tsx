import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlannedSession, SessionStatus } from '../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Play, 
  Check, 
  X,
  Plus,
  Edit3,
  Trash2
} from './Icons';

// Type pour les sessions enrichies (optionnel)
type SessionWithExtras = PlannedSession & { 
  campaignTitle?: string; 
  universe?: string; 
  campaignImage?: string;
};

interface SessionCalendarProps {
  sessions: SessionWithExtras[];
  editable?: boolean;
  onAddSession?: () => void;
  onEditSession?: (session: PlannedSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onSessionClick?: (session: PlannedSession) => void;
}

// Noms des mois en français
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Couleurs par statut
const statusConfig: Record<SessionStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  scheduled: { 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-400', 
    label: 'Planifiée',
    icon: <CalendarIcon size={14} />
  },
  live: { 
    bg: 'bg-blood-500/20', 
    text: 'text-blood-400', 
    label: '🔴 EN DIRECT',
    icon: <Play size={14} />
  },
  completed: { 
    bg: 'bg-forest-500/20', 
    text: 'text-forest-400', 
    label: 'Terminée',
    icon: <Check size={14} />
  },
  cancelled: { 
    bg: 'bg-valthera-500/20', 
    text: 'text-valthera-200/60', 
    label: 'Annulée',
    icon: <X size={14} />
  },
};

const SessionCalendar: React.FC<SessionCalendarProps> = ({
  sessions,
  editable = false,
  onAddSession,
  onEditSession,
  onDeleteSession,
  onSessionClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSession, setSelectedSession] = useState<SessionWithExtras | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // Navigation mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Générer les jours du mois
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ajuster pour commencer le lundi (0 = lundi, 6 = dimanche)
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const days: { date: Date; isCurrentMonth: boolean; sessions: typeof sessions }[] = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, sessions: [] });
    }
    
    // Jours du mois courant
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.scheduledDate);
        return sessionDate.getFullYear() === year &&
               sessionDate.getMonth() === month &&
               sessionDate.getDate() === day;
      });
      days.push({ date, isCurrentMonth: true, sessions: daySessions });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false, sessions: [] });
    }
    
    return days;
  }, [currentDate, sessions]);

  // Sessions à venir et passées pour la vue liste
  const upcomingSessions = useMemo(() => 
    sessions
      .filter(s => new Date(s.scheduledDate) >= new Date() && s.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
    [sessions]
  );

  const pastSessions = useMemo(() => 
    sessions
      .filter(s => new Date(s.scheduledDate) < new Date() || s.status === 'completed' || s.status === 'cancelled')
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()),
    [sessions]
  );

  const today = new Date();
  const isToday = (date: Date) => 
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  // Formater la durée
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? mins : ''}` : `${mins}min`;
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Composant carte de session
  const SessionCard: React.FC<{ session: typeof sessions[0]; compact?: boolean }> = ({ session, compact = false }) => {
    const status = statusConfig[session.status];
    const confirmedCount = session.players.filter(p => p.confirmed).length;

    return (
      <div
        onClick={() => {
          setSelectedSession(session);
          onSessionClick?.(session);
        }}
        className={`
          ${status.bg} border border-valthera-700 rounded-lg p-3 cursor-pointer
          hover:border-valthera-500/50 transition-all group
          ${compact ? 'p-2' : 'p-4'}
        `}
      >
        {/* Status badge */}
        {session.status === 'live' && (
          <div className="flex items-center gap-1 text-blood-400 text-xs font-bold mb-2 animate-pulse">
            <span className="w-2 h-2 bg-blood-500 rounded-full"></span>
            EN DIRECT
          </div>
        )}

        {/* Titre et campagne */}
        <h4 className={`font-bold text-valthera-100 ${compact ? 'text-sm' : 'text-lg'} group-hover:text-valthera-400 transition-colors`}>
          {session.title}
        </h4>
        
        {session.campaignTitle && (
          <p className="text-xs text-valthera-400 mt-1">
            {session.universe === 'valthera' ? '🏰' : '🚀'} {session.campaignTitle}
          </p>
        )}

        {!compact && (
          <>
            {/* Description */}
            {session.description && (
              <p className="text-sm text-valthera-200/60 mt-2 line-clamp-2">{session.description}</p>
            )}

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-valthera-200/50">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatTime(session.scheduledDate)} ({formatDuration(session.duration)})
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {confirmedCount}/{session.players.length} confirmés
                {session.maxPlayers && ` (max ${session.maxPlayers})`}
              </span>
            </div>

            {/* Liens Twitch/YouTube */}
            {(session.twitchLink || session.youtubeLink) && (
              <div className="flex gap-2 mt-3">
                {session.twitchLink && (
                  <a
                    href={session.twitchLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs hover:bg-purple-500/30 transition-colors"
                  >
                    <Play size={12} /> Twitch
                  </a>
                )}
                {session.youtubeLink && (
                  <a
                    href={session.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2 py-1 bg-blood-500/20 text-blood-400 rounded text-xs hover:bg-blood-500/30 transition-colors"
                  >
                    <Play size={12} /> Replay
                  </a>
                )}
              </div>
            )}
          </>
        )}

        {compact && (
          <p className="text-xs text-valthera-200/50 mt-1">{formatTime(session.scheduledDate)}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-valthera-100 flex items-center gap-3">
            📅 Calendrier des Sessions
          </h2>
          <p className="text-valthera-200/60 mt-1">
            {upcomingSessions.length} session{upcomingSessions.length > 1 ? 's' : ''} à venir
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle vue */}
          <div className="flex bg-valthera-800 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'calendar' ? 'bg-valthera-600 text-valthera-100' : 'text-valthera-200/60 hover:text-valthera-100'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'list' ? 'bg-valthera-600 text-valthera-100' : 'text-valthera-200/60 hover:text-valthera-100'
              }`}
            >
              Liste
            </button>
          </div>

          {/* Bouton ajouter */}
          {editable && onAddSession && (
            <button
              onClick={onAddSession}
              className="flex items-center gap-2 px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-lg transition-colors"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Planifier</span>
            </button>
          )}
        </div>
      </div>

      {/* Vue Calendrier */}
      {view === 'calendar' && (
        <div className="glass-panel rounded-xl overflow-hidden">
          {/* Navigation mois */}
          <div className="flex items-center justify-between p-4 border-b border-valthera-700">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-valthera-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-valthera-200/60" />
            </button>
            
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-display font-bold text-valthera-100">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-valthera-700 hover:bg-valthera-600 text-valthera-200/80 rounded transition-colors"
              >
                Aujourd'hui
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-valthera-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-valthera-200/60" />
            </button>
          </div>

          {/* Grille calendrier */}
          <div className="p-4">
            {/* En-têtes jours */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-valthera-200/50 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Jours */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 rounded-lg border transition-colors
                    ${day.isCurrentMonth 
                      ? 'bg-valthera-800/50 border-valthera-700' 
                      : 'bg-valthera-900/30 border-valthera-800 opacity-50'
                    }
                    ${isToday(day.date) ? 'ring-2 ring-valthera-500 border-valthera-500' : ''}
                    ${day.sessions.length > 0 ? 'hover:border-valthera-500/50' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day.date) ? 'text-valthera-400' : 
                    day.isCurrentMonth ? 'text-valthera-200/80' : 'text-valthera-600'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {/* Sessions du jour */}
                  <div className="space-y-1">
                    {day.sessions.slice(0, 2).map(session => (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`
                          text-xs p-1 rounded cursor-pointer truncate
                          ${statusConfig[session.status].bg}
                          ${statusConfig[session.status].text}
                          hover:opacity-80 transition-opacity
                        `}
                        title={`${session.title} - ${formatTime(session.scheduledDate)}`}
                      >
                        {session.status === 'live' && '🔴 '}
                        {session.title}
                      </div>
                    ))}
                    {day.sessions.length > 2 && (
                      <div className="text-xs text-valthera-200/50 text-center">
                        +{day.sessions.length - 2} autre{day.sessions.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {view === 'list' && (
        <div className="space-y-8">
          {/* Sessions à venir */}
          <div>
            <h3 className="text-lg font-bold text-valthera-100 mb-4 flex items-center gap-2">
              <CalendarIcon size={20} className="text-valthera-400" />
              Sessions à venir
            </h3>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-valthera-200/50 glass-panel rounded-xl">
                Aucune session planifiée pour le moment
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-valthera-500 rounded-full"></div>
                    <div className="ml-4">
                      <p className="text-sm text-valthera-200/60 mb-2">
                        {formatDate(session.scheduledDate)}
                      </p>
                      <SessionCard session={session} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sessions passées */}
          {pastSessions.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-valthera-100 mb-4 flex items-center gap-2">
                <Check size={20} className="text-forest-400" />
                Sessions passées
              </h3>
              <div className="space-y-4 opacity-80">
                {pastSessions.slice(0, 5).map(session => (
                  <div key={session.id} className="relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${
                      session.status === 'cancelled' ? 'bg-valthera-600' : 'bg-forest-500'
                    }`}></div>
                    <div className="ml-4">
                      <p className="text-sm text-valthera-200/50 mb-2">
                        {formatDate(session.scheduledDate)}
                      </p>
                      <SessionCard session={session} />
                    </div>
                  </div>
                ))}
                {pastSessions.length > 5 && (
                  <p className="text-center text-valthera-200/50 text-sm">
                    Et {pastSessions.length - 5} autres sessions...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal détail session */}
      {selectedSession && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSession(null)}
        >
          <div 
            className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 ${statusConfig[selectedSession.status].bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusConfig[selectedSession.status].text} bg-black/20 mb-2`}>
                    {statusConfig[selectedSession.status].icon}
                    {statusConfig[selectedSession.status].label}
                  </div>
                  
                  <h2 className="text-2xl font-display font-bold text-valthera-100">
                    {selectedSession.title}
                  </h2>
                  
                  {selectedSession.campaignTitle && (
                    <Link 
                      to={`/campagne/${selectedSession.campaignId}`}
                      className="text-valthera-400 hover:text-valthera-300 text-sm mt-1 inline-block"
                    >
                      {selectedSession.universe === 'valthera' ? '🏰' : '🚀'} {selectedSession.campaignTitle} →
                    </Link>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-2 hover:bg-black/20 rounded-lg transition-colors"
                >
                  <X size={20} className="text-valthera-100" />
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Date et durée */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-valthera-200/80">
                  <CalendarIcon size={18} className="text-valthera-400" />
                  <span>{formatDate(selectedSession.scheduledDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-valthera-200/80">
                  <Clock size={18} className="text-valthera-400" />
                  <span>{formatTime(selectedSession.scheduledDate)} ({formatDuration(selectedSession.duration)})</span>
                </div>
              </div>

              {/* Description / Pitch */}
              {selectedSession.description && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">📝 Pitch de la session</h4>
                  <p className="text-valthera-200/80">{selectedSession.description}</p>
                </div>
              )}

              {/* Liens diffusion */}
              {(selectedSession.twitchLink || selectedSession.youtubeLink) && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">📺 Diffusion</h4>
                  <div className="flex gap-3">
                    {selectedSession.twitchLink && (
                      <a
                        href={selectedSession.twitchLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-valthera-100 rounded-lg transition-colors"
                      >
                        <Play size={18} />
                        {selectedSession.status === 'live' ? 'Regarder en direct' : 'Chaîne Twitch'}
                      </a>
                    )}
                    {selectedSession.youtubeLink && (
                      <a
                        href={selectedSession.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blood-600 hover:bg-blood-500 text-valthera-100 rounded-lg transition-colors"
                      >
                        <Play size={18} />
                        Voir le replay
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Joueurs */}
              <div>
                <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">
                  👥 Joueurs ({selectedSession.players.filter(p => p.confirmed).length}/{selectedSession.players.length} confirmés)
                  {selectedSession.maxPlayers && ` - Max ${selectedSession.maxPlayers}`}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.players.map(player => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        player.confirmed 
                          ? 'bg-forest-500/10 border-forest-500/30 text-forest-400' 
                          : 'bg-valthera-700/50 border-valthera-600 text-valthera-200/60'
                      }`}
                    >
                      {player.confirmed ? <Check size={14} /> : <Clock size={14} />}
                      <span>{player.name}</span>
                    </div>
                  ))}
                  {selectedSession.players.length === 0 && (
                    <p className="text-valthera-200/50 text-sm">Aucun joueur inscrit</p>
                  )}
                </div>
              </div>

              {/* Notes publiques */}
              {selectedSession.publicNotes && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">📌 Notes</h4>
                  <p className="text-valthera-200/80 text-sm bg-valthera-800/50 p-3 rounded-lg">
                    {selectedSession.publicNotes}
                  </p>
                </div>
              )}

              {/* Actions admin */}
              {editable && (
                <div className="flex gap-3 pt-4 border-t border-valthera-700">
                  <button
                    onClick={() => {
                      onEditSession?.(selectedSession);
                      setSelectedSession(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cette session ?')) {
                        onDeleteSession?.(selectedSession.id);
                        setSelectedSession(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blood-600/20 hover:bg-blood-600/40 text-blood-400 border border-blood-500/50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionCalendar;
