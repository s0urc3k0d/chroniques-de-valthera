import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Move, Check } from 'lucide-react';
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
  const [showCropModal, setShowCropModal] = useState(false);
  const [position, setPosition] = useState<ImagePosition>(currentPosition);
  const [tempPosition, setTempPosition] = useState<ImagePosition>(currentPosition);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cropAreaRef = useRef<HTMLDivElement>(null);

  // Synchroniser avec les props
  useEffect(() => {
    setPosition(currentPosition);
    setTempPosition(currentPosition);
  }, [currentPosition.x, currentPosition.y]);

  // Debug: log currentImage on each render to detect prop updates
  console.log('[ImageUploadWithPosition] render currentImage ->', currentImage);

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
      console.log('[ImageUploadWithPosition] upload returned url ->', url);
      if (url) {
        console.log('[ImageUploadWithPosition] calling onImageChange with url');
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
    setTempPosition({ x: 50, y: 50 });
    onPositionChange?.({ x: 50, y: 50 });
    if (inputRef.current) inputRef.current.value = '';
  };

  // Ouvrir la modale de recadrage
  const openCropModal = () => {
    setTempPosition(position);
    setShowCropModal(true);
  };

  // Confirmer le recadrage
  const confirmCrop = () => {
    setPosition(tempPosition);
    onPositionChange?.(tempPosition);
    setShowCropModal(false);
  };

  // Annuler le recadrage
  const cancelCrop = () => {
    setTempPosition(position);
    setShowCropModal(false);
  };

  // Gestion du repositionnement par drag dans la modale
  const handleCropStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(true);
  };

  const handleCropMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingImage || !cropAreaRef.current) return;
    e.preventDefault();

    const container = cropAreaRef.current;
    const rect = container.getBoundingClientRect();

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Calculer la nouvelle position
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));

    setTempPosition({ x, y });
  };

  const handleCropEnd = () => {
    setIsDraggingImage(false);
  };

  // Boutons de positionnement rapide
  const quickPositions: { label: string; pos: ImagePosition; icon: string }[] = [
    { label: 'Haut-Gauche', pos: { x: 25, y: 25 }, icon: '↖️' },
    { label: 'Haut', pos: { x: 50, y: 20 }, icon: '⬆️' },
    { label: 'Haut-Droite', pos: { x: 75, y: 25 }, icon: '↗️' },
    { label: 'Gauche', pos: { x: 20, y: 50 }, icon: '⬅️' },
    { label: 'Centre', pos: { x: 50, y: 50 }, icon: '⏺️' },
    { label: 'Droite', pos: { x: 80, y: 50 }, icon: '➡️' },
    { label: 'Bas-Gauche', pos: { x: 25, y: 75 }, icon: '↙️' },
    { label: 'Bas', pos: { x: 50, y: 80 }, icon: '⬇️' },
    { label: 'Bas-Droite', pos: { x: 75, y: 75 }, icon: '↘️' },
  ];

  return (
    <div className={className}>
      {/* Zone d'upload compacte */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative aspect-square rounded-xl border-2 overflow-hidden cursor-pointer
          transition-all duration-300
          ${dragOver ? 'border-valthera-400 bg-valthera-500/10' : 'border-valthera-700 hover:border-valthera-600 bg-valthera-900/50'}
          ${currentImage ? 'border-solid' : 'border-dashed'}
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
            
            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm">Changer l'image</span>
            </div>

            {/* Bouton supprimer */}
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
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-valthera-200/50">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-valthera-400" />
                <span className="mt-2 text-sm">Upload...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs text-center px-2">Glisser ou cliquer</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bouton recadrer */}
      {currentImage && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openCropModal();
          }}
          className="w-full mt-2 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 bg-valthera-800 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700"
        >
          <Move size={14} />
          Recadrer
        </button>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* MODALE DE RECADRAGE PLEIN ÉCRAN */}
      {showCropModal && currentImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={cancelCrop}
        >
          <div 
            className="bg-valthera-900 rounded-2xl border border-valthera-700 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-valthera-100 mb-2 flex items-center gap-2">
              <Move size={20} className="text-valthera-400" />
              Recadrer l'image
            </h3>
            <p className="text-valthera-200/60 text-sm mb-6">
              Glissez sur l'image pour positionner le centre du cadrage. L'aperçu à droite montre le résultat final.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Zone de recadrage - Image source */}
              <div>
                <p className="text-valthera-200/80 text-sm font-medium mb-2">📷 Image source (glissez pour repositionner)</p>
                <div
                  ref={cropAreaRef}
                  onMouseDown={handleCropStart}
                  onMouseMove={handleCropMove}
                  onMouseUp={handleCropEnd}
                  onMouseLeave={handleCropEnd}
                  onTouchStart={handleCropStart}
                  onTouchMove={handleCropMove}
                  onTouchEnd={handleCropEnd}
                  className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-valthera-500 cursor-move bg-valthera-800"
                >
                  {/* Image complète avec indicateur de position */}
                  <img
                    src={currentImage}
                    alt="Source"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />
                  
                  {/* Indicateur de position (croix) */}
                  <div 
                    className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${tempPosition.x}%`, top: `${tempPosition.y}%` }}
                  >
                    <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white shadow-lg"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg"></div>
                  </div>
                  
                  {/* Overlay avec instructions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none">
                    <div className="absolute bottom-3 left-3 right-3 text-center">
                      <p className="text-white text-sm font-medium drop-shadow-lg">
                        Position : {Math.round(tempPosition.x)}%, {Math.round(tempPosition.y)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons de positionnement rapide (grille 3x3) */}
                <div className="mt-4">
                  <p className="text-valthera-200/60 text-xs mb-2">Positionnement rapide :</p>
                  <div className="grid grid-cols-3 gap-1">
                    {quickPositions.map((qp) => (
                      <button
                        key={qp.label}
                        type="button"
                        onClick={() => setTempPosition(qp.pos)}
                        className={`py-2 px-2 rounded text-lg transition-colors ${
                          Math.abs(tempPosition.y - qp.pos.y) < 10 && Math.abs(tempPosition.x - qp.pos.x) < 10
                            ? 'bg-valthera-500 text-valthera-950'
                            : 'bg-valthera-800 hover:bg-valthera-700'
                        }`}
                        title={qp.label}
                      >
                        {qp.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Aperçu en temps réel */}
              <div>
                <p className="text-valthera-200/80 text-sm font-medium mb-2">✨ Aperçu du résultat</p>
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-forest-500/50 bg-valthera-800">
                  <img
                    src={currentImage}
                    alt="Aperçu du cadrage"
                    className="absolute w-full h-full object-cover"
                    style={{
                      objectPosition: `${tempPosition.x}% ${tempPosition.y}%`,
                    }}
                  />
                  {/* Badge aperçu */}
                  <div className="absolute top-3 left-3 px-3 py-1.5 bg-forest-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                    Aperçu en temps réel
                  </div>
                </div>
                
                <p className="text-valthera-200/50 text-xs mt-3 text-center">
                  C'est ainsi que l'image apparaîtra dans la galerie des personnages.
                </p>
              </div>
            </div>

            {/* Boutons de confirmation */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-valthera-800">
              <button
                type="button"
                onClick={cancelCrop}
                className="px-5 py-2.5 text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmCrop}
                className="px-5 py-2.5 bg-valthera-500 hover:bg-valthera-400 text-valthera-950 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Check size={18} />
                Appliquer le cadrage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithPosition;
