import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, UniverseType } from '../types';
import { Sword, LogOut, ArrowLeft, Calendar, Search, Filter } from '../components/Icons';

// Helper pour obtenir la dernière session
const getLastSessionDate = (campaign: Campaign): string | null => {
  if (campaign.chapters.length === 0) return null;
  const sorted = [...campaign.chapters].sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  return sorted[0].sessionDate;
};

interface CampaignListProps {
  universe: UniverseType;
  campaigns: Campaign[];
}

const CampaignList: React.FC<CampaignListProps> = ({ universe, campaigns }) => {
  const isValthera = universe === 'valthera';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'hiatus'>('all');

  // Filtrer les campagnes
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(camp => {
      // Filtre par recherche (titre, pitch, personnages)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        camp.title.toLowerCase().includes(searchLower) ||
        camp.pitch.toLowerCase().includes(searchLower) ||
        camp.characters.some(c => c.name.toLowerCase().includes(searchLower) || c.player.toLowerCase().includes(searchLower));
      
      // Filtre par statut
      const matchesStatus = statusFilter === 'all' || camp.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-12">
        <Link 
          to="/"
          className="flex items-center text-valthera-200/60 hover:text-valthera-100 mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Link>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isValthera ? 'bg-valthera-900/30' : 'bg-purple-900/30'}`}>
            {isValthera ? <Sword size={40} className="text-valthera-300" /> : <LogOut size={40} className="text-purple-400" />}
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-valthera-100">
              {isValthera ? 'L\'Univers de Valthera' : 'Campagnes Hors-Série'}
            </h1>
            <p className="text-valthera-200/60 mt-2">
              {isValthera 
                ? 'Plongez dans un monde de magie ancienne, de conflits politiques et de mystères oubliés.' 
                : 'Science-fiction, horreur contemporaine, enquêtes... Tout ce qui sort du cadre.'}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-valthera-200/50" />
          <input
            type="text"
            placeholder="Rechercher une campagne, personnage, joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-valthera-900/80 border border-valthera-700 rounded-xl text-valthera-100 placeholder-valthera-200/40 focus:border-valthera-400 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-valthera-200/50" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-3 bg-valthera-900/80 border border-valthera-700 rounded-xl text-valthera-100 focus:border-valthera-400 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">En cours</option>
            <option value="completed">Terminées</option>
            <option value="hiatus">En pause</option>
          </select>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-20 bg-valthera-900/50 rounded-xl border border-dashed border-valthera-700">
          <p className="text-valthera-200/60 text-lg">
            {searchQuery || statusFilter !== 'all' 
              ? 'Aucune campagne ne correspond à vos critères.' 
              : 'Aucune campagne active dans cette catégorie pour le moment.'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
              className="mt-4 text-valthera-300 hover:text-valthera-200"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCampaigns.map((camp) => (
             <Link 
              key={camp.id}
              to={`/campagne/${camp.id}`}
              className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:border-valthera-400/50 transition-all group"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${
                  camp.status === 'active' 
                    ? 'bg-forest-600/20 text-forest-500 border-forest-500/30' 
                    : camp.status === 'completed' 
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                    : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                }`}>
                   {camp.status === 'active' ? '● En cours' : camp.status === 'completed' ? '✓ Terminée' : '⏸ En pause'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-valthera-100 mb-2 group-hover:text-valthera-300 transition-colors">{camp.title}</h3>
                <p className="text-valthera-200/60 line-clamp-3 mb-4 text-sm">{camp.pitch}</p>
                <div className="flex items-center justify-between text-xs text-valthera-200/50 pt-4 border-t border-valthera-700">
                   <span>{camp.characters.length} Joueurs • {camp.chapters.length} Chapitres</span>
                   {getLastSessionDate(camp) && (
                     <span className="flex items-center gap-1">
                       <Calendar size={12} />
                       {new Date(getLastSessionDate(camp)!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </span>
                   )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;