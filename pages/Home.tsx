import React from 'react';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import { BookOpen, User, Globe } from '../components/Icons';

interface HomeProps {
  campaigns: Campaign[];
}

const Home: React.FC<HomeProps> = ({ campaigns }) => {
  const featured = campaigns.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/id/1044/1920/1080')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-valthera-950 via-valthera-950/80 to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-valthera-100 to-valthera-300 mb-6 drop-shadow-2xl">
            Bienvenue sur Valthera
          </h1>
          <p className="text-xl text-valthera-200 mb-8 font-body">
            Découvrez nos épopées, suivez nos aventures et explorez les archives de nos campagnes de jeu de rôle.
            De la fantaisie épique aux dystopies futuristes.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/univers/valthera"
              className="bg-valthera-600 hover:bg-valthera-500 text-valthera-100 px-8 py-3 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(201,162,39,0.3)] hover:shadow-[0_0_30px_rgba(201,162,39,0.5)] flex items-center gap-2"
            >
              <Globe size={20} />
              Explorer Valthera
            </Link>
             <Link 
              to="/univers/hors-serie"
              className="bg-valthera-800/80 hover:bg-valthera-700 text-valthera-100 px-8 py-3 rounded-full font-semibold transition-all backdrop-blur-md border border-valthera-700"
            >
              Hors-Série
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-valthera-300">{campaigns.length}</div>
            <div className="text-valthera-200/60 text-sm mt-1">Campagnes</div>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-valthera-400">{campaigns.reduce((acc, c) => acc + c.chapters.length, 0)}</div>
            <div className="text-valthera-200/60 text-sm mt-1">Sessions jouées</div>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-valthera-300">{campaigns.reduce((acc, c) => acc + c.characters.length, 0)}</div>
            <div className="text-valthera-200/60 text-sm mt-1">Personnages</div>
          </div>
          <div className="glass-panel p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-forest-500">{campaigns.filter(c => c.status === 'active').length}</div>
            <div className="text-valthera-200/60 text-sm mt-1">En cours</div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex items-center gap-3 mb-10">
           <BookOpen className="text-valthera-400" />
           <h2 className="text-3xl font-display font-bold text-valthera-100">Dernières Campagnes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((campaign) => (
             <Link 
                key={campaign.id} 
                to={`/campagne/${campaign.id}`}
                className="group relative cursor-pointer h-96 rounded-2xl overflow-hidden border border-valthera-700 shadow-xl transition-transform hover:-translate-y-2"
             >
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-valthera-950 via-valthera-950/60 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${campaign.universe === 'valthera' ? 'bg-valthera-600/20 text-valthera-300' : 'bg-purple-500/20 text-purple-300'}`}>
                    {campaign.universe === 'valthera' ? 'Valthera' : 'Hors-Série'}
                  </span>
                  <h3 className="text-2xl font-bold text-valthera-100 mt-2 mb-2">{campaign.title}</h3>
                  <p className="text-valthera-200 text-sm line-clamp-2">{campaign.pitch}</p>
                </div>
             </Link>
          ))}
        </div>
      </div>
      
      {/* About Section */}
      <div className="bg-valthera-900/30 border-y border-valthera-700 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
           <User className="w-12 h-12 text-valthera-400 mx-auto mb-6" />
           <h2 className="text-3xl font-display font-bold text-valthera-100 mb-6">À propos de l'organisateur</h2>
           <p className="text-lg text-valthera-200/80 leading-relaxed font-body">
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