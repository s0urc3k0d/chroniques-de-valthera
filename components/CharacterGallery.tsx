import React, { useState } from 'react';
import { Character } from '../types';
import { User, Users } from '../components/Icons';

interface CharacterGalleryProps {
  characters: Character[];
  showNPCs?: boolean;
}

const CharacterGallery: React.FC<CharacterGalleryProps> = ({ characters, showNPCs = true }) => {
  const [filter, setFilter] = useState<'all' | 'pj' | 'pnj'>('all');

  const pjs = characters.filter(c => !c.isNPC);
  const pnjs = characters.filter(c => c.isNPC);

  const filteredCharacters = filter === 'all' 
    ? characters 
    : filter === 'pj' 
    ? pjs 
    : pnjs;

  const relationTypeLabels: Record<string, { label: string; color: string }> = {
    ally: { label: 'Allié', color: 'text-green-400' },
    enemy: { label: 'Ennemi', color: 'text-red-400' },
    family: { label: 'Famille', color: 'text-blue-400' },
    romantic: { label: 'Romance', color: 'text-pink-400' },
    rival: { label: 'Rival', color: 'text-orange-400' },
    mentor: { label: 'Mentor', color: 'text-purple-400' },
    neutral: { label: 'Neutre', color: 'text-slate-400' },
  };

  // Labels inversés pour les relations bidirectionnelles
  const inverseRelationLabels: Record<string, string> = {
    ally: 'Allié de',
    enemy: 'Ennemi de',
    family: 'Famille de',
    romantic: 'Romance avec',
    rival: 'Rival de',
    mentor: 'Élève de', // Inverse de mentor
    neutral: 'Neutre avec',
  };

  const getCharacterById = (id: string) => characters.find(c => c.id === id);

  // Trouver toutes les relations pour un personnage (directes + inverses)
  const getAllRelationsForCharacter = (char: Character) => {
    const directRelations = (char.relations || []).map(rel => ({
      ...rel,
      isDirect: true,
      displayLabel: relationTypeLabels[rel.type]?.label || rel.type
    }));

    // Trouver les relations inverses (où ce personnage est la cible)
    const inverseRelations: Array<{ targetId: string; type: string; description?: string; isDirect: boolean; displayLabel: string }> = [];
    characters.forEach(otherChar => {
      if (otherChar.id === char.id) return;
      otherChar.relations?.forEach(rel => {
        if (rel.targetId === char.id) {
          inverseRelations.push({
            targetId: otherChar.id,
            type: rel.type,
            description: rel.description,
            isDirect: false,
            displayLabel: inverseRelationLabels[rel.type] || rel.type
          });
        }
      });
    });

    return [...directRelations, ...inverseRelations];
  };

  return (
    <div>
      {/* Filtres */}
      {showNPCs && pnjs.length > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === 'all' 
                ? 'bg-valthera-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tous ({characters.length})
          </button>
          <button
            onClick={() => setFilter('pj')}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              filter === 'pj' 
                ? 'bg-valthera-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <User size={14} /> Joueurs ({pjs.length})
          </button>
          <button
            onClick={() => setFilter('pnj')}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              filter === 'pnj' 
                ? 'bg-valthera-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} /> PNJs ({pnjs.length})
          </button>
        </div>
      )}

      {/* Grille de personnages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharacters.map((char) => (
          <div 
            key={char.id}
            className={`glass-panel rounded-xl overflow-hidden border transition-all hover:border-valthera-500/50 ${
              char.isNPC ? 'border-purple-500/30' : 'border-slate-700'
            }`}
          >
            {/* Image */}
            <div className="h-48 relative overflow-hidden">
              {char.imageUrl ? (
                <img 
                  src={char.imageUrl} 
                  alt={char.name}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: char.imagePosition 
                      ? `${char.imagePosition.x}% ${char.imagePosition.y}%` 
                      : 'center'
                  }}
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <User size={48} className="text-slate-600" />
                </div>
              )}
              
              {/* Badge PNJ */}
              {char.isNPC && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-purple-500/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                  PNJ
                </div>
              )}
              
              {/* Joueur */}
              {!char.isNPC && char.player && (
                <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-slate-300">
                  Joué par {char.player}
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="p-4">
              <h4 className="text-lg font-bold text-white">{char.name}</h4>
              <p className="text-sm text-valthera-400">{char.species} • {char.class}</p>
              <p className="text-sm text-slate-400 mt-2 line-clamp-3">{char.description}</p>

              {/* Relations (directes + inverses) */}
              {(() => {
                const allRelations = getAllRelationsForCharacter(char);
                return allRelations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Relations</p>
                    <div className="flex flex-wrap gap-2">
                      {allRelations.map((rel, i) => {
                        const target = getCharacterById(rel.targetId);
                        if (!target) return null;
                        const typeInfo = relationTypeLabels[rel.type];
                        return (
                          <span 
                            key={i}
                            className={`text-xs px-2 py-1 bg-slate-800 rounded ${typeInfo?.color || 'text-slate-400'} ${!rel.isDirect ? 'opacity-80 italic' : ''}`}
                            title={rel.description || `${rel.displayLabel} ${target.name}`}
                          >
                            {rel.displayLabel}: {target.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Aucun personnage à afficher
        </div>
      )}
    </div>
  );
};

export default CharacterGallery;
