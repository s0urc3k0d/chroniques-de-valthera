import React, { useEffect, useState } from 'react';
import { useAppContext } from '../App';
import { generateRSSFeed } from '../services/feedService';
import { ArrowLeft, Rss, Download } from '../components/Icons';
import { Link } from 'react-router-dom';

const RSSFeedPage: React.FC = () => {
  const { campaigns, isLoading } = useAppContext();
  const [rssContent, setRssContent] = useState<string>('');

  useEffect(() => {
    if (!isLoading && campaigns.length > 0) {
      const baseUrl = window.location.origin;
      const rss = generateRSSFeed(campaigns, baseUrl);
      setRssContent(rss);
    }
  }, [campaigns, isLoading]);

  const handleDownload = () => {
    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chroniques-de-valthera.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = () => {
    // Pour une SPA, le RSS n'est pas disponible via URL directe
    // On copie l'URL de cette page
    navigator.clipboard.writeText(`${window.location.origin}/rss`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/"
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Retour à l'accueil</span>
      </Link>

      <div className="glass-panel rounded-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
            <Rss size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Flux RSS</h1>
            <p className="text-slate-400">Suivez les dernières sessions de jeu</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-lg font-bold text-white mb-3">📖 Comment utiliser le flux RSS ?</h2>
            <p className="text-slate-300 mb-4">
              Le flux RSS vous permet de recevoir automatiquement les notifications 
              des nouvelles sessions dans votre lecteur RSS préféré (Feedly, Inoreader, etc.)
            </p>
            <ol className="list-decimal list-inside text-slate-400 space-y-2">
              <li>Téléchargez le fichier RSS ci-dessous</li>
              <li>Importez-le dans votre lecteur RSS</li>
              <li>Ou copiez l'URL et ajoutez-la manuellement</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-valthera-600 hover:bg-valthera-500 text-white rounded-lg transition-colors"
            >
              <Download size={20} />
              Télécharger le fichier RSS
            </button>
            <button
              onClick={handleCopyUrl}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Rss size={20} />
              Copier l'URL du flux
            </button>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Aperçu du flux RSS</h3>
            <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-auto">
              <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap">
                {rssContent}
              </pre>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-400 text-sm">
              💡 <strong>Note :</strong> Comme cette application est une SPA (Single Page Application), 
              le flux RSS n'est pas directement accessible via une URL. Téléchargez le fichier 
              et importez-le manuellement dans votre lecteur RSS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RSSFeedPage;
