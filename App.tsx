import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { ViewState, Campaign } from './types';
import { getCampaigns, getCampaignById, saveCampaign, deleteCampaign, deleteChapter } from './services/storageService';

// Pages
import Home from './pages/Home';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCampaignForm from './pages/AdminCampaignForm';
import AdminChapterForm from './pages/AdminChapterForm';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>({ type: 'HOME' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Refresh data helper
  const refreshData = () => {
    setCampaigns(getCampaigns());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Simple Router Switch
  const renderView = () => {
    switch (currentView.type) {
      case 'HOME':
        return <Home setView={setView} campaigns={campaigns} />;
      
      case 'UNIVERSE':
        return (
          <CampaignList 
            universe={currentView.universe} 
            campaigns={campaigns.filter(c => c.universe === currentView.universe)}
            setView={setView}
          />
        );
      
      case 'CAMPAIGN':
        const camp = getCampaignById(currentView.campaignId);
        if (!camp) return <div className="p-10 text-center">Campagne introuvable</div>;
        return <CampaignDetail campaign={camp} setView={setView} />;
      
      case 'ADMIN_LOGIN':
        return <AdminLogin onLogin={() => { setIsAdmin(true); setView({ type: 'ADMIN_DASHBOARD' }); }} />;
      
      case 'ADMIN_DASHBOARD':
        if (!isAdmin) return <Home setView={setView} campaigns={campaigns} />;
        return (
          <AdminDashboard 
            campaigns={campaigns} 
            setView={setView} 
            onDelete={(id) => { deleteCampaign(id); refreshData(); }} 
            onDeleteChapter={(campId, chapId) => { deleteChapter(campId, chapId); refreshData(); }}
          />
        );
      
      case 'ADMIN_EDIT_CAMPAIGN':
        if (!isAdmin) return <Home setView={setView} campaigns={campaigns} />;
        const editCamp = currentView.campaignId ? getCampaignById(currentView.campaignId) : undefined;
        return (
          <AdminCampaignForm 
            initialData={editCamp} 
            onSave={(c) => { saveCampaign(c); refreshData(); setView({ type: 'ADMIN_DASHBOARD' }); }} 
            onCancel={() => setView({ type: 'ADMIN_DASHBOARD' })}
          />
        );

      case 'ADMIN_EDIT_CHAPTER':
         if (!isAdmin) return <Home setView={setView} campaigns={campaigns} />;
         const parentCamp = getCampaignById(currentView.campaignId);
         if (!parentCamp) return <div>Erreur parent</div>;
         const editChap = currentView.chapterId ? parentCamp.chapters.find(c => c.id === currentView.chapterId) : undefined;
         return (
            <AdminChapterForm
              campaign={parentCamp}
              initialData={editChap}
              onSave={(updatedCampaign) => { saveCampaign(updatedCampaign); refreshData(); setView({ type: 'CAMPAIGN', campaignId: updatedCampaign.id }); }}
              onCancel={() => setView({ type: 'CAMPAIGN', campaignId: parentCamp.id })}
            />
         );

      default:
        return <Home setView={setView} campaigns={campaigns} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setView} 
      isAdmin={isAdmin}
      onLogout={() => { setIsAdmin(false); setView({ type: 'HOME' }); }}
    >
      {renderView()}
    </Layout>
  );
};

export default App;