import React, { useState } from 'react';
import { ViewState } from '../types';
import { Map, Globe, Sword, Lock, LogOut } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isAdmin: boolean;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, isAdmin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ label, view, icon: Icon }: { label: string; view: ViewState; icon: any }) => (
    <button
      onClick={() => {
        setView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        JSON.stringify(currentView) === JSON.stringify(view)
          ? 'bg-valthera-500 text-white shadow-lg shadow-valthera-500/30'
          : 'text-slate-300 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-void-950 text-slate-200 font-sans selection:bg-valthera-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView({ type: 'HOME' })}>
              <div className="bg-gradient-to-br from-valthera-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-valthera-500/20">
                 <Sword className="text-white" size={24} />
              </div>
              <span className="ml-3 text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Chroniques
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <NavItem label="Accueil" view={{ type: 'HOME' }} icon={Map} />
              <NavItem label="Valthera" view={{ type: 'UNIVERSE', universe: 'valthera' }} icon={Globe} />
              <NavItem label="Hors-Univers" view={{ type: 'UNIVERSE', universe: 'hors-univers' }} icon={LogOut} />
              
              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              {isAdmin ? (
                <>
                  <button 
                    onClick={() => setView({ type: 'ADMIN_DASHBOARD' })}
                    className="text-valthera-400 hover:text-valthera-300 font-medium"
                  >
                    Dashboard
                  </button>
                  <button onClick={onLogout} className="text-slate-400 hover:text-white">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setView({ type: 'ADMIN_LOGIN' })}
                  className="text-slate-500 hover:text-white transition-colors"
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
              <NavItem label="Accueil" view={{ type: 'HOME' }} icon={Map} />
              <NavItem label="Valthera" view={{ type: 'UNIVERSE', universe: 'valthera' }} icon={Globe} />
              <NavItem label="Hors-Univers" view={{ type: 'UNIVERSE', universe: 'hors-univers' }} icon={LogOut} />
              {isAdmin ? (
                 <button 
                    onClick={() => { setView({ type: 'ADMIN_DASHBOARD' }); setMobileMenuOpen(false); }}
                    className="text-left w-full px-4 py-2 text-valthera-400"
                  >
                    Dashboard Admin
                  </button>
              ) : (
                <button 
                  onClick={() => { setView({ type: 'ADMIN_LOGIN' }); setMobileMenuOpen(false); }}
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
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Chroniques de Valthera. Fait avec passion pour le JDR.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;