import React, { useState } from 'react';
import { Campaign, Character, UniverseType, MapMarker, BestiaryCreature, ImagePosition } from '../types';
import { Plus, Trash2, Save, ArrowLeft, MapPin, Skull } from '../components/Icons';
import ImageUpload from '../components/ImageUpload';
import ImageUploadWithPosition from '../components/ImageUploadWithPosition';
import { generateUUID } from '../services/supabaseClient';
import InteractiveMap from '../components/InteractiveMap';

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
    mapImageUrl: '',
    mapMarkers: [],
    bestiary: [],
    characters: [],
    chapters: []
  });

  const [chars, setChars] = useState<Character[]>(initialData?.characters || []);
  const [markers, setMarkers] = useState<MapMarker[]>(initialData?.mapMarkers || []);
  const [bestiary, setBestiary] = useState<BestiaryCreature[]>(initialData?.bestiary || []);
  const [editingMarker, setEditingMarker] = useState<MapMarker | null>(null);
  const [editingCreature, setEditingCreature] = useState<BestiaryCreature | null>(null);
  const [activeSection, setActiveSection] = useState<'info' | 'characters' | 'npcs' | 'map' | 'bestiary'>('info');

  // Character management helpers
  const addChar = (isNPC: boolean = false) => {
    setChars([...chars, { 
      id: generateUUID(), 
      name: '', species: '', class: '', description: '', 
      player: isNPC ? '' : '', 
      imageUrl: '',
      isNPC,
      relations: []
    }]);
  };

  const updateChar = (index: number, field: keyof Character, value: any) => {
    console.log('[AdminCampaignForm] updateChar', { index, field, value });
    const newChars = [...chars];
    newChars[index] = { ...newChars[index], [field]: value };
    setChars(newChars);
  };

  const addRelation = (charIndex: number) => {
    const newChars = [...chars];
    const char = newChars[charIndex];
    if (!char.relations) char.relations = [];
    char.relations.push({ targetId: '', type: 'neutral', description: '' });
    setChars(newChars);
  };

  const updateRelation = (charIndex: number, relIndex: number, field: string, value: string) => {
    const newChars = [...chars];
    const relations = newChars[charIndex].relations || [];
    relations[relIndex] = { ...relations[relIndex], [field]: value };
    newChars[charIndex].relations = relations;
    setChars(newChars);
  };

  const removeRelation = (charIndex: number, relIndex: number) => {
    const newChars = [...chars];
    newChars[charIndex].relations = (newChars[charIndex].relations || []).filter((_, i) => i !== relIndex);
    setChars(newChars);
  };

  const removeChar = (index: number) => {
    setChars(chars.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.pitch) return;

    const campaign: Campaign = {
      id: initialData?.id || generateUUID(),
      title: formData.title,
      universe: formData.universe as UniverseType,
      pitch: formData.pitch,
      status: formData.status as any,
      imageUrl: formData.imageUrl || 'https://picsum.photos/800/400',
      mapImageUrl: formData.mapImageUrl || undefined,
      mapMarkers: markers,
      bestiary: bestiary,
      createdAt: initialData?.createdAt || Date.now(),
      chapters: initialData?.chapters || [],
      characters: chars
    };
    onSave(campaign);
  };

  // Gestion des marqueurs de carte
  const addMarker = (x: number, y: number) => {
    const newMarker: MapMarker = {
      id: generateUUID(),
      x,
      y,
      label: 'Nouveau lieu',
      type: 'landmark',
      description: ''
    };
    setMarkers([...markers, newMarker]);
    setEditingMarker(newMarker);
  };

  const updateMarker = (updated: MapMarker) => {
    setMarkers(markers.map(m => m.id === updated.id ? updated : m));
    setEditingMarker(null);
  };

  const deleteMarker = (markerId: string) => {
    setMarkers(markers.filter(m => m.id !== markerId));
  };

  // Gestion du bestiaire
  const addCreature = () => {
    const newCreature: BestiaryCreature = {
      id: generateUUID(),
      name: '',
      type: 'beast',
      dangerLevel: 'medium',
      description: '',
      abilities: [],
      loot: [],
      isDefeated: false
    };
    setEditingCreature(newCreature);
  };

  const saveCreature = (creature: BestiaryCreature) => {
    // Nettoyer les capacités et le loot (retirer les lignes vides)
    const cleanedCreature = {
      ...creature,
      abilities: creature.abilities.filter(a => a.trim()),
      loot: creature.loot.filter(l => l.trim()),
    };
    
    const exists = bestiary.find(c => c.id === cleanedCreature.id);
    if (exists) {
      setBestiary(bestiary.map(c => c.id === cleanedCreature.id ? cleanedCreature : c));
    } else {
      setBestiary([...bestiary, cleanedCreature]);
    }
    setEditingCreature(null);
  };

  const deleteCreature = (creatureId: string) => {
    setBestiary(bestiary.filter(c => c.id !== creatureId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={onCancel} className="mb-6 text-valthera-200/60 hover:text-valthera-100 flex items-center gap-2">
        <ArrowLeft size={16} /> Annuler
      </button>

      <h1 className="text-3xl font-bold text-valthera-100 mb-8">{initialData ? 'Modifier la Campagne' : 'Nouvelle Campagne'}</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main Info */}
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-bold text-valthera-100 mb-4">Informations Générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-valthera-200/60 text-sm mb-1">Titre</label>
              <input 
                required 
                className="w-full bg-valthera-900 border border-valthera-700 rounded p-2 text-valthera-100" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
               <label className="block text-valthera-200/60 text-sm mb-1">Univers</label>
               <select 
                 className="w-full bg-valthera-900 border border-valthera-700 rounded p-2 text-valthera-100"
                 value={formData.universe}
                 onChange={e => setFormData({...formData, universe: e.target.value as UniverseType})}
               >
                 <option value="valthera">Valthera</option>
                 <option value="hors-serie">Hors-Série</option>
               </select>
            </div>
          </div>

          <div>
             <label className="block text-valthera-200/60 text-sm mb-2">Image de couverture</label>
             <ImageUpload
               currentImage={formData.imageUrl}
               onImageChange={(url) => setFormData({...formData, imageUrl: url})}
               folder="campaigns"
               aspectRatio="video"
             />
             <p className="text-xs text-valthera-200/50 mt-2">
               Ou entrer une URL directement :
             </p>
             <input 
               className="w-full bg-valthera-900 border border-valthera-700 rounded p-2 text-valthera-100 mt-1 text-sm" 
               placeholder="https://..."
               value={formData.imageUrl}
               onChange={e => setFormData({...formData, imageUrl: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-valthera-200/60 text-sm mb-1">Pitch / Synopsis</label>
             <textarea 
               required
               rows={3}
               className="w-full bg-valthera-900 border border-valthera-700 rounded p-2 text-valthera-100" 
               value={formData.pitch}
               onChange={e => setFormData({...formData, pitch: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-valthera-200/60 text-sm mb-1">Statut</label>
             <select 
                className="w-full bg-valthera-900 border border-valthera-700 rounded p-2 text-valthera-100"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
             >
                <option value="active">Active</option>
                <option value="completed">Terminée</option>
                <option value="hiatus">En Pause</option>
             </select>
          </div>
        </div>

        {/* Characters - Joueurs */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-valthera-100">🎭 Personnages Joueurs (PJ)</h2>
              <button type="button" onClick={() => addChar(false)} className="text-valthera-400 hover:text-valthera-100 flex items-center gap-1 text-sm">
                 <Plus size={16} /> Ajouter PJ
              </button>
           </div>
           
           <div className="space-y-6">
              {chars.filter(c => !c.isNPC).map((char) => {
                const index = chars.findIndex(c => c.id === char.id);
                return (
                 <div key={char.id} className="p-4 bg-valthera-900/50 rounded-lg border border-valthera-800 relative">
                    <button 
                      type="button" 
                      onClick={() => removeChar(index)}
                      className="absolute top-2 right-2 text-valthera-600 hover:text-blood-400 z-10"
                    >
                       <Trash2 size={16} />
                    </button>
                    
                    <div className="flex gap-4">
                      {/* Image du personnage avec positionnement */}
                      <div className="w-28 flex-shrink-0">
                        <ImageUploadWithPosition
                          currentImage={char.imageUrl}
                          currentPosition={char.imagePosition || { x: 50, y: 50 }}
                          onImageChange={(url) => updateChar(index, 'imageUrl', url)}
                          onPositionChange={(pos) => updateChar(index, 'imagePosition', pos)}
                          folder="characters"
                        />
                      </div>
                      
                      {/* Infos du personnage */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          placeholder="Nom du personnage"
                          className="bg-transparent border-b border-valthera-700 p-1 text-valthera-100 text-sm"
                          value={char.name}
                          onChange={e => updateChar(index, 'name', e.target.value)}
                        />
                        <input 
                          placeholder="Espèce"
                          className="bg-transparent border-b border-valthera-700 p-1 text-valthera-100 text-sm"
                          value={char.species}
                          onChange={e => updateChar(index, 'species', e.target.value)}
                        />
                        <input 
                          placeholder="Classe"
                          className="bg-transparent border-b border-valthera-700 p-1 text-valthera-100 text-sm"
                          value={char.class}
                          onChange={e => updateChar(index, 'class', e.target.value)}
                        />
                        <input 
                          placeholder="Joueur (IRL)"
                          className="bg-transparent border-b border-valthera-700 p-1 text-valthera-100 text-sm"
                          value={char.player}
                          onChange={e => updateChar(index, 'player', e.target.value)}
                        />
                        <div className="md:col-span-2">
                          <input 
                            placeholder="Description courte..."
                            className="w-full bg-transparent border-b border-valthera-700 p-1 text-valthera-100 text-sm"
                            value={char.description}
                            onChange={e => updateChar(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Relations */}
                    <div className="mt-4 pt-4 border-t border-valthera-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-valthera-200/50">Relations</span>
                        <button 
                          type="button" 
                          onClick={() => addRelation(index)}
                          className="text-xs text-valthera-400 hover:text-valthera-300"
                        >
                          + Ajouter relation
                        </button>
                      </div>
                      {char.relations && char.relations.map((rel, relIdx) => (
                        <div key={relIdx} className="flex gap-2 mb-2 items-center">
                          <select
                            value={rel.targetId}
                            onChange={e => updateRelation(index, relIdx, 'targetId', e.target.value)}
                            className="bg-valthera-800 border border-valthera-700 rounded px-2 py-1 text-sm text-valthera-100 flex-1"
                          >
                            <option value="">-- Personnage --</option>
                            {chars.filter(c => c.id !== char.id).map(c => (
                              <option key={c.id} value={c.id}>{c.name || '(sans nom)'}</option>
                            ))}
                          </select>
                          <select
                            value={rel.type}
                            onChange={e => updateRelation(index, relIdx, 'type', e.target.value)}
                            className="bg-valthera-800 border border-valthera-700 rounded px-2 py-1 text-sm text-valthera-100"
                          >
                            <option value="ally">Allié</option>
                            <option value="enemy">Ennemi</option>
                            <option value="family">Famille</option>
                            <option value="romantic">Romance</option>
                            <option value="rival">Rival</option>
                            <option value="mentor">Mentor</option>
                            <option value="neutral">Neutre</option>
                          </select>
                          <button type="button" onClick={() => removeRelation(index, relIdx)} className="text-blood-400">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                 </div>
                );
              })}
              {chars.filter(c => !c.isNPC).length === 0 && <p className="text-valthera-200/50 text-sm italic">Aucun personnage joueur.</p>}
           </div>
        </div>

        {/* PNJs */}
        <div className="glass-panel p-6 rounded-xl">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-valthera-100">👥 Personnages Non-Joueurs (PNJ)</h2>
              <button type="button" onClick={() => addChar(true)} className="text-purple-400 hover:text-valthera-100 flex items-center gap-1 text-sm">
                 <Plus size={16} /> Ajouter PNJ
              </button>
           </div>
           
           <div className="space-y-6">
              {chars.filter(c => c.isNPC).map((char) => {
                const index = chars.findIndex(c => c.id === char.id);
                return (
                 <div key={char.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-800/50 relative">
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500/50 rounded text-xs text-white">PNJ</div>
                    <button 
                      type="button" 
                      onClick={() => removeChar(index)}
                      className="absolute top-2 right-2 text-valthera-600 hover:text-blood-400 z-10"
                    >
                       <Trash2 size={16} />
                    </button>
                    
                    <div className="flex gap-4 mt-6">
                      {/* Image avec positionnement */}
                      <div className="w-28 flex-shrink-0">
                        <ImageUploadWithPosition
                          currentImage={char.imageUrl}
                          currentPosition={char.imagePosition || { x: 50, y: 50 }}
                          onImageChange={(url) => updateChar(index, 'imageUrl', url)}
                          onPositionChange={(pos) => updateChar(index, 'imagePosition', pos)}
                          folder="characters"
                        />
                      </div>
                      
                      {/* Infos */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                          placeholder="Nom du PNJ"
                          className="bg-transparent border-b border-purple-700/50 p-1 text-valthera-100 text-sm"
                          value={char.name}
                          onChange={e => updateChar(index, 'name', e.target.value)}
                        />
                        <input 
                          placeholder="Espèce/Race"
                          className="bg-transparent border-b border-purple-700/50 p-1 text-valthera-100 text-sm"
                          value={char.species}
                          onChange={e => updateChar(index, 'species', e.target.value)}
                        />
                        <input 
                          placeholder="Rôle/Classe"
                          className="bg-transparent border-b border-purple-700/50 p-1 text-valthera-100 text-sm"
                          value={char.class}
                          onChange={e => updateChar(index, 'class', e.target.value)}
                        />
                        <div className="md:col-span-2">
                          <input 
                            placeholder="Description / Rôle dans l'histoire..."
                            className="w-full bg-transparent border-b border-purple-700/50 p-1 text-valthera-100 text-sm"
                            value={char.description}
                            onChange={e => updateChar(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                 </div>
                );
              })}
              {chars.filter(c => c.isNPC).length === 0 && <p className="text-valthera-200/50 text-sm italic">Aucun PNJ. Ajoutez des personnages importants de l'histoire !</p>}
           </div>
        </div>

        {/* Section Carte Interactive */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-valthera-100 flex items-center gap-2">
              <MapPin size={20} className="text-valthera-400" /> Carte de la Campagne
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-valthera-200/60 text-sm mb-2">Image de la carte (JPEG/PNG)</label>
              <ImageUpload
                currentImage={formData.mapImageUrl}
                onImageChange={(url) => setFormData({...formData, mapImageUrl: url})}
                folder="maps"
                aspectRatio="video"
              />
              <p className="text-xs text-valthera-200/50 mt-2">
                Importez votre carte générée, puis ajoutez des marqueurs interactifs
              </p>
            </div>

            {formData.mapImageUrl && (
              <div className="mt-4">
                <p className="text-valthera-200/60 text-sm mb-2">
                  📍 {markers.length} marqueur(s) placé(s) - Cliquez sur "Ajouter un lieu" puis sur la carte
                </p>
                <InteractiveMap
                  imageUrl={formData.mapImageUrl}
                  markers={markers}
                  chapters={initialData?.chapters || []}
                  editable={true}
                  onAddMarker={addMarker}
                  onDeleteMarker={deleteMarker}
                />
              </div>
            )}

            {/* Liste des marqueurs pour édition */}
            {markers.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-valthera-200/60 text-sm font-medium">Marqueurs :</p>
                {markers.map((marker, idx) => (
                  <div key={marker.id} className="flex items-center gap-3 p-3 bg-valthera-900/50 rounded-lg border border-valthera-800">
                    <span className="text-xl">
                      {marker.icon || {
                        city: '🏰', dungeon: '⚔️', landmark: '🗿', camp: '⛺',
                        battle: '💀', quest: '❗', treasure: '💎', danger: '⚠️'
                      }[marker.type]}
                    </span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        placeholder="Nom du lieu"
                        className="bg-valthera-800 border border-valthera-700 rounded px-2 py-1 text-valthera-100 text-sm"
                        value={marker.label}
                        onChange={e => setMarkers(markers.map(m => m.id === marker.id ? {...m, label: e.target.value} : m))}
                      />
                      <select
                        className="bg-valthera-800 border border-valthera-700 rounded px-2 py-1 text-valthera-100 text-sm"
                        value={marker.type}
                        onChange={e => setMarkers(markers.map(m => m.id === marker.id ? {...m, type: e.target.value as MapMarker['type']} : m))}
                      >
                        <option value="city">🏰 Ville</option>
                        <option value="dungeon">⚔️ Donjon</option>
                        <option value="landmark">🗿 Lieu notable</option>
                        <option value="camp">⛺ Campement</option>
                        <option value="battle">💀 Combat</option>
                        <option value="quest">❗ Quête</option>
                        <option value="treasure">💎 Trésor</option>
                        <option value="danger">⚠️ Danger</option>
                      </select>
                      <input
                        placeholder="Description..."
                        className="bg-valthera-800 border border-valthera-700 rounded px-2 py-1 text-valthera-100 text-sm"
                        value={marker.description || ''}
                        onChange={e => setMarkers(markers.map(m => m.id === marker.id ? {...m, description: e.target.value} : m))}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMarker(marker.id)}
                      className="text-valthera-200/50 hover:text-blood-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section Bestiaire */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-valthera-100 flex items-center gap-2">
              <Skull size={20} className="text-blood-400" /> Bestiaire
            </h2>
            <button 
              type="button" 
              onClick={addCreature} 
              className="text-blood-400 hover:text-valthera-100 flex items-center gap-1 text-sm"
            >
              <Plus size={16} /> Ajouter créature
            </button>
          </div>

          {bestiary.length === 0 ? (
            <p className="text-valthera-200/50 text-sm italic">
              Aucune créature dans le bestiaire. Ajoutez les monstres rencontrés !
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bestiary.map((creature) => (
                <div 
                  key={creature.id} 
                  className={`p-3 bg-valthera-900/50 rounded-lg border flex items-center gap-3 ${
                    creature.isDefeated ? 'border-forest-500/30' : 'border-valthera-800'
                  }`}
                >
                  <span className="text-2xl">
                    {{
                      beast: '🐺', humanoid: '👤', undead: '💀', dragon: '🐉',
                      demon: '👿', elemental: '🔥', construct: '🤖', aberration: '👁️',
                      celestial: '👼', fey: '🧚', giant: '🦣', ooze: '🟢',
                      plant: '🌿', monstrosity: '👹'
                    }[creature.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-valthera-100 truncate">{creature.name || 'Sans nom'}</p>
                    <p className="text-xs text-valthera-200/50">
                      {{
                        trivial: 'Insignifiant', easy: 'Facile', medium: 'Moyen',
                        hard: 'Difficile', deadly: 'Mortel', legendary: 'Légendaire'
                      }[creature.dangerLevel]}
                      {creature.isDefeated && ' • ✓ Vaincu'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingCreature(creature)}
                    className="text-valthera-200/50 hover:text-valthera-400"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCreature(creature.id)}
                    className="text-valthera-200/50 hover:text-blood-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal édition créature */}
        {editingCreature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-valthera-900 rounded-xl border border-valthera-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-valthera-100 mb-4">
                {bestiary.find(c => c.id === editingCreature.id) ? 'Modifier' : 'Nouvelle'} Créature
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-valthera-200/60 text-sm mb-1">Nom</label>
                    <input
                      className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                      value={editingCreature.name}
                      onChange={e => setEditingCreature({...editingCreature, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-valthera-200/60 text-sm mb-1">Type</label>
                    <select
                      className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                      value={editingCreature.type}
                      onChange={e => setEditingCreature({...editingCreature, type: e.target.value as BestiaryCreature['type']})}
                    >
                      <option value="beast">🐺 Bête</option>
                      <option value="humanoid">👤 Humanoïde</option>
                      <option value="undead">💀 Mort-vivant</option>
                      <option value="dragon">🐉 Dragon</option>
                      <option value="demon">👿 Démon/Diable</option>
                      <option value="elemental">🔥 Élémentaire</option>
                      <option value="construct">🤖 Créature artificielle</option>
                      <option value="aberration">👁️ Aberration</option>
                      <option value="celestial">👼 Céleste</option>
                      <option value="fey">🧚 Fée/Esprit</option>
                      <option value="giant">🦣 Géant</option>
                      <option value="ooze">🟢 Vase</option>
                      <option value="plant">🌿 Plante</option>
                      <option value="monstrosity">👹 Monstruosité</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Niveau de danger</label>
                  <select
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                    value={editingCreature.dangerLevel}
                    onChange={e => setEditingCreature({...editingCreature, dangerLevel: e.target.value as BestiaryCreature['dangerLevel']})}
                  >
                    <option value="trivial">Insignifiant</option>
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                    <option value="deadly">Mortel</option>
                    <option value="legendary">Légendaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Image (URL)</label>
                  <input
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                    placeholder="https://..."
                    value={editingCreature.imageUrl || ''}
                    onChange={e => setEditingCreature({...editingCreature, imageUrl: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                    value={editingCreature.description}
                    onChange={e => setEditingCreature({...editingCreature, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Habitat</label>
                  <input
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100"
                    placeholder="Forêts, grottes, marais..."
                    value={editingCreature.habitat || ''}
                    onChange={e => setEditingCreature({...editingCreature, habitat: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Capacités (une par ligne)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100 text-sm"
                    placeholder="Souffle de feu&#10;Vol&#10;Régénération"
                    value={(editingCreature.abilities || []).join('\n')}
                    onChange={e => setEditingCreature({...editingCreature, abilities: e.target.value.split('\n')})}
                  />
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Butin possible (une par ligne)</label>
                  <textarea
                    rows={2}
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100 text-sm"
                    placeholder="Écailles de dragon&#10;Gemme de feu"
                    value={(editingCreature.loot || []).join('\n')}
                    onChange={e => setEditingCreature({...editingCreature, loot: e.target.value.split('\n')})}
                  />
                </div>

                <div>
                  <label className="block text-valthera-200/60 text-sm mb-1">Notes du MJ</label>
                  <textarea
                    rows={2}
                    className="w-full bg-valthera-800 border border-valthera-700 rounded p-2 text-valthera-100 text-sm"
                    placeholder="Notes privées..."
                    value={editingCreature.notes || ''}
                    onChange={e => setEditingCreature({...editingCreature, notes: e.target.value})}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefeated"
                    checked={editingCreature.isDefeated || false}
                    onChange={e => setEditingCreature({...editingCreature, isDefeated: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isDefeated" className="text-valthera-200/80">Créature vaincue</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingCreature(null)}
                  className="px-4 py-2 text-valthera-200/60 hover:text-valthera-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => saveCreature(editingCreature)}
                  className="px-4 py-2 bg-valthera-500 hover:bg-valthera-400 text-valthera-950 rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
           <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg hover:bg-valthera-800 text-valthera-200/80">Annuler</button>
           <button 
            type="submit" 
            className="bg-valthera-500 hover:bg-valthera-400 text-valthera-950 px-8 py-2 rounded-lg font-bold flex items-center gap-2"
           >
             <Save size={18} /> Enregistrer
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCampaignForm;