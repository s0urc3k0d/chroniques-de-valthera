import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import Layout from './components/Layout';
import { Campaign } from './types';
import { getCampaigns, getCampaignById, saveCampaign, deleteCampaign, deleteChapter } from './services/supabaseService';
import { auth0Config, ADMIN_EMAILS } from './services/auth0Config';

// Pages
import Home from './pages/Home';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminCampaignForm from './pages/AdminCampaignForm';
import AdminChapterForm from './pages/AdminChapterForm';
import LorePage from './pages/LorePage';
import RSSFeedPage from './pages/RSSFeedPage';
import CalendarPage from './pages/CalendarPage';

// Context pour partager l'état global
interface AppContextType {
  campaigns: Campaign[];
  refreshData: () => Promise<void>;
  isAdmin: boolean;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

// Hook pour vérifier si l'utilisateur est admin
const useIsAdmin = () => {
  const { user, isAuthenticated } = useAuth0();
  
  // Si ADMIN_EMAILS est vide, tout utilisateur authentifié est admin
  // Sinon, vérifier si l'email est dans la liste
  if (!isAuthenticated || !user) return false;
  if (ADMIN_EMAILS.length === 0) return true;
  return ADMIN_EMAILS.includes(user.email || '');
};

// Wrapper pour les routes admin protégées
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const isAdmin = useIsAdmin();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Accès refusé</h1>
          <p className="text-slate-400 mb-6">Vous n'avez pas les droits d'administration.</p>
          <a href="/" className="text-valthera-400 hover:text-valthera-300">← Retour à l'accueil</a>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Page wrapper pour CampaignList avec params
const CampaignListPage: React.FC = () => {
  const { universe } = useParams<{ universe: 'valthera' | 'hors-serie' }>();
  const { campaigns } = useAppContext();
  
  if (!universe || (universe !== 'valthera' && universe !== 'hors-serie')) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <CampaignList 
      universe={universe} 
      campaigns={campaigns.filter(c => c.universe === universe)}
    />
  );
};

// Page wrapper pour CampaignDetail avec params
const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCampaign = async () => {
      if (id) {
        const data = await getCampaignById(id);
        setCampaign(data);
      }
      setLoading(false);
    };
    loadCampaign();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-white mb-4">Campagne introuvable</h1>
          <p className="text-slate-400 mb-6">Cette campagne n'existe pas ou a été supprimée.</p>
          <a href="/" className="text-valthera-400 hover:text-valthera-300">← Retour à l'accueil</a>
        </div>
      </div>
    );
  }
  
  return <CampaignDetail campaign={campaign} />;
};

// Page wrapper pour AdminDashboard
const AdminDashboardPage: React.FC = () => {
  const { campaigns, refreshData } = useAppContext();
  const navigate = useNavigate();
  
  return (
    <AdminDashboard 
      campaigns={campaigns} 
      onDelete={async (id) => { await deleteCampaign(id); await refreshData(); }} 
      onDeleteChapter={async (campId, chapId) => { await deleteChapter(campId, chapId); await refreshData(); }}
      navigate={navigate}
    />
  );
};

// Page wrapper pour AdminCampaignForm
const AdminCampaignFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { refreshData } = useAppContext();
  const navigate = useNavigate();
  const [editCamp, setEditCamp] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(!!id);
  
  useEffect(() => {
    const loadCampaign = async () => {
      if (id) {
        const data = await getCampaignById(id);
        setEditCamp(data);
      }
      setLoading(false);
    };
    loadCampaign();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <AdminCampaignForm 
      initialData={editCamp || undefined} 
      onSave={async (c) => { 
        await saveCampaign(c); 
        await refreshData(); 
        navigate('/admin'); 
      }} 
      onCancel={() => navigate('/admin')}
    />
  );
};

// Page wrapper pour AdminChapterForm
const AdminChapterFormPage: React.FC = () => {
  const { campaignId, chapterId } = useParams<{ campaignId: string; chapterId?: string }>();
  const { refreshData } = useAppContext();
  const navigate = useNavigate();
  const [parentCamp, setParentCamp] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadCampaign = async () => {
      if (campaignId) {
        const data = await getCampaignById(campaignId);
        setParentCamp(data);
      }
      setLoading(false);
    };
    loadCampaign();
  }, [campaignId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!parentCamp) {
    return <Navigate to="/admin" replace />;
  }
  
  const editChap = chapterId ? parentCamp.chapters.find(c => c.id === chapterId) : undefined;
  
  return (
    <AdminChapterForm
      campaign={parentCamp}
      initialData={editChap}
      onSave={async (updatedCampaign) => { 
        await saveCampaign(updatedCampaign); 
        await refreshData(); 
        navigate(`/campagne/${updatedCampaign.id}`); 
      }}
      onCancel={() => navigate(`/campagne/${parentCamp.id}`)}
    />
  );
};

// Composant HomePage wrapper
const HomePage: React.FC = () => {
  const { campaigns, isLoading } = useAppContext();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-valthera-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return <Home campaigns={campaigns} />;
};

// Composant principal avec le router
const AppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth0();
  const isAdmin = useIsAdmin();
  
  return (
    <Layout 
      isAdmin={isAdmin && isAuthenticated}
      onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/univers/:universe" element={<CampaignListPage />} />
        <Route path="/campagne/:id" element={<CampaignDetailPage />} />
        <Route path="/lore" element={<LorePage />} />
        <Route path="/lore/:tab" element={<LorePage />} />
        <Route path="/calendrier" element={<CalendarPage />} />
        <Route path="/rss" element={<RSSFeedPage />} />
        
        {/* Routes Admin - Auth0 gère l'authentification */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/campagne/nouvelle" element={
          <ProtectedRoute><AdminCampaignFormPage /></ProtectedRoute>
        } />
        <Route path="/admin/campagne/:id" element={
          <ProtectedRoute><AdminCampaignFormPage /></ProtectedRoute>
        } />
        <Route path="/admin/campagne/:campaignId/chapitre/nouveau" element={
          <ProtectedRoute><AdminChapterFormPage /></ProtectedRoute>
        } />
        <Route path="/admin/campagne/:campaignId/chapitre/:chapterId" element={
          <ProtectedRoute><AdminChapterFormPage /></ProtectedRoute>
        } />
        
        {/* Redirect ancien login vers admin */}
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Provider interne avec accès à Auth0
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth0();
  const isAdmin = useIsAdmin();

  const refreshData = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AppContext.Provider value={{ campaigns, refreshData, isAdmin: isAdmin && isAuthenticated, isLoading }}>
      {children}
    </AppContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={auth0Config.authorizationParams}
      >
        <AppProvider>
          <AppContent />
        </AppProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
};

export default App;