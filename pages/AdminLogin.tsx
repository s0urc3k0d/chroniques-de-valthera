import React, { useState } from 'react';
import { Lock } from '../components/Icons';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth - in real app use backend
    if (password === 'admin123' || password === 'dnd') { 
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-slate-800 rounded-full">
            <Lock size={32} className="text-valthera-500" />
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-center text-white mb-6">Accès Maître du Jeu</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Mot de passe secret"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-valthera-500 focus:ring-1 focus:ring-valthera-500 transition-all"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">Mot de passe incorrect. Faites un jet d'Intelligence.</p>}
          
          <button
            type="submit"
            className="w-full bg-valthera-600 hover:bg-valthera-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-valthera-900/50"
          >
            Entrer
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;