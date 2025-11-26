import React, { useState } from 'react';
import { ViewState, Campaign, Character } from '../types';
import { ArrowLeft, User, ScrollText, Youtube, Calendar, Dna, Sword, X } from '../components/Icons';

interface CampaignDetailProps {
  campaign: Campaign;
  setView: (view: ViewState) => void;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign, setView }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'chapters'>('chapters');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Header Banner */}
      <div className="relative h-80 w-full">
         <img src={campaign.imageUrl} className="w-full h-full object-cover" alt="Cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/60 to-transparent"></div>
         <div className="absolute top-6 left-6 z-20">
            <button 
              onClick={() => setView({ type: 'UNIVERSE', universe: campaign.universe })}
              className="flex items-center bg-black/50 hover:bg-black/70 backdrop-blur px-4 py-2 rounded-full text-white text-sm transition-all"
            >
              <ArrowLeft size={16} className="mr-2" /> Retour
            </button>
         </div>
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 drop-shadow-lg">{campaign.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
               <span className="px-3 py-1 bg-valthera-600 rounded-md text-white shadow-lg shadow-valthera-500/20">
                 {campaign.universe === 'valthera' ? 'Univers Valthera' : 'Hors-Univers'}
               </span>
               <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                 {campaign.status === 'active' ? 'En Cours' : 'Terminée'}
               </span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex border-b border-slate-800 mb-8">
          <button 
            onClick={() => setActiveTab('chapters')}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'chapters' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Le Récit ({campaign.chapters.length})
          </button>
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 font-medium text-lg border-b-2 transition-colors ${activeTab === 'info' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Les Protagonistes & Infos
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
            {/* Left Col: Pitch */}
            <div className="lg:col-span-1 space-y-8">
              <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ScrollText size={20} className="text-valthera-400" /> Le Pitch</h3>
                <p className="text-slate-300 leading-relaxed italic">
                  "{campaign.pitch}"
                </p>
              </div>
            </div>

            {/* Right Col: Characters */}
            <div className="lg:col-span-2">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User size={20} className="text-valthera-400" /> Les Héros</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {campaign.characters.map((char) => (
                   <div 
                      key={char.id} 
                      onClick={() => setSelectedChar(char)}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 hover:border-valthera-500/50 hover:bg-slate-800 transition-all cursor-pointer group"
                   >
                      <img src={char.imageUrl} alt={char.name} className="w-20 h-20 rounded-lg object-cover bg-slate-800 group-hover:scale-105 transition-transform" />
                      <div>
                        <h4 className="font-bold text-white text-lg group-hover:text-valthera-400 transition-colors">{char.name}</h4>
                        <p className="text-valthera-400 text-xs uppercase font-bold tracking-wide mb-1">{char.species} • {char.class}</p>
                        <p className="text-slate-400 text-sm line-clamp-2">{char.description}</p>
                        <p className="text-slate-600 text-xs mt-2">Joué par {char.player}</p>
                      </div>
                   </div>
                 ))}
                 {campaign.characters.length === 0 && (
                   <div className="col-span-2 text-center text-slate-500 italic py-10">Aucun personnage renseigné pour le moment.</div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="space-y-12 max-w-4xl mx-auto animate-fade-in">
             {campaign.chapters.sort((a,b) => b.order - a.order).map((chap) => (
                <div key={chap.id} className="relative pl-8 md:pl-0">
                   {/* Timeline line for desktop */}
                   <div className="hidden md:block absolute left-[-20px] top-0 bottom-0 w-px bg-slate-800"></div>
                   
                   <div className="glass-panel rounded-xl overflow-hidden border-slate-800/60">
                      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                         <div>
                            <span className="text-valthera-500 font-bold text-sm tracking-wider uppercase">Chapitre {chap.order}</span>
                            <h3 className="text-2xl font-display font-bold text-white">{chap.title}</h3>
                         </div>
                         <div className="flex items-center text-slate-500 text-sm gap-2">
                           <Calendar size={14} />
                           {chap.sessionDate}
                         </div>
                      </div>
                      
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="prose prose-invert max-w-none text-slate-300">
                          <p className="whitespace-pre-line leading-relaxed">{chap.summary}</p>
                        </div>

                        {/* Highlights & Loot */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                           {chap.highlights.length > 0 && (
                             <div>
                               <h4 className="text-sm font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                                 <Dna size={16} /> Points Forts
                               </h4>
                               <ul className="space-y-2">
                                 {chap.highlights.map((h, i) => (
                                   <li key={i} className="flex items-start text-sm text-slate-400">
                                     <span className="text-indigo-500 mr-2">•</span> {h}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                           
                           {chap.loot && chap.loot.length > 0 && (
                             <div>
                               <h4 className="text-sm font-bold text-amber-400 uppercase mb-3 flex items-center gap-2">
                                 <Sword size={16} /> Butin
                               </h4>
                               <ul className="space-y-2">
                                 {chap.loot.map((l, i) => (
                                   <li key={i} className="flex items-start text-sm text-slate-400">
                                     <span className="text-amber-500 mr-2">+</span> {l}
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           )}
                        </div>

                        {/* Youtube Link */}
                        {chap.youtubeLink && (
                          <div className="pt-6 border-t border-slate-800/50">
                            <a 
                              href={chap.youtubeLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-4 py-2 rounded-lg transition-colors border border-red-600/20"
                            >
                              <Youtube size={20} />
                              Voir le replay de la session
                            </a>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
             ))}
             {campaign.chapters.length === 0 && (
               <div className="text-center py-20 text-slate-500">
                 L'aventure n'a pas encore commencé... Revenez après la première session !
               </div>
             )}
          </div>
        )}
      </div>

      {/* Character Modal */}
      {selectedChar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedChar(null)}></div>
          <div className="relative glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up border border-slate-700">
            <button 
              onClick={() => setSelectedChar(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col md:flex-row">
               <div className="h-64 md:h-auto md:w-1/2 relative">
                 <img src={selectedChar.imageUrl} alt={selectedChar.name} className="absolute inset-0 w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-void-950/80 via-transparent to-transparent"></div>
               </div>
               <div className="p-8 md:w-1/2 bg-void-950/90 flex flex-col justify-center">
                  <span className="text-valthera-500 font-bold uppercase tracking-wider text-sm mb-1">{selectedChar.species}</span>
                  <h2 className="text-3xl font-display font-bold text-white mb-1">{selectedChar.name}</h2>
                  <span className="text-slate-400 text-sm mb-6 italic">{selectedChar.class}</span>
                  
                  <div className="prose prose-sm prose-invert text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                    <p>{selectedChar.description}</p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-800 text-sm text-slate-500">
                    Incarné par <span className="text-slate-300 font-medium">{selectedChar.player}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignDetail;