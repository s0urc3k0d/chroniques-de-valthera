import React from 'react';
import { ViewState, Campaign } from '../types';
import { BookOpen, Sparkles, User } from '../components/Icons';

interface HomeProps {
  setView: (view: ViewState) => void;
  campaigns: Campaign[];
}

const Home: React.FC<HomeProps> = ({ setView, campaigns }) => {
  const featured = campaigns.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1044/1920/1080')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/80 to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-valthera-100 to-indigo-200 mb-6 drop-shadow-2xl">
            Bienvenue sur Valthera
          </h1>
          <p className="text-xl text-slate-300 mb-8 font-light">
            Découvrez nos épopées, suivez nos aventures et explorez les archives de nos campagnes de jeu de rôle.
            De la fantaisie épique aux dystopies futuristes.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setView({ type: 'UNIVERSE', universe: 'valthera' })}
              className="bg-valthera-600 hover:bg-valthera-500 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] flex items-center gap-2"
            >
              <Sparkles size={20} />
              Explorer l'Univers
            </button>
             <button 
              onClick={() => setView({ type: 'UNIVERSE', universe: 'hors-univers' })}
              className="bg-slate-800/80 hover:bg-slate-700 text-white px-8 py-3 rounded-full font-semibold transition-all backdrop-blur-md border border-slate-700"
            >
              Autres Mondes
            </button>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="flex items-center gap-3 mb-10">
           <BookOpen className="text-valthera-500" />
           <h2 className="text-3xl font-display font-bold text-white">Dernières Campagnes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((campaign) => (
             <div 
                key={campaign.id} 
                onClick={() => setView({ type: 'CAMPAIGN', campaignId: campaign.id })}
                className="group relative cursor-pointer h-96 rounded-2xl overflow-hidden border border-slate-800 shadow-xl transition-transform hover:-translate-y-2"
             >
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${campaign.universe === 'valthera' ? 'bg-valthera-500/20 text-valthera-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    {campaign.universe === 'valthera' ? 'Valthera' : 'Hors-Univers'}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2 mb-2">{campaign.title}</h3>
                  <p className="text-slate-300 text-sm line-clamp-2">{campaign.pitch}</p>
                </div>
             </div>
          ))}
        </div>
      </div>
      
      {/* About Section */}
      <div className="bg-slate-900/30 border-y border-slate-800 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
           <User className="w-12 h-12 text-valthera-500 mx-auto mb-6" />
           <h2 className="text-3xl font-display font-bold text-white mb-6">À propos de l'organisateur</h2>
           <p className="text-lg text-slate-400 leading-relaxed">
             Passionné de narration et de création de mondes, j'organise ces sessions courtes pour explorer 
             différentes facettes du jeu de rôle. Ce site sert d'archive vivante pour mes joueurs et 
             les curieux qui souhaitent suivre nos péripéties.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Home;