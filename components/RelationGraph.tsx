import React from 'react';
import { Character, CharacterRelation } from '../types';
import { Link2 } from '../components/Icons';

interface RelationGraphProps {
  characters: Character[];
}

const RelationGraph: React.FC<RelationGraphProps> = ({ characters }) => {
  // Filtrer les personnages qui ont des relations
  const charactersWithRelations = characters.filter(c => c.relations && c.relations.length > 0);

  const relationColors: Record<string, string> = {
    ally: '#22c55e',
    enemy: '#ef4444',
    family: '#3b82f6',
    romantic: '#ec4899',
    rival: '#f97316',
    mentor: '#a855f7',
    neutral: '#64748b',
  };

  const relationLabels: Record<string, string> = {
    ally: 'Allié',
    enemy: 'Ennemi',
    family: 'Famille',
    romantic: 'Romance',
    rival: 'Rival',
    mentor: 'Mentor',
    neutral: 'Neutre',
  };

  // Créer une liste unique de toutes les relations
  const allRelations: { from: Character; to: Character; relation: CharacterRelation }[] = [];
  const seenPairs = new Set<string>();

  charactersWithRelations.forEach(char => {
    char.relations?.forEach(rel => {
      const target = characters.find(c => c.id === rel.targetId);
      if (target) {
        const pairKey = [char.id, target.id].sort().join('-');
        if (!seenPairs.has(pairKey)) {
          seenPairs.add(pairKey);
          allRelations.push({ from: char, to: target, relation: rel });
        }
      }
    });
  });

  if (allRelations.length === 0) {
    return (
      <div className="text-center py-12 bg-valthera-900/30 rounded-xl border border-dashed border-valthera-700">
        <Link2 size={32} className="mx-auto text-valthera-600 mb-3" />
        <p className="text-valthera-200/50">Aucune relation définie entre les personnages</p>
        <p className="text-valthera-600 text-sm mt-1">Les relations peuvent être ajoutées dans l'admin</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Légende */}
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(relationLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: relationColors[type] }}
            />
            <span className="text-valthera-200/60">{label}</span>
          </div>
        ))}
      </div>

      {/* Liste des relations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRelations.map(({ from, to, relation }, index) => (
          <div 
            key={index}
            className="glass-panel p-4 rounded-xl border border-valthera-700 flex items-center gap-4"
          >
            {/* Personnage 1 */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-valthera-800 flex-shrink-0">
                {from.imageUrl ? (
                  <img 
                    src={from.imageUrl} 
                    alt={from.name} 
                    className="w-full h-full object-cover" 
                    style={{
                      objectPosition: from.imagePosition 
                        ? `${from.imagePosition.x}% ${from.imagePosition.y}%` 
                        : 'center'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-valthera-600 text-lg font-bold">
                    {from.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-valthera-100 font-medium truncate">{from.name}</p>
                <p className="text-xs text-valthera-200/50">{from.class}</p>
              </div>
            </div>

            {/* Relation */}
            <div className="flex flex-col items-center px-4">
              <div 
                className="px-3 py-1 rounded-full text-xs font-medium text-valthera-100"
                style={{ backgroundColor: relationColors[relation.type] }}
              >
                {relationLabels[relation.type]}
              </div>
              {relation.description && (
                <p className="text-xs text-valthera-200/50 mt-1 text-center max-w-[120px] truncate" title={relation.description}>
                  {relation.description}
                </p>
              )}
            </div>

            {/* Personnage 2 */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-valthera-100 font-medium truncate">{to.name}</p>
                <p className="text-xs text-valthera-200/50">{to.class}</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden bg-valthera-800 flex-shrink-0">
                {to.imageUrl ? (
                  <img 
                    src={to.imageUrl} 
                    alt={to.name} 
                    className="w-full h-full object-cover" 
                    style={{
                      objectPosition: to.imagePosition 
                        ? `${to.imagePosition.x}% ${to.imagePosition.y}%` 
                        : 'center'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-valthera-600 text-lg font-bold">
                    {to.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelationGraph;
