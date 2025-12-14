import React from 'react';
import { Play } from '../components/Icons';

interface YouTubePlayerProps {
  url: string;
  title?: string;
}

/**
 * Extrait l'ID de la vidéo YouTube depuis différents formats d'URL
 */
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // ID direct
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ url, title }) => {
  const videoId = extractYouTubeId(url);
  
  if (!videoId) {
    return (
      <div className="bg-valthera-900/50 rounded-xl p-4 border border-valthera-700">
        <p className="text-valthera-200/50 text-sm flex items-center gap-2">
          <Play size={16} />
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-valthera-400 hover:underline">
            Voir la vidéo sur YouTube
          </a>
        </p>
      </div>
    );
  }

  // Construire l'URL embed avec les paramètres nécessaires
  const embedUrl = `https://www.youtube.com/embed/${videoId}?origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`;

  return (
    <div className="rounded-xl overflow-hidden border border-valthera-700 bg-valthera-900">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title || 'Vidéo de session'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <div className="px-4 py-2 bg-valthera-800/50 flex items-center justify-between">
        <span className="text-sm text-valthera-200/60 flex items-center gap-2">
          <Play size={14} className="text-blood-500" />
          Session enregistrée
        </span>
        <a 
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-valthera-200/50 hover:text-valthera-100"
        >
          Ouvrir sur YouTube →
        </a>
      </div>
    </div>
  );
};

export default YouTubePlayer;
