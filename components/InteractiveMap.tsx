import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapMarker, Chapter } from '../types';
import { X, ZoomIn, ZoomOut, Maximize2, Navigation } from '../components/Icons';

interface InteractiveMapProps {
  imageUrl: string;
  markers: MapMarker[];
  chapters?: Chapter[];
  onMarkerClick?: (marker: MapMarker) => void;
  editable?: boolean;
  onAddMarker?: (x: number, y: number) => void;
  onUpdateMarker?: (marker: MapMarker) => void;
  onDeleteMarker?: (markerId: string) => void;
}

// Icônes par type de marqueur
const markerIcons: Record<MapMarker['type'], string> = {
  city: '🏰',
  dungeon: '⚔️',
  landmark: '🗿',
  camp: '⛺',
  battle: '💀',
  quest: '❗',
  treasure: '💎',
  danger: '⚠️',
};

const markerColors: Record<MapMarker['type'], string> = {
  city: 'bg-amber-500',
  dungeon: 'bg-red-600',
  landmark: 'bg-blue-500',
  camp: 'bg-green-500',
  battle: 'bg-red-500',
  quest: 'bg-yellow-500',
  treasure: 'bg-purple-500',
  danger: 'bg-orange-600',
};

const markerLabels: Record<MapMarker['type'], string> = {
  city: 'Ville/Cité',
  dungeon: 'Donjon',
  landmark: 'Lieu notable',
  camp: 'Campement',
  battle: 'Combat',
  quest: 'Quête',
  treasure: 'Trésor',
  danger: 'Zone dangereuse',
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  imageUrl,
  markers,
  chapters = [],
  onMarkerClick,
  editable = false,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddMode, setShowAddMode] = useState(false);

  // Gestion du zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 4));
  }, []);

  // Gestion du scroll pour zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleZoom(e.deltaY > 0 ? -0.2 : 0.2);
  }, [handleZoom]);

  // Empêcher le scroll natif sur le conteneur
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    container.addEventListener('wheel', preventScroll, { passive: false });
    return () => container.removeEventListener('wheel', preventScroll);
  }, []);

  // Gestion du drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showAddMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  // Clic pour ajouter un marqueur (mode édition)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!showAddMode || !onAddMarker) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const img = e.currentTarget.querySelector('img');
    if (!img) return;

    const imgRect = img.getBoundingClientRect();
    const x = ((e.clientX - imgRect.left) / imgRect.width) * 100;
    const y = ((e.clientY - imgRect.top) / imgRect.height) * 100;
    
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      onAddMarker(x, y);
      setShowAddMode(false);
    }
  };

  // Réinitialiser la vue
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      resetView();
    }
  };

  // Fermer le popup avec Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMarker(null);
        setIsFullscreen(false);
        setShowAddMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getChapterTitle = (chapterId?: string) => {
    if (!chapterId) return null;
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? `Chapitre ${chapter.order}: ${chapter.title}` : null;
  };

  // Contenu de la carte (réutilisé en mode normal et plein écran)
  const renderMapContent = (fullscreen: boolean) => (
    <div
      ref={fullscreen ? undefined : containerRef}
      className={`relative overflow-hidden bg-slate-900 ${fullscreen ? 'w-full h-full' : 'rounded-xl aspect-[16/10]'}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleMapClick}
      style={{ cursor: isDragging ? 'grabbing' : showAddMode ? 'crosshair' : 'grab' }}
    >
      {/* Image de la carte */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <img
          src={imageUrl}
          alt="Carte de la campagne"
          className="max-w-none select-none"
          draggable={false}
          style={{ 
            width: isFullscreen ? 'auto' : '100%',
            height: isFullscreen ? '100vh' : 'auto',
            maxHeight: isFullscreen ? '100vh' : 'none',
            objectFit: 'contain'
          }}
        />
        
        {/* Marqueurs */}
        {markers.map((marker) => (
          <button
            type="button"
            key={marker.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedMarker(marker);
              onMarkerClick?.(marker);
            }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 group`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            title={marker.label}
          >
            <div className={`
              w-8 h-8 rounded-full ${markerColors[marker.type]} 
              flex items-center justify-center text-lg
              shadow-lg border-2 border-white/50
              transition-transform hover:scale-125 hover:z-10
              ${selectedMarker?.id === marker.id ? 'ring-2 ring-white scale-125' : ''}
            `}>
              {marker.icon || markerIcons[marker.type]}
            </div>
            {/* Label au survol */}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap bg-black/80 px-2 py-0.5 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {marker.label}
            </span>
          </button>
        ))}
      </div>

      {/* Contrôles */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleZoom(0.3); }}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur rounded-lg flex items-center justify-center text-white transition-colors"
          title="Zoom +"
        >
          <ZoomIn size={20} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleZoom(-0.3); }}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur rounded-lg flex items-center justify-center text-white transition-colors"
          title="Zoom -"
        >
          <ZoomOut size={20} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); resetView(); }}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur rounded-lg flex items-center justify-center text-white transition-colors"
          title="Réinitialiser"
        >
          <Navigation size={20} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFullscreen(); }}
          className="w-10 h-10 bg-black/60 hover:bg-black/80 backdrop-blur rounded-lg flex items-center justify-center text-white transition-colors"
          title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
        >
          {isFullscreen ? <X size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Mode ajout de marqueur */}
      {editable && (
        <div className="absolute top-4 left-4 z-10">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddMode(!showAddMode); }}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              showAddMode 
                ? 'bg-valthera-600 text-white' 
                : 'bg-black/60 hover:bg-black/80 backdrop-blur text-white'
            }`}
          >
            {showAddMode ? '❌ Annuler' : '📍 Ajouter un lieu'}
          </button>
          {showAddMode && (
            <p className="mt-2 text-xs text-white bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg">
              Cliquez sur la carte pour placer le marqueur
            </p>
          )}
        </div>
      )}

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/60 backdrop-blur rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2 font-medium">Légende</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(markerIcons).map(([type, icon]) => (
              <div key={type} className="flex items-center gap-2 text-xs text-white">
                <span>{icon}</span>
                <span>{markerLabels[type as MapMarker['type']]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicateur de zoom */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-white z-10">
        {Math.round(zoom * 100)}%
      </div>

      {/* Popup détail marqueur */}
      {selectedMarker && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-80 max-w-[90vw]"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div className="glass-panel rounded-xl border border-slate-600 shadow-2xl overflow-hidden">
            <div className={`${markerColors[selectedMarker.type]} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedMarker.icon || markerIcons[selectedMarker.type]}</span>
                <div>
                  <h3 className="font-bold text-white">{selectedMarker.label}</h3>
                  <p className="text-xs text-white/80">{markerLabels[selectedMarker.type]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarker(null); }}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedMarker.description && (
                <p className="text-sm text-slate-300">{selectedMarker.description}</p>
              )}
              {selectedMarker.linkedChapterId && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-valthera-400">📖</span>
                  <span className="text-slate-400">
                    {getChapterTitle(selectedMarker.linkedChapterId)}
                  </span>
                </div>
              )}
              {editable && onDeleteMarker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteMarker(selectedMarker.id);
                    setSelectedMarker(null);
                  }}
                  className="w-full mt-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
                >
                  Supprimer ce marqueur
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay fullscreen */}
      {fullscreen && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <h2 className="text-xl font-bold text-white bg-black/60 backdrop-blur px-6 py-2 rounded-full">
            🗺️ Carte de la campagne
          </h2>
        </div>
      )}
    </div>
  );

  // En mode plein écran, utiliser un portail pour rendre en dehors du DOM parent
  if (isFullscreen) {
    return createPortal(
      <div 
        className="fixed inset-0 z-[9999] bg-black"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {renderMapContent(true)}
      </div>,
      document.body
    );
  }

  return renderMapContent(false);
};

export default InteractiveMap;
