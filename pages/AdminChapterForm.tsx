import React, { useState } from 'react';
import { Campaign, Chapter } from '../types';
import { Save, ArrowLeft, Sparkles, Plus, Trash2 } from '../components/Icons';
import { enhanceSessionSummary } from '../services/geminiService';

interface AdminChapterFormProps {
  campaign: Campaign;
  initialData?: Chapter;
  onSave: (updatedCampaign: Campaign) => void;
  onCancel: () => void;
}

const AdminChapterForm: React.FC<AdminChapterFormProps> = ({ campaign, initialData, onSave, onCancel }) => {
  // If initialData exists, we edit. If not, we determine the next order number.
  const nextOrder = initialData ? initialData.order : (campaign.chapters.length > 0 ? Math.max(...campaign.chapters.map(c => c.order)) + 1 : 1);

  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.sessionDate || new Date().toISOString().split('T')[0]);
  const [youtube, setYoutube] = useState(initialData?.youtubeLink || '');
  
  // Note: we start with raw notes for AI, or the existing summary
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
  const [loot, setLoot] = useState<string[]>(initialData?.loot || []);

  // AI State
  const [rawNotes, setRawNotes] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!rawNotes) return;
    setIsEnhancing(true);
    try {
      const result = await enhanceSessionSummary(rawNotes);
      setSummary(result.summary);
      setHighlights(result.highlights);
      setLoot(result.loot);
    } catch (e) {
      alert("Erreur IA");
    }
    setIsEnhancing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const chapter: Chapter = {
      id: initialData?.id || Date.now().toString(),
      campaignId: campaign.id,
      title,
      sessionDate: date,
      summary,
      highlights,
      loot,
      youtubeLink: youtube || undefined,
      order: nextOrder
    };

    let newChapters = [...campaign.chapters];
    if (initialData) {
      newChapters = newChapters.map(c => c.id === chapter.id ? chapter : c);
    } else {
      newChapters.push(chapter);
    }

    onSave({ ...campaign, chapters: newChapters });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onCancel} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2">
        <ArrowLeft size={16} /> Annuler
      </button>

      <h1 className="text-3xl font-bold text-white mb-2">
        {initialData ? `Éditer Chapitre ${initialData.order}` : `Nouveau Chapitre (Session ${nextOrder})`}
      </h1>
      <p className="text-slate-400 mb-8">Campagne : {campaign.title}</p>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-slate-400 text-sm mb-1">Titre de la session</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
             </div>
             <div>
                <label className="block text-slate-400 text-sm mb-1">Date</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
             </div>
           </div>

           <div>
              <label className="block text-slate-400 text-sm mb-1">Lien Youtube (Optionnel)</label>
              <input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" />
           </div>

           {/* AI Tool */}
           <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg mt-6">
              <h3 className="text-indigo-300 font-bold text-sm mb-2 flex items-center gap-2"><Sparkles size={16}/> Assistant Rédaction (IA)</h3>
              <p className="text-slate-400 text-xs mb-3">Collez vos notes brutes ici, l'IA les formatera en résumé épique.</p>
              <textarea 
                className="w-full bg-slate-900/80 border border-slate-700 rounded p-2 text-slate-300 text-sm h-24 mb-2"
                placeholder="- Combat contre les gobelins - Trouvé une épée magique - Le barde a encore raté son jet"
                value={rawNotes}
                onChange={e => setRawNotes(e.target.value)}
              />
              <button 
                type="button" 
                onClick={handleEnhance} 
                disabled={!rawNotes || isEnhancing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded shadow-lg disabled:opacity-50"
              >
                {isEnhancing ? 'Transformation...' : 'Transformer mes notes'}
              </button>
           </div>

           {/* Manual Edit / Result */}
           <div>
              <label className="block text-slate-400 text-sm mb-1">Résumé Narratif</label>
              <textarea 
                required 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-40"
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
           </div>

           {/* Arrays for Highlights & Loot */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-slate-400 text-sm mb-2">Points Forts (Highlights)</label>
                 {highlights.map((h, i) => (
                   <div key={i} className="flex gap-2 mb-2">
                     <input className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={h} onChange={e => {
                       const n = [...highlights]; n[i] = e.target.value; setHighlights(n);
                     }} />
                     <button type="button" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} className="text-red-400"><Trash2 size={16}/></button>
                   </div>
                 ))}
                 <button type="button" onClick={() => setHighlights([...highlights, ''])} className="text-xs text-valthera-400 flex items-center gap-1"><Plus size={14}/> Ajouter</button>
              </div>

              <div>
                 <label className="block text-slate-400 text-sm mb-2">Butin (Loot)</label>
                 {loot.map((l, i) => (
                   <div key={i} className="flex gap-2 mb-2">
                     <input className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-sm text-white" value={l} onChange={e => {
                       const n = [...loot]; n[i] = e.target.value; setLoot(n);
                     }} />
                     <button type="button" onClick={() => setLoot(loot.filter((_, idx) => idx !== i))} className="text-red-400"><Trash2 size={16}/></button>
                   </div>
                 ))}
                 <button type="button" onClick={() => setLoot([...loot, ''])} className="text-xs text-amber-400 flex items-center gap-1"><Plus size={14}/> Ajouter</button>
              </div>
           </div>

        </div>

        <div className="flex justify-end gap-4">
            <button type="submit" className="bg-valthera-600 hover:bg-valthera-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2">
               <Save size={20} /> Sauvegarder Chapitre
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminChapterForm;