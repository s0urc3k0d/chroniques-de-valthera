import React, { useState } from 'react';
import { Link, NavigateFunction } from 'react-router-dom';
import { Campaign } from '../types';
import { Plus, Edit3, Trash2, BookOpen, ChevronDown, ChevronUp, ScrollText } from '../components/Icons';

interface AdminDashboardProps {
  campaigns: Campaign[];
  onDelete: (id: string) => void;
  onDeleteChapter: (campaignId: string, chapterId: string) => void;
  navigate: NavigateFunction;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ campaigns, onDelete, onDeleteChapter, navigate }) => {
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedCampaignId === id) {
      setExpandedCampaignId(null);
    } else {
      setExpandedCampaignId(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-display font-bold text-valthera-100">Tableau de Bord MJ</h1>
        <Link
          to="/admin/campagne/nouvelle"
          className="bg-valthera-600 hover:bg-valthera-500 text-valthera-100 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nouvelle Campagne
        </Link>
      </div>

      <div className="bg-valthera-900/50 rounded-xl border border-valthera-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-valthera-900 border-b border-valthera-700 text-valthera-200/60 text-sm uppercase">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Univers</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Chapitres</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-valthera-700">
              {campaigns.map((camp) => (
                <React.Fragment key={camp.id}>
                  <tr className={`hover:bg-valthera-800/50 transition-colors ${expandedCampaignId === camp.id ? 'bg-valthera-800/30' : ''}`}>
                    <td className="px-6 py-4 text-valthera-200/50 cursor-pointer" onClick={() => toggleExpand(camp.id)}>
                       {expandedCampaignId === camp.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </td>
                    <td className="px-6 py-4 font-medium text-valthera-100">{camp.title}</td>
                    <td className="px-6 py-4 text-valthera-200/70 capitalize">{camp.universe}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        camp.status === 'active' ? 'bg-forest-500/10 text-forest-500' :
                        camp.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-valthera-200/70">{camp.chapters.length}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <Link 
                        to={`/campagne/${camp.id}`}
                        className="p-2 text-valthera-200/60 hover:text-valthera-100 bg-valthera-800 rounded-md"
                        title="Voir"
                      >
                        <BookOpen size={16} />
                      </Link>
                      <Link 
                        to={`/admin/campagne/${camp.id}`}
                        className="p-2 text-blue-400 hover:text-blue-300 bg-valthera-800 rounded-md"
                        title="Éditer Campagne"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <Link 
                        to={`/admin/campagne/${camp.id}/chapitre/nouveau`}
                        className="p-2 text-forest-500 hover:text-forest-400 bg-valthera-800 rounded-md"
                        title="Ajouter Chapitre"
                      >
                        <Plus size={16} />
                      </Link>
                      <button 
                        onClick={() => { if(window.confirm('Supprimer cette campagne ?')) onDelete(camp.id); }}
                        className="p-2 text-blood-400 hover:text-blood-500 bg-valthera-800 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row for Chapters */}
                  {expandedCampaignId === camp.id && (
                    <tr className="bg-valthera-900/80">
                      <td colSpan={6} className="px-6 py-4 shadow-inner">
                        <div className="pl-6 border-l-2 border-valthera-400/30">
                          <h4 className="text-sm font-bold text-valthera-200/60 mb-3 flex items-center gap-2">
                             <ScrollText size={16} /> Gestion des Chapitres
                          </h4>
                          {camp.chapters.length === 0 ? (
                            <p className="text-valthera-200/50 text-sm italic">Aucun chapitre.</p>
                          ) : (
                            <div className="space-y-2">
                              {camp.chapters.sort((a,b) => a.order - b.order).map((chap) => (
                                <div key={chap.id} className="flex items-center justify-between bg-valthera-800 p-3 rounded border border-valthera-700">
                                   <div className="flex items-center gap-3">
                                      <span className="bg-valthera-700 text-valthera-200 text-xs px-2 py-1 rounded font-mono">#{chap.order}</span>
                                      <span className="text-valthera-100 font-medium">{chap.title}</span>
                                      <span className="text-valthera-200/50 text-xs">({chap.sessionDate})</span>
                                   </div>
                                   <div className="flex gap-2">
                                      <Link 
                                        to={`/admin/campagne/${camp.id}/chapitre/${chap.id}`}
                                        className="text-blue-400 hover:text-blue-300 p-1"
                                        title="Modifier le chapitre"
                                      >
                                        <Edit3 size={14} />
                                      </Link>
                                      <button 
                                        onClick={() => { if(window.confirm('Supprimer ce chapitre ?')) onDeleteChapter(camp.id, chap.id); }}
                                        className="text-blood-400 hover:text-blood-500 p-1"
                                        title="Supprimer le chapitre"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                   </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-valthera-200/50">
                    Aucune campagne. Commencez par en créer une !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;