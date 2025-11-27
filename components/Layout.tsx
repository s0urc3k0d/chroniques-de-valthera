import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Map, Globe, Sword, Lock, LogOut, Book } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  isAdmin: boolean;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAdmin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithRedirect, isAuthenticated, user } = useAuth0();

  const NavLink = ({ label, to, icon: Icon }: { label: string; to: string; icon: any }) => {
    const isActive = location.pathname === to || 
      (to !== '/' && location.pathname.startsWith(to));
    
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
          isActive
            ? 'bg-valthera-500 text-white shadow-lg shadow-valthera-500/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </Link>
    );
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-void-950 text-slate-200 font-sans selection:bg-valthera-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center cursor-pointer">
              <div className="bg-gradient-to-br from-valthera-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-valthera-500/20">
                 <Sword className="text-white" size={24} />
              </div>
              <span className="ml-3 text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Chroniques
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              <NavLink label="Accueil" to="/" icon={Map} />
              <NavLink label="Valthera" to="/univers/valthera" icon={Globe} />
              <NavLink label="Hors-Série" to="/univers/hors-serie" icon={LogOut} />
              <NavLink label="Lore" to="/lore" icon={Book} />
              
              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              {isAdmin ? (
                <>
                  <Link 
                    to="/admin"
                    className="text-valthera-400 hover:text-valthera-300 font-medium"
                  >
                    Dashboard
                  </Link>
                  {user?.picture && (
                    <img 
                      src={user.picture} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border-2 border-valthera-500"
                    />
                  )}
                  <button onClick={handleLogout} className="text-slate-400 hover:text-white" title="Déconnexion">
                    <LogOut size={20} />
                  </button>
                </>
              ) : isAuthenticated ? (
                <span className="text-slate-500 text-sm">Non admin</span>
              ) : (
                <button 
                  onClick={() => loginWithRedirect()}
                  className="text-slate-500 hover:text-white transition-colors"
                  title="Connexion Admin"
                >
                  <Lock size={18} />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300 hover:text-white p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
              <NavLink label="Accueil" to="/" icon={Map} />
              <NavLink label="Valthera" to="/univers/valthera" icon={Globe} />
              <NavLink label="Hors-Série" to="/univers/hors-serie" icon={LogOut} />
              <NavLink label="Lore" to="/lore" icon={Book} />
              {isAdmin ? (
                 <Link 
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-left w-full px-4 py-2 text-valthera-400"
                  >
                    Dashboard Admin
                  </Link>
              ) : isAuthenticated ? (
                <span className="px-4 py-2 text-slate-500">Non admin</span>
              ) : (
                <button 
                  onClick={() => { setMobileMenuOpen(false); loginWithRedirect(); }}
                  className="text-left w-full px-4 py-2 text-slate-500"
                >
                  Connexion Admin
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      <footer className="bg-void-950 border-t border-slate-900 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Chroniques de Valthera. Fait avec passion pour le JDR.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/lore" className="text-slate-500 hover:text-valthera-400 transition-colors">
                📚 Encyclopédie
              </Link>
              <Link to="/rss" className="text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
                </svg>
                RSS
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;