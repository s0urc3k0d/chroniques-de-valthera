import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Move, Eye } from 'lucide-react';
import { uploadImage } from '../services/imageService';
import { ImagePosition } from '../types';

interface ImageUploadWithPositionProps {
  currentImage?: string;
  currentPosition?: ImagePosition;
  onImageChange: (url: string) => void;
  onPositionChange?: (position: ImagePosition) => void;
  folder?: 'campaigns' | 'characters';
  className?: string;
}

const ImageUploadWithPosition: React.FC<ImageUploadWithPositionProps> = ({
  currentImage,
  currentPosition = { x: 50, y: 50 },
  onImageChange,
  onPositionChange,
  folder = 'characters',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [position, setPosition] = useState<ImagePosition>(currentPosition);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Synchroniser avec les props
  useEffect(() => {
    setPosition(currentPosition);
  }, [currentPosition.x, currentPosition.y]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadImage(file, folder);
      if (url) {
        onImageChange(url);
        // Réinitialiser la position au centre pour la nouvelle image
        const newPosition = { x: 50, y: 50 };
        setPosition(newPosition);
        onPositionChange?.(newPosition);
      } else {
        setError("Erreur lors de l'upload");
      }
    } catch (err) {
      setError("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onImageChange('');
    setPosition({ x: 50, y: 50 });
    onPositionChange?.({ x: 50, y: 50 });
    if (inputRef.current) inputRef.current.value = '';
  };

  // Gestion du repositionnement par drag
  const handleRepositionStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRepositioning) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleRepositionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingImage || !containerRef.current) return;
    e.preventDefault();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculer la nouvelle position (inversée car on déplace l'image, pas le cadre)
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setPosition({ x, y });
  };

  const handleRepositionEnd = () => {
    if (isDraggingImage) {
      setIsDraggingImage(false);
      onPositionChange?.(position);
    }
  };

  // Boutons de positionnement rapide
  const quickPositions: { label: string; pos: ImagePosition; icon: string }[] = [
    { label: 'Haut', pos: { x: 50, y: 20 }, icon: '⬆️' },
    { label: 'Centre', pos: { x: 50, y: 50 }, icon: '⏺️' },
    { label: 'Bas', pos: { x: 50, y: 80 }, icon: '⬇️' },
  ];

  return (
    <div className={className}>
      {/* Conteneur principal avec aperçu côte à côte en mode repositionnement */}
      <div className={`${isRepositioning ? 'flex gap-3' : ''}`}>
        {/* Zone d'upload / repositionnement */}
        <div className={isRepositioning ? 'flex-1' : ''}>
          <div
            ref={containerRef}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isRepositioning) setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={isRepositioning ? undefined : handleDrop}
            onClick={() => !isRepositioning && inputRef.current?.click()}
            onMouseDown={handleRepositionStart}
            onMouseMove={handleRepositionMove}
            onMouseUp={handleRepositionEnd}
            onMouseLeave={handleRepositionEnd}
            onTouchStart={handleRepositionStart}
            onTouchMove={handleRepositionMove}
            onTouchEnd={handleRepositionEnd}
            className={`
              relative aspect-square rounded-xl border-2 overflow-hidden
              transition-all duration-300
              ${isRepositioning ? 'cursor-move border-valthera-500' : 'cursor-pointer border-dashed'}
              ${dragOver ? 'border-valthera-400 bg-valthera-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'}
              ${currentImage ? 'border-solid' : ''}
            `}
          >
            {currentImage ? (
              <>
                <img
                  src={currentImage}
                  alt="Aperçu"
                  className="absolute w-full h-full object-cover select-none"
                  draggable={false}
                  style={{
                    objectPosition: `${position.x}% ${position.y}%`,
                  }}
                />
                
                {/* Overlay mode repositionnement */}
                {isRepositioning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Move size={24} className="mx-auto mb-1 animate-pulse" />
                      <p className="text-xs font-medium">Glissez pour repositionner</p>
                    </div>
                  </div>
                )}

                {/* Overlay normal (hover) */}
                {!isRepositioning && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm">Cliquer pour changer</span>
                  </div>
                )}

                {/* Bouton supprimer */}
                {!isRepositioning && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors z-10"
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-valthera-400" />
                    <span className="mt-2 text-sm">Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm text-center px-2">Glisser ou cliquer</span>
                    <span className="text-xs mt-1 text-slate-600">Max 5 Mo</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Label sous l'image principale en mode repositionnement */}
          {isRepositioning && (
            <p className="text-xs text-slate-500 text-center mt-1">Image source</p>
          )}
        </div>

        {/* Aperçu en temps réel (affiché à côté en mode repositionnement) */}
        {isRepositioning && currentImage && showPreview && (
          <div className="flex-1">
            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500/50 bg-slate-900">
              <img
                src={currentImage}
                alt="Aperçu du cadrage"
                className="absolute w-full h-full object-cover"
                style={{
                  objectPosition: `${position.x}% ${position.y}%`,
                }}
              />
              {/* Indicateur "Aperçu" */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/80 backdrop-blur-sm rounded text-xs font-bold text-white flex items-center gap-1">
                <Eye size={12} />
                Aperçu
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-1">Résultat final</p>
          </div>
        )}
      </div>

      {/* Contrôles de positionnement */}
      {currentImage && (
        <div className="mt-2 space-y-2">
          {/* Bouton activer/désactiver le mode repositionnement */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsRepositioning(!isRepositioning);
            }}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              isRepositioning
                ? 'bg-valthera-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Move size={14} />
            {isRepositioning ? 'Terminer le cadrage' : 'Recadrer le visage'}
          </button>

          {/* Positionnement rapide */}
          {isRepositioning && (
            <div className="flex gap-1">
              {quickPositions.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPosition(qp.pos);
                    onPositionChange?.(qp.pos);
                  }}
                  className={`flex-1 py-1 px-2 rounded text-xs transition-colors ${
                    Math.abs(position.y - qp.pos.y) < 10 && Math.abs(position.x - qp.pos.x) < 10
                      ? 'bg-valthera-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                  title={qp.label}
                >
                  {qp.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploadWithPosition;
