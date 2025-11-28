import React, { useState, useEffect } from 'react';
import { PlannedSession, SessionPlayer, SessionStatus, Campaign } from '../types';
import { Save, X, Plus, Trash2, Users, Clock, Calendar, Play, Check } from '../components/Icons';

interface AdminSessionFormProps {
  session?: PlannedSession;
  campaigns: Campaign[];
  onSave: (session: Partial<PlannedSession>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AdminSessionForm: React.FC<AdminSessionFormProps> = ({
  session,
  campaigns,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<PlannedSession>>({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 180, // 3 heures par défaut
    status: 'scheduled',
    campaignId: '',
    twitchLink: '',
    youtubeLink: '',
    maxPlayers: undefined,
    players: [],
    notificationSent: false,
    publicNotes: '',
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser avec les données de session existante
  useEffect(() => {
    if (session) {
      // Convertir la date pour le champ datetime-local
      const scheduledDate = new Date(session.scheduledDate);
      const formattedDate = scheduledDate.toISOString().slice(0, 16);
      
      setFormData({
        ...session,
        scheduledDate: formattedDate,
      });
    } else {
      // Nouvelle session : date par défaut demain à 21h
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(21, 0, 0, 0);
      const formattedDate = tomorrow.toISOString().slice(0, 16);
      
      setFormData(prev => ({
        ...prev,
        scheduledDate: formattedDate,
      }));
    }
  }, [session]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La date est requise';
    }

    if (!formData.campaignId) {
      newErrors.campaignId = 'Sélectionnez une campagne';
    }

    if (formData.duration && formData.duration < 30) {
      newErrors.duration = 'La durée minimum est de 30 minutes';
    }

    if (formData.twitchLink && !formData.twitchLink.includes('twitch.tv')) {
      newErrors.twitchLink = 'Lien Twitch invalide';
    }

    if (formData.youtubeLink && !formData.youtubeLink.includes('youtube.com') && !formData.youtubeLink.includes('youtu.be')) {
      newErrors.youtubeLink = 'Lien YouTube invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    // Convertir la date locale en ISO
    const sessionData = {
      ...formData,
      scheduledDate: new Date(formData.scheduledDate!).toISOString(),
    };

    await onSave(sessionData);
  };

  // Ajouter un joueur
  const addPlayer = () => {
    if (!newPlayerName.trim()) return;

    const newPlayer: SessionPlayer = {
      id: `player_${Date.now()}`,
      name: newPlayerName.trim(),
      confirmed: false,
      notified: false,
    };

    setFormData(prev => ({
      ...prev,
      players: [...(prev.players || []), newPlayer],
    }));
    setNewPlayerName('');
  };

  // Supprimer un joueur
  const removePlayer = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players?.filter(p => p.id !== playerId),
    }));
  };

  // Basculer la confirmation d'un joueur
  const togglePlayerConfirmation = (playerId: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players?.map(p => 
        p.id === playerId ? { ...p, confirmed: !p.confirmed } : p
      ),
    }));
  };

  // Options de durée
  const durationOptions = [
    { value: 60, label: '1 heure' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2 heures' },
    { value: 150, label: '2h30' },
    { value: 180, label: '3 heures' },
    { value: 210, label: '3h30' },
    { value: 240, label: '4 heures' },
    { value: 300, label: '5 heures' },
    { value: 360, label: '6 heures' },
  ];

  const statusOptions: { value: SessionStatus; label: string; color: string }[] = [
    { value: 'scheduled', label: 'Planifiée', color: 'text-blue-400' },
    { value: 'live', label: 'En direct', color: 'text-red-400' },
    { value: 'completed', label: 'Terminée', color: 'text-green-400' },
    { value: 'cancelled', label: 'Annulée', color: 'text-slate-400' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 pb-4">
        <h2 className="text-xl font-display font-bold text-white">
          {session ? '✏️ Modifier la session' : '📅 Planifier une session'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-4">
          {/* Campagne */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Campagne *
            </label>
            <select
              value={formData.campaignId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, campaignId: e.target.value }))}
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500 ${
                errors.campaignId ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Sélectionnez une campagne</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.universe === 'valthera' ? '🏰' : '🚀'} {campaign.title}
                </option>
              ))}
            </select>
            {errors.campaignId && (
              <p className="text-red-400 text-sm mt-1">{errors.campaignId}</p>
            )}
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Titre de la session *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ex: Exploration du Temple Oublié"
              className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500 ${
                errors.title ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Date et heure */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Calendar size={14} className="inline mr-1" />
                Date et heure *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500 ${
                  errors.scheduledDate ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.scheduledDate && (
                <p className="text-red-400 text-sm mt-1">{errors.scheduledDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                <Clock size={14} className="inline mr-1" />
                Durée
              </label>
              <select
                value={formData.duration || 180}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500"
              >
                {durationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Statut
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    formData.status === opt.value
                      ? `bg-slate-700 border-2 border-valthera-500 ${opt.color}`
                      : 'bg-slate-800 border border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch / Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              📝 Pitch de la session
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez brièvement ce qui attend les joueurs..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500"
            />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Liens diffusion */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-300">📺 Diffusion</h3>
            
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                <Play size={12} className="inline mr-1 text-purple-400" />
                Lien Twitch
              </label>
              <input
                type="url"
                value={formData.twitchLink || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, twitchLink: e.target.value }))}
                placeholder="https://twitch.tv/votre-chaine"
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.twitchLink ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.twitchLink && (
                <p className="text-red-400 text-sm mt-1">{errors.twitchLink}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                <Play size={12} className="inline mr-1 text-red-400" />
                Lien YouTube (replay)
              </label>
              <input
                type="url"
                value={formData.youtubeLink || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, youtubeLink: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className={`w-full px-4 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.youtubeLink ? 'border-red-500' : 'border-slate-600'
                }`}
              />
              {errors.youtubeLink && (
                <p className="text-red-400 text-sm mt-1">{errors.youtubeLink}</p>
              )}
            </div>
          </div>

          {/* Joueurs */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              <Users size={14} className="inline mr-1" />
              Joueurs
            </h3>

            {/* Ajouter un joueur */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPlayer())}
                placeholder="Nom du joueur"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500"
              />
              <button
                type="button"
                onClick={addPlayer}
                className="px-3 py-2 bg-valthera-600 hover:bg-valthera-500 text-white rounded-lg transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Nombre max de joueurs */}
            <div className="mb-3">
              <label className="flex items-center gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.maxPlayers !== undefined}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    maxPlayers: e.target.checked ? 5 : undefined,
                  }))}
                  className="rounded bg-slate-700 border-slate-600 text-valthera-500 focus:ring-valthera-500"
                />
                Limiter le nombre de joueurs
              </label>
              {formData.maxPlayers !== undefined && (
                <input
                  type="number"
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                  min={1}
                  max={20}
                  className="mt-2 w-24 px-3 py-1 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                />
              )}
            </div>

            {/* Liste des joueurs */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {formData.players?.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-2">
                  Aucun joueur ajouté
                </p>
              )}
              {formData.players?.map(player => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => togglePlayerConfirmation(player.id)}
                      className={`p-1 rounded transition-colors ${
                        player.confirmed 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-slate-700 text-slate-500 hover:text-slate-300'
                      }`}
                      title={player.confirmed ? 'Confirmé' : 'En attente'}
                    >
                      <Check size={14} />
                    </button>
                    <span className="text-white">{player.name}</span>
                    {player.notified && (
                      <span className="text-xs text-slate-500">(notifié)</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlayer(player.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes publiques */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              📌 Notes publiques
            </label>
            <textarea
              value={formData.publicNotes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, publicNotes: e.target.value }))}
              placeholder="Informations visibles par tous..."
              rows={2}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-valthera-500 focus:border-valthera-500"
            />
          </div>

          {/* Notification */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notificationSent || false}
                onChange={(e) => setFormData(prev => ({ ...prev, notificationSent: e.target.checked }))}
                className="rounded bg-slate-700 border-slate-600 text-valthera-500 focus:ring-valthera-500"
              />
              <span className="text-sm text-slate-300">
                🔔 Notification envoyée aux joueurs
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1 ml-7">
              Cochez après avoir notifié les joueurs de la session
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-valthera-600 hover:bg-valthera-500 disabled:bg-valthera-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
        >
          <Save size={18} />
          {isLoading ? 'Enregistrement...' : session ? 'Enregistrer' : 'Créer la session'}
        </button>
      </div>
    </form>
  );
};

export default AdminSessionForm;
