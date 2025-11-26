import React from 'react';
import { ViewState, Campaign, UniverseType } from '../types';
import { Sword, LogOut, ArrowLeft } from '../components/Icons';

interface CampaignListProps {
  universe: UniverseType;
  campaigns: Campaign[];
  setView: (view: ViewState) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ universe, campaigns, setView }) => {
  const isValthera = universe === 'valthera';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-12">
        <button 
          onClick={() => setView({ type: 'HOME' })}
          className="flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" /> Retour
        </button>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isValthera ? 'bg-valthera-900/30' : 'bg-purple-900/30'}`}>
            {isValthera ? <Sword size={40} className="text-valthera-400" /> : <LogOut size={40} className="text-purple-400" />}
          </div>
          <div>
            <h1 className="text-4xl font-display font-bold text-white">
              {isValthera ? 'L\'Univers de Valthera' : 'Aventures Hors-Univers'}
            </h1>
            <p className="text-slate-400 mt-2">
              {isValthera 
                ? 'Plongez dans un monde de magie ancienne, de conflits politiques et de mystères oubliés.' 
                : 'Science-fiction, horreur contemporaine, enquêtes... Tout ce qui sort du cadre.'}
            </p>
          </div>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
          <p className="text-slate-500 text-lg">Aucune campagne active dans cette catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {campaigns.map((camp) => (
             <div 
              key={camp.id}
              onClick={() => setView({ type: 'CAMPAIGN', campaignId: camp.id })}
              className="glass-panel rounded-xl overflow-hidden cursor-pointer hover:border-valthera-500/50 transition-all group"
            >
              <div className="h-48 overflow-hidden relative">
                <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 backdrop-blur-md">
                   {camp.status === 'active' ? '🟢 En cours' : camp.status === 'completed' ? '🏁 Terminée' : '⏸️ En pause'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-valthera-400 transition-colors">{camp.title}</h3>
                <p className="text-slate-400 line-clamp-3 mb-4 text-sm">{camp.pitch}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800">
                   <span>{camp.characters.length} Joueurs</span>
                   <span>{camp.chapters.length} Chapitres</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;