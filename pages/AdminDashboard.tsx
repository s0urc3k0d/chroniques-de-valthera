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
        <h1 className="text-3xl font-display font-bold text-white">Tableau de Bord MJ</h1>
        <Link
          to="/admin/campagne/nouvelle"
          className="bg-valthera-600 hover:bg-valthera-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Nouvelle Campagne
        </Link>
      </div>

      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-sm uppercase">
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Univers</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Chapitres</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {campaigns.map((camp) => (
                <React.Fragment key={camp.id}>
                  <tr className={`hover:bg-slate-800/50 transition-colors ${expandedCampaignId === camp.id ? 'bg-slate-800/30' : ''}`}>
                    <td className="px-6 py-4 text-slate-500 cursor-pointer" onClick={() => toggleExpand(camp.id)}>
                       {expandedCampaignId === camp.id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">{camp.title}</td>
                    <td className="px-6 py-4 text-slate-400 capitalize">{camp.universe}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        camp.status === 'active' ? 'bg-green-500/10 text-green-400' :
                        camp.status === 'completed' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{camp.chapters.length}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <Link 
                        to={`/campagne/${camp.id}`}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-md"
                        title="Voir"
                      >
                        <BookOpen size={16} />
                      </Link>
                      <Link 
                        to={`/admin/campagne/${camp.id}`}
                        className="p-2 text-blue-400 hover:text-blue-300 bg-slate-800 rounded-md"
                        title="Éditer Campagne"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <Link 
                        to={`/admin/campagne/${camp.id}/chapitre/nouveau`}
                        className="p-2 text-green-400 hover:text-green-300 bg-slate-800 rounded-md"
                        title="Ajouter Chapitre"
                      >
                        <Plus size={16} />
                      </Link>
                      <button 
                        onClick={() => { if(window.confirm('Supprimer cette campagne ?')) onDelete(camp.id); }}
                        className="p-2 text-red-400 hover:text-red-300 bg-slate-800 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {/* Expanded Row for Chapters */}
                  {expandedCampaignId === camp.id && (
                    <tr className="bg-slate-900/80">
                      <td colSpan={6} className="px-6 py-4 shadow-inner">
                        <div className="pl-6 border-l-2 border-valthera-500/30">
                          <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                             <ScrollText size={16} /> Gestion des Chapitres
                          </h4>
                          {camp.chapters.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">Aucun chapitre.</p>
                          ) : (
                            <div className="space-y-2">
                              {camp.chapters.sort((a,b) => a.order - b.order).map((chap) => (
                                <div key={chap.id} className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700">
                                   <div className="flex items-center gap-3">
                                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded font-mono">#{chap.order}</span>
                                      <span className="text-slate-200 font-medium">{chap.title}</span>
                                      <span className="text-slate-500 text-xs">({chap.sessionDate})</span>
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
                                        className="text-red-400 hover:text-red-300 p-1"
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
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
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