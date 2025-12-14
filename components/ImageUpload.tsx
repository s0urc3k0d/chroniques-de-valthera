import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../services/imageService';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string) => void;
  folder?: 'campaigns' | 'characters';
  className?: string;
  aspectRatio?: 'video' | 'square'; // video = 16:9, square = 1:1
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  folder = 'campaigns' as const,
  className = '',
  aspectRatio = 'video'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = aspectRatio === 'square' ? 'aspect-square' : 'aspect-video';

  const handleFile = async (file: File) => {
    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const url = await uploadImage(file, folder);
      if (url) {
        onImageChange(url);
      } else {
        setError('Erreur lors de l\'upload');
      }
    } catch (err) {
      setError('Erreur lors de l\'upload');
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
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative ${aspectClass} rounded-xl border-2 border-dashed cursor-pointer
          transition-all duration-300 overflow-hidden
          ${dragOver 
            ? 'border-valthera-400 bg-valthera-500/10' 
            : 'border-valthera-700 hover:border-valthera-600 bg-valthera-900/50'
          }
          ${currentImage ? 'border-solid' : ''}
        `}
      >
        {currentImage ? (
          <>
            <img
              src={currentImage}
              alt="Aperçu"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm">Cliquer pour changer</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
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
                <span className="mt-2 text-sm">Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-sm">Glisser une image ou cliquer</span>
                <span className="text-xs mt-1 text-valthera-200/40">PNG, JPG jusqu'à 5 Mo</span>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

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

export default ImageUpload;
