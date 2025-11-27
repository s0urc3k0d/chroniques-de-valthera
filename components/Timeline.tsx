import React from 'react';
import { Chapter } from '../types';
import { Calendar, BookOpen, Play } from '../components/Icons';

interface TimelineProps {
  chapters: Chapter[];
  onChapterClick?: (chapterId: string) => void;
}

const Timeline: React.FC<TimelineProps> = ({ chapters, onChapterClick }) => {
  // Trier par date de session
  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
  );

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Aucune session à afficher
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-valthera-500 via-valthera-600 to-slate-700" />

      <div className="space-y-6">
        {sortedChapters.map((chapter, index) => (
          <div 
            key={chapter.id}
            className="relative pl-12 group cursor-pointer"
            onClick={() => onChapterClick?.(chapter.id)}
          >
            {/* Point sur la timeline */}
            <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 transition-all ${
              index === sortedChapters.length - 1
                ? 'bg-valthera-500 border-valthera-400 shadow-lg shadow-valthera-500/50'
                : 'bg-slate-800 border-slate-600 group-hover:border-valthera-500'
            }`} />

            {/* Contenu */}
            <div className="glass-panel p-4 rounded-xl border border-slate-700 group-hover:border-valthera-500/50 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Calendar size={12} />
                    <span>
                      {new Date(chapter.sessionDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Session {chapter.order}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-valthera-400 transition-colors">
                    {chapter.title}
                  </h4>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {chapter.summary.replace(/[#*_`]/g, '').substring(0, 150)}...
                  </p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {chapter.youtubeLink && (
                    <div className="p-2 bg-red-500/10 rounded-lg" title="Session enregistrée">
                      <Play size={16} className="text-red-400" />
                    </div>
                  )}
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <BookOpen size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Highlights preview */}
              {chapter.highlights && chapter.highlights.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {chapter.highlights.slice(0, 3).map((h, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-slate-800/50 rounded text-slate-400">
                      {h}
                    </span>
                  ))}
                  {chapter.highlights.length > 3 && (
                    <span className="text-xs px-2 py-1 text-slate-500">
                      +{chapter.highlights.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
