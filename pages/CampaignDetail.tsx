import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Campaign, Character } from '../types';
import { ArrowLeft, User, ScrollText, Calendar, Dna, Sword, X, Share2, Check, Clock, Link2, Map, Skull, Download, Printer } from '../components/Icons';
import YouTubePlayer from '../components/YouTubePlayer';
import Timeline from '../components/Timeline';
import CharacterGallery from '../components/CharacterGallery';
import RelationGraph from '../components/RelationGraph';
import InteractiveMap from '../components/InteractiveMap';
import Bestiary from '../components/Bestiary';
import SEOHead from '../components/SEOHead';
import { printCampaignPDF } from '../services/feedService';

interface CampaignDetailProps {
  campaign: Campaign;
}

const CampaignDetail: React.FC<CampaignDetailProps> = ({ campaign }) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'timeline' | 'characters' | 'relations' | 'map' | 'bestiary'>('chapters');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [copied, setCopied] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/campagne/${campaign.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasRelations = campaign.characters.some(c => c.relations && c.relations.length > 0);
  const hasNPCs = campaign.characters.some(c => c.isNPC);
  const hasMap = !!campaign.mapImageUrl;
  const hasBestiary = campaign.bestiary && campaign.bestiary.length > 0;

  const handleExportPDF = () => {
    printCampaignPDF(campaign);
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* SEO Meta Tags */}
      <SEOHead campaign={campaign} type="article" />
      {/* Header Banner */}
      <div className="relative h-80 w-full">
         <img src={campaign.imageUrl} className="w-full h-full object-cover" alt="Cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-void-950 via-void-950/60 to-transparent"></div>
         <div className="absolute top-6 left-6 right-6 z-20 flex justify-between">
            <Link 
              to={`/univers/${campaign.universe}`}
              className="flex items-center bg-black/50 hover:bg-black/70 backdrop-blur px-4 py-2 rounded-full text-white text-sm transition-all"
            >
              <ArrowLeft size={16} className="mr-2" /> Retour
            </Link>
            <div className="flex gap-2">
              <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-black/50 hover:bg-black/70 backdrop-blur px-4 py-2 rounded-full text-white text-sm transition-all"
                title="Exporter en PDF"
              >
                <Printer size={16} />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button 
                onClick={handleCopyLink}
                className={`flex items-center gap-2 backdrop-blur px-4 py-2 rounded-full text-sm transition-all ${
                  copied 
                    ? 'bg-emerald-500/80 text-white' 
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Lien copié !' : 'Partager'}
              </button>
            </div>
         </div>
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 drop-shadow-lg">{campaign.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
               <span className="px-3 py-1 bg-valthera-600 rounded-md text-white shadow-lg shadow-valthera-500/20">
                 {campaign.universe === 'valthera' ? 'Univers Valthera' : 'Hors-Série'}
               </span>
               <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                 {campaign.status === 'active' ? 'En Cours' : 'Terminée'}
               </span>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-slate-800 mb-8 gap-2">
          <button 
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'chapters' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            📖 Chapitres ({campaign.chapters.length})
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'timeline' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Clock size={16} className="inline mr-1" /> Timeline
          </button>
          <button 
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'characters' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <User size={16} className="inline mr-1" /> Personnages ({campaign.characters.length})
          </button>
          {hasRelations && (
            <button 
              onClick={() => setActiveTab('relations')}
              className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'relations' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Link2 size={16} className="inline mr-1" /> Relations
            </button>
          )}
          {hasMap && (
            <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'map' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Map size={16} className="inline mr-1" /> Carte
            </button>
          )}
          {hasBestiary && (
            <button 
              onClick={() => setActiveTab('bestiary')}
              className={`px-4 py-3 font-medium text-sm md:text-base border-b-2 transition-colors whitespace-nowrap ${activeTab === 'bestiary' ? 'border-valthera-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Skull size={16} className="inline mr-1" /> Bestiaire ({campaign.bestiary?.length})
            </button>
          )}
        </div>

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="glass-panel p-6 rounded-xl mb-6">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <ScrollText size={20} className="text-valthera-400" /> Le Pitch
              </h3>
              <p className="text-slate-300 leading-relaxed italic">"{campaign.pitch}"</p>
            </div>
            <Timeline 
              chapters={campaign.chapters} 
              onChapterClick={(id) => {
                setActiveTab('chapters');
                setExpandedChapter(id);
              }}
            />
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="animate-fade-in">
            <CharacterGallery characters={campaign.characters} showNPCs={hasNPCs} />
          </div>
        )}

        {/* Relations Tab */}
        {activeTab === 'relations' && (
          <div className="animate-fade-in">
            <RelationGraph characters={campaign.characters} />
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && hasMap && (
          <div className="animate-fade-in">
            <div className="glass-panel p-4 rounded-xl mb-4">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Map size={20} className="text-valthera-400" /> Carte de {campaign.title}
              </h3>
              <p className="text-slate-400 text-sm">
                Explorez la carte interactive. Utilisez la molette pour zoomer, cliquez-glissez pour naviguer, 
                et cliquez sur les marqueurs pour voir les détails.
              </p>
            </div>
            <InteractiveMap
              imageUrl={campaign.mapImageUrl!}
              markers={campaign.mapMarkers || []}
              chapters={campaign.chapters}
              editable={false}
            />
          </div>
        )}

        {/* Bestiary Tab */}
        {activeTab === 'bestiary' && hasBestiary && (
          <div className="animate-fade-in">
            <div className="glass-panel p-4 rounded-xl mb-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Skull size={20} className="text-red-400" /> Bestiaire de la Campagne
              </h3>
              <p className="text-slate-400 text-sm">
                Toutes les créatures rencontrées au cours de l'aventure. Cliquez sur une créature pour voir sa fiche complète.
              </p>
            </div>
            <Bestiary
              creatures={campaign.bestiary || []}
              chapters={campaign.chapters}
              editable={false}
            />
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
             {campaign.chapters.sort((a,b) => b.order - a.order).map((chap) => (
                <div 
                  key={chap.id} 
                  id={`chapter-${chap.id}`}
                  className={`glass-panel rounded-xl overflow-hidden transition-all ${
                    expandedChapter === chap.id ? 'ring-2 ring-valthera-500' : 'border-slate-800/60'
                  }`}
                >
                   <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                         <span className="text-valthera-500 font-bold text-sm tracking-wider uppercase">Chapitre {chap.order}</span>
                         <h3 className="text-2xl font-display font-bold text-white">{chap.title}</h3>
                      </div>
                      <div className="flex items-center text-slate-500 text-sm gap-2">
                        <Calendar size={14} />
                        {new Date(chap.sessionDate).toLocaleDateString('fr-FR', { 
                          day: 'numeric', month: 'long', year: 'numeric' 
                        })}
                      </div>
                   </div>
                   
                   <div className="p-6 md:p-8 space-y-6">
                     {/* YouTube Player intégré */}
                     {chap.youtubeLink && (
                       <div className="mb-6">
                         <YouTubePlayer url={chap.youtubeLink} title={`Session ${chap.order} - ${chap.title}`} />
                       </div>
                     )}

                     {/* Résumé avec support Markdown */}
                     <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300 prose-a:text-valthera-400 prose-blockquote:border-valthera-500 prose-blockquote:text-slate-400">
                       <ReactMarkdown remarkPlugins={[remarkGfm]}>{chap.summary}</ReactMarkdown>
                     </div>

                     {/* Highlights & Loot */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                        {chap.highlights && chap.highlights.length > 0 && (
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
                 <img 
                   src={selectedChar.imageUrl} 
                   alt={selectedChar.name} 
                   className="absolute inset-0 w-full h-full object-cover" 
                   style={{
                     objectPosition: selectedChar.imagePosition 
                       ? `${selectedChar.imagePosition.x}% ${selectedChar.imagePosition.y}%` 
                       : 'center'
                   }}
                 />
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