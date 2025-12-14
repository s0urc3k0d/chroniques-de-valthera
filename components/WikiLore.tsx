import React, { useState, useMemo } from 'react';
import { LoreArticle, LoreCategory, loreCategoryLabels, loreCategoryIcons } from '../types/lore';
import { Search, X, ChevronRight, Book, ArrowLeft } from './Icons';

interface WikiLoreProps {
  articles: LoreArticle[];
  onArticleClick?: (article: LoreArticle) => void;
  editable?: boolean;
  onAddArticle?: () => void;
  onEditArticle?: (article: LoreArticle) => void;
  onDeleteArticle?: (articleId: string) => void;
}

// Parser Markdown simple
const parseMarkdown = (text: string): string => {
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-valthera-100 mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-valthera-100 mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-valthera-100 mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-valthera-100 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-valthera-200 italic">$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="text-valthera-200 ml-4">• $1</li>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-valthera-400 pl-4 my-4 text-valthera-200/80 italic">$1</blockquote>')
    .replace(/\n/g, '<br>');
};

const WikiLore: React.FC<WikiLoreProps> = ({
  articles,
  onArticleClick,
  editable = false,
  onAddArticle,
  onEditArticle,
  onDeleteArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LoreCategory | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = useState<LoreArticle | null>(null);

  // Grouper les articles par catégorie
  const articlesByCategory = useMemo(() => {
    const grouped: Record<string, LoreArticle[]> = {};
    articles.forEach(article => {
      if (!grouped[article.category]) {
        grouped[article.category] = [];
      }
      grouped[article.category].push(article);
    });
    return grouped;
  }, [articles]);

  // Filtrer les articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.content.toLowerCase().includes(query) ||
        a.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [articles, selectedCategory, searchQuery]);

  // Compter les articles par catégorie
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(article => {
      counts[article.category] = (counts[article.category] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // Trouver les articles liés
  const getRelatedArticles = (articleIds?: string[]) => {
    if (!articleIds?.length) return [];
    return articles.filter(a => articleIds.includes(a.id));
  };

  // Vue article détaillé
  if (selectedArticle) {
    const relatedArticles = getRelatedArticles(selectedArticle.relatedArticles);
    
    return (
      <div className="animate-fadeIn">
        {/* Header avec bouton retour */}
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-valthera-200/60 hover:text-valthera-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Retour au wiki</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-xl overflow-hidden">
              {selectedArticle.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={selectedArticle.imageUrl} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Catégorie */}
                <div className="flex items-center gap-2 text-sm text-valthera-300 mb-2">
                  <span>{loreCategoryIcons[selectedArticle.category]}</span>
                  <span>{loreCategoryLabels[selectedArticle.category]}</span>
                </div>

                {/* Titre */}
                <h1 className="text-3xl font-display font-bold text-valthera-100 mb-4">
                  {selectedArticle.title}
                </h1>

                {/* Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedArticle.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-valthera-700/50 text-valthera-200/80 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contenu */}
                <div 
                  className="prose prose-invert max-w-none text-valthera-200"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedArticle.content) }}
                />

                {/* Actions admin */}
                {editable && (
                  <div className="flex gap-3 mt-8 pt-6 border-t border-valthera-700">
                    <button
                      onClick={() => onEditArticle?.(selectedArticle)}
                      className="px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-white rounded-lg transition-colors"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Supprimer cet article ?')) {
                          onDeleteArticle?.(selectedArticle.id);
                          setSelectedArticle(null);
                        }
                      }}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/50 rounded-lg transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Articles liés */}
            {relatedArticles.length > 0 && (
              <div className="glass-panel rounded-xl p-4">
                <h3 className="text-lg font-bold text-valthera-100 mb-4 flex items-center gap-2">
                  <Book size={18} />
                  Articles liés
                </h3>
                <div className="space-y-2">
                  {relatedArticles.map(article => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full text-left p-3 bg-valthera-800/50 hover:bg-valthera-700/50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span>{loreCategoryIcons[article.category]}</span>
                        <span className="text-valthera-100 group-hover:text-valthera-300 transition-colors">
                          {article.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="glass-panel rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-valthera-200/60">Créé le</span>
                  <span className="text-white">
                    {new Date(selectedArticle.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-valthera-200/60">Modifié le</span>
                  <span className="text-white">
                    {new Date(selectedArticle.updatedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue liste
  return (
    <div className="space-y-6">
      {/* Header avec recherche */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            📚 Encyclopédie de Valthera
          </h2>
          <p className="text-valthera-200/60 mt-1">
            {articles.length} article{articles.length > 1 ? 's' : ''} sur l'univers
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* Recherche */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-valthera-200/60" size={18} />
            <input
              type="text"
              placeholder="Rechercher dans le wiki..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-valthera-800 border border-valthera-700 rounded-lg text-valthera-100 placeholder-valthera-200/50 focus:border-valthera-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-valthera-200/60 hover:text-valthera-100"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Bouton ajouter */}
          {editable && onAddArticle && (
            <button
              onClick={onAddArticle}
              className="px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              + Nouvel article
            </button>
          )}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-valthera-600 text-valthera-100'
              : 'bg-valthera-800 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700'
          }`}
        >
          Tous ({articles.length})
        </button>
        {(Object.keys(loreCategoryLabels) as LoreCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category
                ? 'bg-valthera-600 text-valthera-100'
                : 'bg-valthera-800 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700'
            }`}
          >
            <span>{loreCategoryIcons[category]}</span>
            <span>{loreCategoryLabels[category]}</span>
            {categoryCounts[category] > 0 && (
              <span className="text-xs opacity-70">({categoryCounts[category]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Grille d'articles */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-bold text-valthera-100 mb-2">Aucun article trouvé</h3>
          <p className="text-valthera-200/60">
            {searchQuery 
              ? 'Aucun résultat pour votre recherche.' 
              : 'Le wiki est vide pour le moment.'}
          </p>
          {editable && onAddArticle && (
            <button
              onClick={onAddArticle}
              className="mt-4 px-6 py-3 bg-valthera-600 hover:bg-valthera-500 text-white rounded-lg transition-colors"
            >
              Créer le premier article
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(article => (
            <button
              key={article.id}
              onClick={() => {
                setSelectedArticle(article);
                onArticleClick?.(article);
              }}
              className="glass-panel rounded-xl overflow-hidden text-left hover:border-valthera-500/50 transition-all group"
            >
              {article.imageUrl && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                {/* Catégorie */}
                <div className="flex items-center gap-2 text-xs text-valthera-400 mb-2">
                  <span>{loreCategoryIcons[article.category]}</span>
                  <span>{loreCategoryLabels[article.category]}</span>
                </div>

                {/* Titre */}
                <h3 className="text-lg font-bold text-white group-hover:text-valthera-400 transition-colors flex items-center gap-2">
                  {article.title}
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>

                {/* Extrait */}
                {article.excerpt && (
                  <p className="text-sm text-valthera-200/60 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-valthera-700/50 text-valthera-200/50 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs text-valthera-200/50">+{article.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WikiLore;
