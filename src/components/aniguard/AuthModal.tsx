import React from 'react';
import { LogOut, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AniGuardAuthCard } from './AniGuardAuthCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (email: string, role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { user, role, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      onLoginSuccess?.('', 'user');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      {user ? (
        <div className="bg-gradient-to-b from-[#051c17] to-[#03110d] border border-[#10b981]/30 rounded-[28px] w-full max-w-md text-white shadow-[0_0_50px_rgba(16,185,129,0.2)] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition p-1 rounded-full bg-[#092b23]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pb-4 border-b border-emerald-800/40">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Active Session
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {role || 'User'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Synchronized with Supabase Auth</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#082b23] border border-emerald-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Logged in as:</span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <p className="text-sm font-semibold text-white break-all">{user.email}</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex-1 py-3 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#00c875] to-[#059669] hover:from-[#00e686] hover:to-[#047857] text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <AniGuardAuthCard
          isModal={true}
          onClose={onClose}
          onSuccess={(email, role) => {
            if (onLoginSuccess) onLoginSuccess(email, role);
          }}
        />
      )}
    </div>
  );
};
