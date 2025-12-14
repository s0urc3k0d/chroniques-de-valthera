import React, { useState } from 'react';
import { BestiaryCreature, Chapter } from '../types';
import { X, Skull, Search } from '../components/Icons';

interface BestiaryProps {
  creatures: BestiaryCreature[];
  chapters?: Chapter[];
  editable?: boolean;
  onUpdateCreature?: (creature: BestiaryCreature) => void;
  onDeleteCreature?: (creatureId: string) => void;
}

// Icônes par type de créature
const creatureIcons: Record<BestiaryCreature['type'], string> = {
  beast: '🐺',
  humanoid: '👤',
  undead: '💀',
  dragon: '🐉',
  demon: '👿',
  elemental: '🔥',
  construct: '🤖',
  aberration: '👁️',
  celestial: '👼',
  fey: '🧚',
  giant: '🦣',
  ooze: '🟢',
  plant: '🌿',
  monstrosity: '👹',
};

const creatureTypeLabels: Record<BestiaryCreature['type'], string> = {
  beast: 'Bête',
  humanoid: 'Humanoïde',
  undead: 'Mort-vivant',
  dragon: 'Dragon',
  demon: 'Démon/Diable',
  elemental: 'Élémentaire',
  construct: 'Créature artificielle',
  aberration: 'Aberration',
  celestial: 'Céleste',
  fey: 'Fée/Esprit',
  giant: 'Géant',
  ooze: 'Vase',
  plant: 'Plante',
  monstrosity: 'Monstruosité',
};

const dangerColors: Record<BestiaryCreature['dangerLevel'], { bg: string; text: string; label: string }> = {
  trivial: { bg: 'bg-steel-600', text: 'text-steel-400', label: 'Insignifiant' },
  easy: { bg: 'bg-forest-600', text: 'text-forest-500', label: 'Facile' },
  medium: { bg: 'bg-valthera-500', text: 'text-valthera-300', label: 'Moyen' },
  hard: { bg: 'bg-orange-600', text: 'text-orange-300', label: 'Difficile' },
  deadly: { bg: 'bg-blood-600', text: 'text-blood-400', label: 'Mortel' },
  legendary: { bg: 'bg-purple-600', text: 'text-purple-300', label: 'Légendaire' },
};

const Bestiary: React.FC<BestiaryProps> = ({
  creatures,
  chapters = [],
  editable = false,
  onUpdateCreature,
  onDeleteCreature,
}) => {
  const [selectedCreature, setSelectedCreature] = useState<BestiaryCreature | null>(null);
  const [filterType, setFilterType] = useState<BestiaryCreature['type'] | 'all'>('all');
  const [filterDanger, setFilterDanger] = useState<BestiaryCreature['dangerLevel'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDefeatedOnly, setShowDefeatedOnly] = useState(false);

  // Filtrer les créatures
  const filteredCreatures = creatures.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterDanger !== 'all' && c.dangerLevel !== filterDanger) return false;
    if (showDefeatedOnly && !c.isDefeated) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.habitat?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Obtenir les types présents
  const presentTypes = [...new Set(creatures.map(c => c.type))];
  const presentDangers = [...new Set(creatures.map(c => c.dangerLevel))];

  const getChapterTitle = (chapterId?: string) => {
    if (!chapterId) return null;
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? `Chapitre ${chapter.order}: ${chapter.title}` : null;
  };

  // Statistiques
  const stats = {
    total: creatures.length,
    defeated: creatures.filter(c => c.isDefeated).length,
    legendary: creatures.filter(c => c.dangerLevel === 'legendary').length,
  };

  if (creatures.length === 0) {
    return (
      <div className="text-center py-12 bg-valthera-900/30 rounded-xl border border-dashed border-valthera-700">
        <Skull size={48} className="mx-auto text-valthera-700 mb-4" />
        <p className="text-valthera-200/60 text-lg">Aucune créature dans le bestiaire</p>
        <p className="text-valthera-200/40 text-sm mt-1">Les créatures rencontrées apparaîtront ici</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-valthera-100">{stats.total}</p>
            <p className="text-xs text-valthera-200/50">Créatures</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-forest-500">{stats.defeated}</p>
            <p className="text-xs text-valthera-200/50">Vaincues</p>
          </div>
          {stats.legendary > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.legendary}</p>
              <p className="text-xs text-valthera-200/50">Légendaires</p>
            </div>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-valthera-200/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-valthera-800 border border-valthera-700 rounded-lg text-valthera-100 placeholder-valthera-200/40 focus:outline-none focus:border-valthera-400"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        {/* Filtre par type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-valthera-800 border border-valthera-700 rounded-lg text-valthera-100 text-sm focus:outline-none focus:border-valthera-400"
        >
          <option value="all">Tous les types</option>
          {presentTypes.map(type => (
            <option key={type} value={type}>
              {creatureIcons[type]} {creatureTypeLabels[type]}
            </option>
          ))}
        </select>

        {/* Filtre par danger */}
        <select
          value={filterDanger}
          onChange={(e) => setFilterDanger(e.target.value as any)}
          className="px-3 py-2 bg-valthera-800 border border-valthera-700 rounded-lg text-valthera-100 text-sm focus:outline-none focus:border-valthera-400"
        >
          <option value="all">Tous les niveaux</option>
          {presentDangers.map(level => (
            <option key={level} value={level}>
              {dangerColors[level].label}
            </option>
          ))}
        </select>

        {/* Toggle vaincus */}
        <button
          onClick={() => setShowDefeatedOnly(!showDefeatedOnly)}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            showDefeatedOnly
              ? 'bg-forest-600 text-valthera-100'
              : 'bg-valthera-800 text-valthera-200/60 hover:text-valthera-100'
          }`}
        >
          ✓ Vaincus uniquement
        </button>

        {/* Reset */}
        {(filterType !== 'all' || filterDanger !== 'all' || searchQuery || showDefeatedOnly) && (
          <button
            onClick={() => {
              setFilterType('all');
              setFilterDanger('all');
              setSearchQuery('');
              setShowDefeatedOnly(false);
            }}
            className="px-4 py-2 bg-valthera-700 hover:bg-valthera-600 rounded-lg text-sm text-valthera-100 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Grille de créatures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCreatures.map((creature) => {
          const danger = dangerColors[creature.dangerLevel];
          return (
            <button
              key={creature.id}
              onClick={() => setSelectedCreature(creature)}
              className={`glass-panel rounded-xl overflow-hidden border transition-all hover:border-valthera-400/50 text-left ${
                creature.isDefeated ? 'border-forest-500/30' : 'border-valthera-700'
              }`}
            >
              {/* Image ou placeholder */}
              <div className="h-32 relative overflow-hidden bg-valthera-800">
                {creature.imageUrl ? (
                  <img
                    src={creature.imageUrl}
                    alt={creature.name}
                    className={`w-full h-full object-cover ${creature.isDefeated ? 'grayscale opacity-60' : ''}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {creatureIcons[creature.type]}
                  </div>
                )}
                
                {/* Badge danger */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${danger.bg} text-white`}>
                  {danger.label}
                </div>

                {/* Badge vaincu */}
                {creature.isDefeated && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold bg-forest-600 text-valthera-100">
                    ✓ Vaincu
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{creatureIcons[creature.type]}</span>
                  <h4 className="font-bold text-valthera-100 truncate">{creature.name}</h4>
                </div>
                <p className="text-xs text-valthera-200/50">{creatureTypeLabels[creature.type]}</p>
                <p className="text-sm text-valthera-200/70 mt-1 line-clamp-2">{creature.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-8 text-valthera-200/50">
          Aucune créature ne correspond aux filtres
        </div>
      )}

      {/* Modal détail créature */}
      {selectedCreature && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelectedCreature(null)}
        >
          <div 
            className="bg-valthera-900 rounded-2xl border border-valthera-700 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec image */}
            <div className="relative h-48">
              {selectedCreature.imageUrl ? (
                <img
                  src={selectedCreature.imageUrl}
                  alt={selectedCreature.name}
                  className={`w-full h-full object-cover ${selectedCreature.isDefeated ? 'grayscale opacity-60' : ''}`}
                />
              ) : (
                <div className="w-full h-full bg-valthera-800 flex items-center justify-center text-7xl">
                  {creatureIcons[selectedCreature.type]}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-valthera-900 via-valthera-900/50 to-transparent" />
              
              {/* Bouton fermer */}
              <button
                onClick={() => setSelectedCreature(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Nom et type */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{creatureIcons[selectedCreature.type]}</span>
                  <h2 className="text-2xl font-bold text-valthera-100">{selectedCreature.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-valthera-200/60">{creatureTypeLabels[selectedCreature.type]}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${dangerColors[selectedCreature.dangerLevel].bg} text-white`}>
                    {dangerColors[selectedCreature.dangerLevel].label}
                  </span>
                  {selectedCreature.isDefeated && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-forest-600 text-white">
                      ✓ Vaincu
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">Description</h4>
                <p className="text-valthera-200/80">{selectedCreature.description}</p>
              </div>

              {/* Habitat */}
              {selectedCreature.habitat && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">🏔️ Habitat</h4>
                  <p className="text-valthera-200/80">{selectedCreature.habitat}</p>
                </div>
              )}

              {/* Capacités */}
              {selectedCreature.abilities && selectedCreature.abilities.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">⚡ Capacités</h4>
                  <ul className="space-y-1">
                    {selectedCreature.abilities.map((ability, i) => (
                      <li key={i} className="text-valthera-200/80 flex items-start gap-2">
                        <span className="text-valthera-400">•</span>
                        {ability}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Loot */}
              {selectedCreature.loot && selectedCreature.loot.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">💎 Butin possible</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCreature.loot.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-valthera-400/20 border border-valthera-400/30 rounded text-sm text-valthera-300">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapitre de rencontre */}
              {selectedCreature.encounteredInChapter && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">📖 Rencontrée dans</h4>
                  <p className="text-valthera-400">
                    {getChapterTitle(selectedCreature.encounteredInChapter)}
                  </p>
                </div>
              )}

              {/* Notes MJ */}
              {selectedCreature.notes && (
                <div>
                  <h4 className="text-sm font-bold text-valthera-200/60 uppercase mb-2">📝 Notes du MJ</h4>
                  <p className="text-valthera-200/60 italic">{selectedCreature.notes}</p>
                </div>
              )}

              {/* Actions en mode édition */}
              {editable && (
                <div className="flex gap-3 pt-4 border-t border-valthera-700">
                  {onUpdateCreature && (
                    <button
                      onClick={() => {
                        onUpdateCreature({
                          ...selectedCreature,
                          isDefeated: !selectedCreature.isDefeated
                        });
                        setSelectedCreature({
                          ...selectedCreature,
                          isDefeated: !selectedCreature.isDefeated
                        });
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCreature.isDefeated
                          ? 'bg-valthera-700 hover:bg-valthera-600 text-valthera-100'
                          : 'bg-forest-600 hover:bg-forest-500 text-white'
                      }`}
                    >
                      {selectedCreature.isDefeated ? 'Marquer non vaincu' : '✓ Marquer vaincu'}
                    </button>
                  )}
                  {onDeleteCreature && (
                    <button
                      onClick={() => {
                        onDeleteCreature(selectedCreature.id);
                        setSelectedCreature(null);
                      }}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bestiary;
