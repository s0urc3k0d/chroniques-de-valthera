import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WikiLore from '../components/WikiLore';
import WorldTimeline from '../components/WorldTimeline';
import SEOHead from '../components/SEOHead';
import { LoreArticle, WorldEvent, LoreCategory, WorldEra, EventType } from '../types/lore';
import { getLoreArticles, saveLoreArticle, deleteLoreArticle, getWorldEvents, saveWorldEvent, deleteWorldEvent } from '../services/loreService';
import { useAppContext } from '../App';
import { X, ArrowLeft } from '../components/Icons';

type TabType = 'wiki' | 'chronologie';

const LorePage: React.FC = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<TabType>((tab as TabType) || 'wiki');
  const [articles, setArticles] = useState<LoreArticle[]>([]);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [editingArticle, setEditingArticle] = useState<LoreArticle | null>(null);
  const [editingEvent, setEditingEvent] = useState<WorldEvent | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (tab && (tab === 'wiki' || tab === 'chronologie')) {
      setActiveTab(tab);
    }
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    const [articlesData, eventsData] = await Promise.all([
      getLoreArticles(),
      getWorldEvents(),
    ]);
    setArticles(articlesData);
    setEvents(eventsData);
    setLoading(false);
  };

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    navigate(`/lore/${newTab}`, { replace: true });
  };

  // Créer un nouvel article
  const handleNewArticle = () => {
    const newArticle: LoreArticle = {
      id: crypto.randomUUID(),
      title: '',
      slug: '',
      category: 'misc',
      content: '',
      tags: [],
      relatedArticles: [],
      linkedCampaigns: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditingArticle(newArticle);
  };

  // Sauvegarder un article
  const handleSaveArticle = async (article: LoreArticle) => {
    article.updatedAt = Date.now();
    article.slug = article.title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    await saveLoreArticle(article);
    await loadData();
    setEditingArticle(null);
  };

  // Supprimer un article
  const handleDeleteArticle = async (id: string) => {
    await deleteLoreArticle(id);
    await loadData();
  };

  // Créer un nouvel événement
  const handleNewEvent = () => {
    const newEvent: WorldEvent = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      year: 3850,
      era: 'current-age',
      type: 'political',
      importance: 'minor',
    };
    setEditingEvent(newEvent);
  };

  // Sauvegarder un événement
  const handleSaveEvent = async (event: WorldEvent) => {
    await saveWorldEvent(event);
    await loadData();
    setEditingEvent(null);
  };

  // Supprimer un événement
  const handleDeleteEvent = async (id: string) => {
    await deleteWorldEvent(id);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={activeTab === 'wiki' ? 'Encyclopédie' : 'Chronologie'}
        description={activeTab === 'wiki' 
          ? 'Découvrez l\'univers de Valthera : géographie, histoire, factions, magie et plus encore.'
          : 'Explorez la chronologie de Valthera à travers les âges et les événements majeurs.'}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation retour */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour à l'accueil</span>
        </button>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          <button
            onClick={() => handleTabChange('wiki')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'wiki'
                ? 'text-valthera-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📚 Encyclopédie
            {activeTab === 'wiki' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-valthera-500"></div>
            )}
          </button>
          <button
            onClick={() => handleTabChange('chronologie')}
            className={`pb-4 px-2 font-medium transition-colors relative ${
              activeTab === 'chronologie'
                ? 'text-valthera-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 Chronologie
            {activeTab === 'chronologie' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-valthera-500"></div>
            )}
          </button>
        </div>

        {/* Contenu */}
        {activeTab === 'wiki' ? (
          <WikiLore
            articles={articles}
            editable={isAdmin}
            onAddArticle={handleNewArticle}
            onEditArticle={setEditingArticle}
            onDeleteArticle={handleDeleteArticle}
          />
        ) : (
          <WorldTimeline
            events={events}
            editable={isAdmin}
            onAddEvent={handleNewEvent}
            onEditEvent={setEditingEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>

      {/* Modal édition article */}
      {editingArticle && (
        <ArticleFormModal
          article={editingArticle}
          articles={articles}
          onSave={handleSaveArticle}
          onClose={() => setEditingArticle(null)}
        />
      )}

      {/* Modal édition événement */}
      {editingEvent && (
        <EventFormModal
          event={editingEvent}
          onSave={handleSaveEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </>
  );
};

// Modal formulaire article
interface ArticleFormModalProps {
  article: LoreArticle;
  articles: LoreArticle[];
  onSave: (article: LoreArticle) => void;
  onClose: () => void;
}

const ArticleFormModal: React.FC<ArticleFormModalProps> = ({ article, articles, onSave, onClose }) => {
  const [formData, setFormData] = useState<LoreArticle>(article);

  const categories: LoreCategory[] = ['geography', 'history', 'factions', 'characters', 'magic', 'religion', 'creatures', 'culture', 'misc'];
  const categoryLabels: Record<LoreCategory, string> = {
    geography: '🗺️ Géographie',
    history: '📜 Histoire',
    factions: '⚔️ Factions',
    characters: '👤 Personnages',
    magic: '✨ Magie',
    religion: '🙏 Religion',
    creatures: '🐉 Créatures',
    culture: '🎭 Culture',
    misc: '📚 Divers',
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white">
              {article.createdAt === article.updatedAt ? 'Nouvel article' : 'Modifier l\'article'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="Titre de l'article"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Catégorie *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as LoreCategory})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Résumé court</label>
              <input
                type="text"
                value={formData.excerpt || ''}
                onChange={e => setFormData({...formData, excerpt: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="Une phrase de résumé"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Contenu (Markdown) *</label>
              <textarea
                rows={12}
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white font-mono text-sm"
                placeholder="# Introduction&#10;&#10;Contenu de l'article..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Tags (séparés par des virgules)</label>
              <input
                type="text"
                value={(formData.tags || []).join(', ')}
                onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="magie, artefact, ancien"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Articles liés</label>
              <select
                multiple
                value={formData.relatedArticles || []}
                onChange={e => setFormData({
                  ...formData, 
                  relatedArticles: Array.from(e.target.selectedOptions, o => o.value)
                })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32"
              >
                {articles.filter(a => a.id !== formData.id).map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Ctrl+Clic pour sélectionner plusieurs</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.title || !formData.content}
              className="px-6 py-3 bg-valthera-600 hover:bg-valthera-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              💾 Enregistrer
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal formulaire événement
interface EventFormModalProps {
  event: WorldEvent;
  onSave: (event: WorldEvent) => void;
  onClose: () => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState<WorldEvent>(event);

  const eras: { value: WorldEra; label: string }[] = [
    { value: 'age-of-dawn', label: "L'Âge de l'Aube (0-1000)" },
    { value: 'age-of-empires', label: "L'Âge des Empires (1001-2500)" },
    { value: 'age-of-shadows', label: "L'Âge des Ombres (2501-3200)" },
    { value: 'age-of-rebirth', label: "L'Âge du Renouveau (3201-3800)" },
    { value: 'current-age', label: "L'Âge Actuel (3801+)" },
  ];

  const types: { value: EventType; label: string }[] = [
    { value: 'war', label: '⚔️ Guerre' },
    { value: 'discovery', label: '🔍 Découverte' },
    { value: 'founding', label: '🏰 Fondation' },
    { value: 'catastrophe', label: '💥 Catastrophe' },
    { value: 'political', label: '👑 Politique' },
    { value: 'magical', label: '✨ Magie' },
    { value: 'divine', label: '✝️ Divin' },
  ];

  const importances: { value: 'minor' | 'major' | 'legendary'; label: string }[] = [
    { value: 'minor', label: 'Mineur' },
    { value: 'major', label: 'Majeur' },
    { value: 'legendary', label: '⭐ Légendaire' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white">
              {event.title ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="Nom de l'événement"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Année *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: parseInt(e.target.value) || 0})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                  placeholder="3850"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Ère *</label>
                <select
                  value={formData.era}
                  onChange={e => setFormData({...formData, era: e.target.value as WorldEra})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                >
                  {eras.map(era => (
                    <option key={era.value} value={era.value}>{era.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as EventType})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">Importance</label>
                <select
                  value={formData.importance}
                  onChange={e => setFormData({...formData, importance: e.target.value as 'minor' | 'major' | 'legendary'})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                >
                  {importances.map(imp => (
                    <option key={imp.value} value={imp.value}>{imp.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Description *</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="Description de l'événement..."
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-1">Image URL</label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.title || !formData.description}
              className="px-6 py-3 bg-valthera-600 hover:bg-valthera-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              💾 Enregistrer
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LorePage;
