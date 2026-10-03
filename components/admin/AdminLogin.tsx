
import React, { useState } from 'react';
import { AdminUser } from '../../types';

interface AdminLoginProps {
  onLogin: (user: AdminUser) => void;
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState('');

  const handleAuthorizedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Authorized credentials check (Demo purpose)
    if (username === 'admin' && password === 'krishiseva2024') {
      onLogin({ id: '1', username: 'SuperAdmin', isDemo: false });
    } else {
      setError('Invalid administrative credentials. Access denied.');
    }
  };

  const handleDemoLogin = () => {
    onLogin({ id: 'demo_1', username: 'Guest Inspector', isDemo: true });
  };

  return (
    <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center hover:text-white transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="relative z-10 space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl rotate-3">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Management Gateway</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Administrative Console v3.1</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}

          {isRequesting ? (
            <div className="space-y-6 text-center py-4">
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Registration is restricted to authorized administrative personnel only. 
                Please contact the Central IT Department to request credentials.
              </p>
              <button 
                onClick={() => setIsRequesting(false)}
                className="w-full bg-slate-800 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <button 
                onClick={handleDemoLogin}
                className="w-full bg-emerald-500 text-slate-950 p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Instant Demo Access
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-800"></div>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Authorized Only</span>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>

              <form onSubmit={handleAuthorizedLogin} className="space-y-4">
                <div className="space-y-2">
                  <input 
                    type="text" placeholder="Admin ID" 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={username} onChange={e => setUsername(e.target.value)}
                  />
                  <input 
                    type="password" placeholder="Key Phrase" 
                    className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                >
                  Verify & Enter
                </button>
              </form>
              
              <div className="text-center">
                <button 
                  onClick={() => setIsRequesting(true)}
                  className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
                >
                  Request Credentials
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
