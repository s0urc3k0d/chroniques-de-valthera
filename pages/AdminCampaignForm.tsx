import React, { useState } from 'react';
import { Campaign, Character, UniverseType } from '../types';
import { Plus, Trash2, Save, ArrowLeft, Sparkles } from '../components/Icons';
import { generateCampaignIdeas } from '../services/geminiService';

interface AdminCampaignFormProps {
  initialData?: Campaign;
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

const AdminCampaignForm: React.FC<AdminCampaignFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Campaign>>(initialData || {
    title: '',
    universe: 'valthera',
    pitch: '',
    status: 'active',
    imageUrl: 'https://picsum.photos/800/400',
    characters: [],
    chapters: []
  });

  const [chars, setChars] = useState<Character[]>(initialData?.characters || []);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Character management helpers
  const addChar = () => {
    setChars([...chars, { 
      id: Date.now().toString(), 
      name: '', species: '', class: '', description: '', player: '', 
      imageUrl: 'https://picsum.photos/200' 
    }]);
  };

  const updateChar = (index: number, field: keyof Character, value: string) => {
    const newChars = [...chars];
    newChars[index] = { ...newChars[index], [field]: value };
    setChars(newChars);
  };

  const removeChar = (index: number) => {
    setChars(chars.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pitch) return;

    const campaign: Campaign = {
      id: initialData?.id || Date.now().toString(),
      title: formData.title,
      universe: formData.universe as UniverseType,
      pitch: formData.pitch,
      status: formData.status as any,
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/400',
      createdAt: initialData?.createdAt || Date.now(),
      chapters: initialData?.chapters || [],
      characters: chars
    };
    onSave(campaign);
  };

  const handleAiGenerate = async () => {
    if (!formData.pitch || !formData.universe) return;
    setAiLoading(true);
    const ideas = await generateCampaignIdeas(formData.pitch, formData.universe);
    setAiSuggestion(ideas);
    setAiLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={onCancel} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2">
        <ArrowLeft size={16} /> Annuler
      </button>

      <h1 className="text-3xl font-bold text-white mb-8">{initialData ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Info */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Informations Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Titre</label>
              <input 
                required 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-slate-400 text-sm mb-1">Univers</label>
               <select 
                 className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                 value={formData.universe}
                 onChange={e => setFormData({...formData, universe: e.target.value as UniverseType})}
               >
                 <option value="valthera">Valthera</option>
                 <option value="hors-univers">Hors-Univers</option>
               </select>
            </div>
          </div>

          <div>
             <label className="block text-slate-400 text-sm mb-1">Image de couverture (URL)</label>
             <input 
               className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" 
               value={formData.imageUrl}
               onChange={e => setFormData({...formData, imageUrl: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-slate-400 text-sm mb-1">Pitch / Synopsis</label>
             <textarea 
               required
               rows={3}
               className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" 
               value={formData.pitch}
               onChange={e => setFormData({...formData, pitch: e.target.value})}
             />
          </div>

           {/* AI Helper */}
           <div className="mt-4">
              <button 
                type="button" 
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="text-xs flex items-center gap-1 text-valthera-400 hover:text-valthera-300"
              >
                <Sparkles size={14} /> 
                {aiLoading ? 'Génération...' : 'Besoin d\'inspiration ? (IA)'}
              </button>
              {aiSuggestion && (
                 <div className="mt-2 p-3 bg-indigo-900/30 border border-indigo-500/30 rounded text-sm text-indigo-200 whitespace-pre-line">
                   {aiSuggestion}
                 </div>
              )}
           </div>

          <div>
             <label className="block text-slate-400 text-sm mb-1">Statut</label>
             <select 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
             >
                <option value="active">Active</option>
                <option value="completed">Terminée</option>
                <option value="hiatus">En Pause</option>
             </select>
          </div>
        </div>

        {/* Characters */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Personnages</h2>
              <button type="button" onClick={addChar} className="text-valthera-400 hover:text-white flex items-center gap-1 text-sm">
                 <Plus size={16} /> Ajouter
              </button>
           </div>
           
           <div className="space-y-6">
              {chars.map((char, index) => (
                 <div key={char.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                    <button 
                      type="button" 
                      onClick={() => removeChar(index)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-red-400"
                    >
                       <Trash2 size={16} />
                    </button>
                    <input 
                      placeholder="Nom du personnage"
                      className="bg-transparent border-b border-slate-700 p-1 text-white text-sm"
                      value={char.name}
                      onChange={e => updateChar(index, 'name', e.target.value)}
                    />
                     <input 
                      placeholder="Espèce"
                      className="bg-transparent border-b border-slate-700 p-1 text-white text-sm"
                      value={char.species}
                      onChange={e => updateChar(index, 'species', e.target.value)}
                    />
                     <input 
                      placeholder="Classe"
                      className="bg-transparent border-b border-slate-700 p-1 text-white text-sm"
                      value={char.class}
                      onChange={e => updateChar(index, 'class', e.target.value)}
                    />
                     <input 
                      placeholder="Joueur (IRL)"
                      className="bg-transparent border-b border-slate-700 p-1 text-white text-sm"
                      value={char.player}
                      onChange={e => updateChar(index, 'player', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <input 
                        placeholder="Description courte..."
                        className="w-full bg-transparent border-b border-slate-700 p-1 text-white text-sm"
                        value={char.description}
                        onChange={e => updateChar(index, 'description', e.target.value)}
                      />
                    </div>
                     <div className="md:col-span-2">
                      <input 
                        placeholder="Image URL"
                        className="w-full bg-transparent border-b border-slate-700 p-1 text-slate-400 text-xs"
                        value={char.imageUrl}
                        onChange={e => updateChar(index, 'imageUrl', e.target.value)}
                      />
                    </div>
                 </div>
              ))}
              {chars.length === 0 && <p className="text-slate-500 text-sm italic">Aucun personnage.</p>}
           </div>
        </div>

        <div className="flex justify-end gap-4">
           <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg hover:bg-slate-800 text-slate-300">Annuler</button>
           <button 
            type="submit" 
            className="bg-valthera-600 hover:bg-valthera-500 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2"
           >
             <Save size={18} /> Enregistrer
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCampaignForm;