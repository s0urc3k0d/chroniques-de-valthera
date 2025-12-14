import React, { useState } from 'react';
import { Edit3, BookOpen } from '../components/Icons';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Écrivez votre texte ici... (Markdown supporté)',
  rows = 8
}) => {
  const [showPreview, setShowPreview] = useState(false);

  // Fonction simple pour parser le Markdown basique
  const parseMarkdown = (text: string): string => {
    return text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-valthera-100 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-valthera-100 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-valthera-100 mt-4 mb-2">$1</h1>')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-valthera-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-valthera-200/80">$1</em>')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br/>');
  };

  const toolbarButtons = [
    { label: 'Gras', md: '**texte**', icon: 'B' },
    { label: 'Italique', md: '*texte*', icon: 'I' },
    { label: 'Titre', md: '## Titre', icon: 'H' },
    { label: 'Liste', md: '- item', icon: '•' },
  ];

  const insertMarkdown = (md: string) => {
    onChange(value + (value ? '\n' : '') + md);
  };

  return (
    <div className="rounded-xl border border-valthera-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-valthera-800/50 px-3 py-2 border-b border-valthera-700">
        <div className="flex gap-1">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              onClick={() => insertMarkdown(btn.md)}
              className="px-2 py-1 text-sm text-valthera-200/60 hover:text-valthera-100 hover:bg-valthera-700 rounded transition-colors"
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              !showPreview ? 'bg-valthera-600 text-valthera-100' : 'text-valthera-200/60 hover:text-valthera-100'
            }`}
          >
            <Edit3 size={14} /> Éditer
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              showPreview ? 'bg-valthera-600 text-valthera-100' : 'text-valthera-200/60 hover:text-valthera-100'
            }`}
          >
            <BookOpen size={14} /> Aperçu
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div 
          className="p-4 min-h-[200px] bg-valthera-900/50 text-valthera-200/80 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(value) || '<span class="text-valthera-200/50 italic">Rien à afficher...</span>' }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-4 bg-valthera-900/50 text-valthera-100 placeholder-valthera-200/50 resize-none focus:outline-none"
        />
      )}

      {/* Help text */}
      <div className="px-3 py-2 bg-valthera-800/30 border-t border-valthera-700 text-xs text-valthera-200/50">
        Supporte le Markdown : **gras**, *italique*, ## Titre, - liste
      </div>
    </div>
  );
};

export default MarkdownEditor;
