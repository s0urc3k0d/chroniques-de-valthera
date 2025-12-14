import React, { useState, useMemo } from 'react';
import { 
  WorldEvent, 
  WorldEra, 
  worldEraLabels, 
  worldEraColors, 
  worldEraYears,
  eventTypeLabels,
  eventTypeIcons 
} from '../types/lore';
import { X, ChevronLeft, ChevronRight } from './Icons';

interface WorldTimelineProps {
  events: WorldEvent[];
  editable?: boolean;
  onAddEvent?: () => void;
  onEditEvent?: (event: WorldEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
}

const WorldTimeline: React.FC<WorldTimelineProps> = ({
  events,
  editable = false,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  const [selectedEra, setSelectedEra] = useState<WorldEra | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);

  // Trier et filtrer les événements
  const filteredEvents = useMemo(() => {
    let filtered = [...events].sort((a, b) => a.year - b.year);
    
    if (selectedEra !== 'all') {
      filtered = filtered.filter(e => e.era === selectedEra);
    }
    
    return filtered;
  }, [events, selectedEra]);

  // Grouper par ère
  const eventsByEra = useMemo(() => {
    const grouped: Record<WorldEra, WorldEvent[]> = {
      'age-of-dawn': [],
      'age-of-empires': [],
      'age-of-shadows': [],
      'age-of-rebirth': [],
      'current-age': [],
    };
    
    events.forEach(event => {
      grouped[event.era].push(event);
    });
    
    // Trier chaque ère par année
    Object.keys(grouped).forEach(era => {
      grouped[era as WorldEra].sort((a, b) => a.year - b.year);
    });
    
    return grouped;
  }, [events]);

  // Importance styles
  const importanceStyles = {
    minor: 'border-valthera-600 bg-valthera-800/50',
    major: 'border-valthera-500 bg-valthera-900/30',
    legendary: 'border-yellow-500 bg-yellow-900/20 ring-1 ring-yellow-500/30',
  };

  const importanceLabels = {
    minor: 'Mineur',
    major: 'Majeur',
    legendary: 'Légendaire',
  };

  // Ères disponibles (toutes ou celles avec des événements)
  const eras: WorldEra[] = ['age-of-dawn', 'age-of-empires', 'age-of-shadows', 'age-of-rebirth', 'current-age'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-valthera-100 flex items-center gap-3">
            📜 Chronologie de Valthera
          </h2>
          <p className="text-valthera-200/60 mt-1">
            {events.length} événement{events.length > 1 ? 's' : ''} à travers les âges
          </p>
        </div>

        {editable && onAddEvent && (
          <button
            onClick={onAddEvent}
            className="px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-lg transition-colors"
          >
            + Ajouter un événement
          </button>
        )}
      </div>

      {/* Filtres par ère */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedEra('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedEra === 'all'
              ? 'bg-valthera-600 text-valthera-100'
              : 'bg-valthera-800 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700'
          }`}
        >
          Tous les âges
        </button>
        {eras.map(era => (
          <button
            key={era}
            onClick={() => setSelectedEra(era)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedEra === era
                ? `${worldEraColors[era]} text-valthera-100`
                : 'bg-valthera-800 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700'
            }`}
          >
            {worldEraLabels[era]}
            <span className="text-xs opacity-70">({eventsByEra[era].length})</span>
          </button>
        ))}
      </div>

      {/* Timeline visuelle */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-bold text-valthera-100 mb-2">Aucun événement</h3>
          <p className="text-valthera-200/60">
            La chronologie est vide pour le moment.
          </p>
          {editable && onAddEvent && (
            <button
              onClick={onAddEvent}
              className="mt-4 px-6 py-3 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-lg transition-colors"
            >
              Créer le premier événement
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-valthera-500 via-purple-500 to-slate-700"></div>

          {/* Événements */}
          <div className="space-y-8">
            {selectedEra === 'all' ? (
              // Afficher par ère
              eras.map(era => {
                const eraEvents = eventsByEra[era];
                if (eraEvents.length === 0) return null;
                
                return (
                  <div key={era} className="relative">
                    {/* Marqueur d'ère */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-8 h-8 md:absolute md:left-1/2 md:-translate-x-1/2 rounded-full ${worldEraColors[era]} flex items-center justify-center z-10 ring-4 ring-void-950`}>
                        <span className="text-valthera-100 text-xs font-bold">⚔</span>
                      </div>
                      <div className="md:absolute md:left-1/2 md:translate-x-6">
                        <h3 className="text-xl font-display font-bold text-valthera-100">
                          {worldEraLabels[era]}
                        </h3>
                        <p className="text-sm text-valthera-200/60">
                          An {worldEraYears[era].start} - {worldEraYears[era].end || 'Présent'}
                        </p>
                      </div>
                    </div>

                    {/* Événements de l'ère */}
                    <div className="space-y-4 ml-12 md:ml-0">
                      {eraEvents.map((event, index) => (
                        <EventCard 
                          key={event.id}
                          event={event}
                          isLeft={index % 2 === 0}
                          onSelect={() => setSelectedEvent(event)}
                          styles={importanceStyles}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Afficher les événements filtrés
              <div className="space-y-4 ml-12 md:ml-0">
                {filteredEvents.map((event, index) => (
                  <EventCard 
                    key={event.id}
                    event={event}
                    isLeft={index % 2 === 0}
                    onSelect={() => setSelectedEvent(event)}
                    styles={importanceStyles}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal détail événement */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {selectedEvent.imageUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-valthera-400 mb-1">
                    <span className={`px-2 py-0.5 rounded ${worldEraColors[selectedEvent.era]} text-white text-xs`}>
                      {worldEraLabels[selectedEvent.era]}
                    </span>
                    <span>•</span>
                    <span>An {selectedEvent.year}</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-valthera-100">
                    {eventTypeIcons[selectedEvent.type]} {selectedEvent.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-valthera-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-valthera-200/60" />
                </button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-valthera-700 text-valthera-200/80 rounded-full text-sm">
                  {eventTypeLabels[selectedEvent.type]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedEvent.importance === 'legendary' 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
                    : selectedEvent.importance === 'major'
                      ? 'bg-valthera-500/20 text-valthera-400 border border-valthera-500/50'
                      : 'bg-valthera-700 text-valthera-200/60'
                }`}>
                  {importanceLabels[selectedEvent.importance]}
                </span>
              </div>

              {/* Description */}
              <p className="text-valthera-200/80 leading-relaxed">
                {selectedEvent.description}
              </p>

              {/* Actions admin */}
              {editable && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-valthera-700">
                  <button
                    onClick={() => {
                      onEditEvent?.(selectedEvent);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 bg-valthera-600 hover:bg-valthera-500 text-valthera-100 rounded-lg transition-colors"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Supprimer cet événement ?')) {
                        onDeleteEvent?.(selectedEvent.id);
                        setSelectedEvent(null);
                      }
                    }}
                    className="px-4 py-2 bg-blood-600/20 hover:bg-blood-600/40 text-blood-400 border border-blood-500/50 rounded-lg transition-colors"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant carte d'événement
interface EventCardProps {
  event: WorldEvent;
  isLeft: boolean;
  onSelect: () => void;
  styles: Record<string, string>;
}

const EventCard: React.FC<EventCardProps> = ({ event, isLeft, onSelect, styles }) => {
  return (
    <div className={`relative flex ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
      {/* Point sur la timeline */}
      <div className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full ${worldEraColors[event.era]} ring-4 ring-void-950 z-10`}></div>
      
      {/* Carte */}
      <button
        onClick={onSelect}
        className={`
          w-full md:w-5/12 
          ${isLeft ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'} 
          text-left group
        `}
      >
        <div className={`
          p-4 rounded-xl border transition-all
          ${styles[event.importance]}
          hover:border-valthera-500/50 hover:bg-valthera-800/80
        `}>
          {/* Année */}
          <div className="text-sm text-valthera-400 font-medium mb-1">
            An {event.year}
          </div>
          
          {/* Titre */}
          <h4 className="text-lg font-bold text-valthera-100 group-hover:text-valthera-400 transition-colors flex items-center gap-2">
            <span>{eventTypeIcons[event.type]}</span>
            {event.title}
          </h4>
          
          {/* Description courte */}
          <p className="text-sm text-valthera-200/60 mt-2 line-clamp-2">
            {event.description}
          </p>
          
          {/* Badge importance */}
          {event.importance === 'legendary' && (
            <div className="mt-3">
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                ⭐ Légendaire
              </span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default WorldTimeline;
