import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth, PROTECTED_SUPER_ADMIN_EMAILS } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (email: string, role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const { user, role, signIn, signUp, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('abdul.salam.bt.2024@miet.ac.in');
  const [password, setPassword] = useState('AniGuard@2026!');
  const [fullName, setFullName] = useState('Abdul Salam');
  const [confirmPassword, setConfirmPassword] = useState('AniGuard@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        setAuthError(error.message || 'Authentication failed. Please verify credentials.');
      } else {
        const userEmail = data?.user?.email || email;
        const currentRole = PROTECTED_SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())
          ? 'super_admin'
          : role || 'user';
        onLoginSuccess?.(userEmail, currentRole);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected authentication error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await signUp(email.trim(), password, fullName.trim());
      if (error) {
        setAuthError(error.message || 'Registration failed. Please check details.');
      } else {
        const userEmail = data?.user?.email || email;
        const currentRole = PROTECTED_SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())
          ? 'super_admin'
          : 'user';
        onLoginSuccess?.(userEmail, currentRole);
        onClose();
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An unexpected registration error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      onLoginSuccess?.('', 'user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setPresetUser = (targetEmail: string, targetName: string) => {
    setEmail(targetEmail);
    setFullName(targetName);
    setPassword('AniGuard@2026!');
    setConfirmPassword('AniGuard@2026!');
    setAuthError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B1520] border border-[#1A2634] rounded-2xl w-full max-w-md text-white shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pb-4 border-b border-[#182635]">
          <div className="w-10 h-10 rounded-xl bg-[#0E2E25] text-[#10B981] flex items-center justify-center border border-[#134E3E]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AniGuard Live Auth
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                Supabase
              </span>
            </h2>
            <p className="text-xs text-slate-400">Production authentication & role synchronization</p>
          </div>
        </div>

        {/* If user is already authenticated */}
        {user ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#0E1A26] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Session:</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    role === 'super_admin'
                      ? 'bg-[#291F0E] text-[#D4AF37] border border-[#D4AF37]/40'
                      : role === 'admin'
                      ? 'bg-blue-950 text-blue-400 border border-blue-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {role || 'user'}
                </span>
              </div>
              <p className="text-sm font-semibold text-white break-all">{user.email}</p>
              <p className="text-[11px] text-slate-500 font-mono">UID: {user.id}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition"
              >
                Continue to App
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switch: Sign In vs Sign Up */}
            <div className="flex p-1 rounded-lg bg-[#08101A] border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signin' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'signup' ? 'bg-[#059669] text-white shadow-sm' : 'text-slate-400'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Notification Alert */}
            {authError && (
              <div className="mt-3 p-3 rounded-lg bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-300">Authentication Error</p>
                  <p className="text-[11px] mt-0.5 text-red-200">{authError}</p>
                  {authError.toLowerCase().includes('invalid login credentials') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError(null);
                      }}
                      className="mt-1.5 text-[11px] text-emerald-400 underline font-semibold hover:text-emerald-300 block"
                    >
                      New user? Click here to register this account ➔
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="mt-4 space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="farmer@dairy.in"
                    className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full bg-[#0E1A26] border border-slate-700 rounded-lg px-3 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              )}

              {/* Protected Super Admin & Role Quick Selector */}
              <div className="p-3 bg-[#08101A] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Quick Preset Accounts:
                  </span>
                  <span className="text-[10px] text-slate-500">1-click autofill</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPresetUser('abdul.salam.bt.2024@miet.ac.in', 'Abdul Salam')}
                    className="p-1.5 rounded-lg bg-[#14120A] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-left transition"
                  >
                    <p className="text-[10px] font-bold text-[#D4AF37]">Abdul Salam</p>
                    <p className="text-[9px] text-slate-400 truncate">Super Admin</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetUser('hayatamr9608@gmail.com', 'Hayat Amr')}
                    className="p-1.5 rounded-lg bg-[#14120A] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-left transition"
                  >
                    <p className="text-[10px] font-bold text-[#D4AF37]">Hayat Amr</p>
                    <p className="text-[9px] text-slate-400 truncate">Super Admin</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetUser('ashi.gautam.bt.2024@miet.ac.in', 'Ashi Gautam')}
                    className="p-1.5 rounded-lg bg-[#14120A] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-left transition"
                  >
                    <p className="text-[10px] font-bold text-[#D4AF37]">Ashi Gautam</p>
                    <p className="text-[9px] text-slate-400 truncate">Super Admin</p>
                  </button>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setPresetUser('dr.arvind.patel@aniguard.in', 'Dr. Arvind Patel')}
                    className="flex-1 p-1.5 rounded-lg bg-[#0E1A26] border border-blue-900/60 hover:border-blue-500 text-left transition"
                  >
                    <p className="text-[10px] font-bold text-blue-400">Dr. Arvind Patel</p>
                    <p className="text-[9px] text-slate-400">Veterinary Admin</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetUser('ramesh.kumar@dairy.in', 'Ramesh Kumar')}
                    className="flex-1 p-1.5 rounded-lg bg-[#0E1A26] border border-emerald-900/60 hover:border-emerald-500 text-left transition"
                  >
                    <p className="text-[10px] font-bold text-emerald-400">Ramesh Kumar</p>
                    <p className="text-[9px] text-slate-400">Dairy Farmer</p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Communicating with Supabase...</span>
                  </>
                ) : (
                  <span>
                    {authMode === 'signin' ? 'Sign In to AniGuard' : 'Register Account on Supabase'}
                  </span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
