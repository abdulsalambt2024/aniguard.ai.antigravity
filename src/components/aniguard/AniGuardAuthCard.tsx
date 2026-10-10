import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Sparkles, X, Leaf } from 'lucide-react';
import { useAuth, PROTECTED_SUPER_ADMIN_EMAILS } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AniGuardAuthCardProps {
  initialMode?: 'signin' | 'signup' | 'reset';
  onSuccess?: (email: string, role: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Custom Circular AniGuard Logo SVG matching attachment
export const AniGuardLogoSvg: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Glow & Double Ring */}
    <circle cx="60" cy="60" r="58" stroke="#10B981" strokeWidth="1.2" strokeOpacity="0.5" />
    <circle cx="60" cy="60" r="54" fill="#041612" stroke="#00E699" strokeWidth="1.5" />
    <circle cx="60" cy="60" r="50" stroke="#059669" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.6" />

    {/* Top Brand Text: ANI */}
    <path id="aniTextPath" d="M 32 50 A 30 30 0 0 1 88 50" fill="none" />
    <text textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" letterSpacing="4.5">
      <textPath href="#aniTextPath" startOffset="50%">ANI</textPath>
    </text>

    {/* Cow & Leaf Graphic */}
    <g transform="translate(31, 38) scale(0.58)">
      {/* Cow Body */}
      <path
        d="M22 45 C20 40, 20 30, 28 25 C34 22, 45 22, 58 24 C68 25, 75 22, 80 18 C83 16, 86 18, 85 22 C84 26, 88 28, 92 28 C95 28, 97 30, 96 34 C95 38, 90 40, 88 44 C86 48, 85 54, 85 62 L81 67 L77 60 L72 60 L66 67 L62 58 L48 58 L42 67 L38 60 L32 60 L26 67 Z"
        fill="#FFFFFF"
      />
      {/* Head */}
      <path d="M80 18 C84 12, 90 10, 95 14 C98 17, 96 22, 92 24 Z" fill="#FFFFFF" />
      {/* Green Leaf accent on cow back */}
      <path
        d="M50 17 C50 8, 62 6, 67 13 C62 20, 52 21, 50 17 Z"
        fill="#10B981"
      />
    </g>

    {/* Bottom Brand Text: GUARD */}
    <path id="guardTextPath" d="M 28 72 A 34 34 0 0 0 92 72" fill="none" />
    <text textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" letterSpacing="3.5">
      <textPath href="#guardTextPath" startOffset="50%">GUARD</textPath>
    </text>
  </svg>
);

// Night Farm Landscape SVG Silhouette matching attachment bottom
export const FarmLandscapeSvg: React.FC = () => (
  <svg viewBox="0 0 450 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto block select-none pointer-events-none">
    <defs>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
        <stop offset="60%" stopColor="#059669" stopOpacity="0.12" />
        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="backHills" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#082921" />
        <stop offset="100%" stopColor="#041511" />
      </linearGradient>
      <linearGradient id="frontHills" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0a3328" />
        <stop offset="100%" stopColor="#03110e" />
      </linearGradient>
    </defs>

    {/* Moon & Aura */}
    <circle cx="280" cy="48" r="40" fill="url(#moonGlow)" />
    <circle cx="280" cy="48" r="12" fill="#A7F3D0" fillOpacity="0.3" />

    {/* Back Hills */}
    <path d="M0 75 Q 110 50, 230 70 T 450 62 L 450 110 L 0 110 Z" fill="url(#backHills)" opacity="0.95" />

    {/* Barn and Silo Silhouette */}
    <g fill="#020d0a">
      <rect x="365" y="38" width="14" height="35" rx="7" />
      <path d="M365 42 L372 30 L379 42 Z" />
      <path d="M305 70 L305 48 L332 35 L358 48 L358 70 Z" />
      <path d="M322 70 L322 56 L340 56 L340 70 Z" fill="#082921" />
      {/* Trees */}
      <path d="M385 70 L394 45 L403 70 Z" />
      <path d="M398 70 L406 50 L414 70 Z" />
      <path d="M410 70 L418 55 L426 70 Z" />
      <path d="M20 75 L30 52 L40 75 Z" />
      <path d="M38 75 L46 58 L54 75 Z" />
    </g>

    {/* Front Grass Hill */}
    <path d="M0 80 Q 150 64, 290 82 T 450 74 L 450 110 L 0 110 Z" fill="url(#frontHills)" />

    {/* Cows & Calf Silhouettes */}
    <g fill="#010806">
      {/* Cow 1 Grazing Left */}
      <path transform="translate(68, 62) scale(0.36)" d="M22 45 C20 40, 20 30, 28 25 C34 22, 45 22, 58 24 C68 25, 75 22, 80 18 C83 16, 86 18, 85 22 C84 26, 88 28, 92 28 C95 28, 97 30, 96 34 C95 38, 90 40, 88 44 C86 48, 85 54, 85 62 L81 67 L77 60 L72 60 L66 67 L62 58 L48 58 L42 67 L38 60 L32 60 L26 67 Z" />
      {/* Calf Center */}
      <path transform="translate(135, 71) scale(0.24)" d="M22 45 C20 40, 20 30, 28 25 C34 22, 45 22, 58 24 C68 25, 75 22, 80 18 C83 16, 86 18, 85 22 C84 26, 88 28, 92 28 C95 28, 97 30, 96 34 C95 38, 90 40, 88 44 C86 48, 85 54, 85 62 L81 67 L77 60 L72 60 L66 67 L62 58 L48 58 L42 67 L38 60 L32 60 L26 67 Z" />
      {/* Cow 2 Standing */}
      <path transform="translate(195, 66) scale(0.32)" d="M22 45 C20 40, 20 30, 28 25 C34 22, 45 22, 58 24 C68 25, 75 22, 80 18 C83 16, 86 18, 85 22 C84 26, 88 28, 92 28 C95 28, 97 30, 96 34 C95 38, 90 40, 88 44 C86 48, 85 54, 85 62 L81 67 L77 60 L72 60 L66 67 L62 58 L48 58 L42 67 L38 60 L32 60 L26 67 Z" />
    </g>
  </svg>
);

// Leaf Corner Graphic Overlays
export const LeafCornerOverlay: React.FC = () => (
  <>
    <svg className="absolute top-2 left-2 w-20 h-20 text-emerald-600/30 pointer-events-none z-10" viewBox="0 0 100 100" fill="currentColor">
      <path d="M0 0 C30 10 50 30 50 60 C30 50 10 30 0 0 Z" opacity="0.8" />
      <path d="M0 15 C20 20 35 35 40 65 C25 55 10 40 0 15 Z" opacity="0.5" />
      <path d="M15 0 C20 15 35 30 65 35 C55 20 40 10 15 0 Z" opacity="0.5" />
    </svg>
    <svg className="absolute top-2 right-2 w-20 h-20 text-emerald-600/30 transform scale-x-[-1] pointer-events-none z-10" viewBox="0 0 100 100" fill="currentColor">
      <path d="M0 0 C30 10 50 30 50 60 C30 50 10 30 0 0 Z" opacity="0.8" />
      <path d="M0 15 C20 20 35 35 40 65 C25 55 10 40 0 15 Z" opacity="0.5" />
      <path d="M15 0 C20 15 35 30 65 35 C55 20 40 10 15 0 Z" opacity="0.5" />
    </svg>
  </>
);

export const AniGuardAuthCard: React.FC<AniGuardAuthCardProps> = ({
  initialMode = 'signin',
  onSuccess,
  onClose,
  isModal = false,
}) => {
  const { signIn, signUp, resetPassword, user, role } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'reset') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setIsSubmitting(true);
      try {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setErrorMsg(error.message || 'Failed to send reset link.');
        } else {
          setSuccessMsg('Password reset link sent to your email.');
          toast.success('Reset link sent!');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { data, error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message || 'Failed to create account.');
        } else {
          const userEmail = data?.user?.email || email;
          const currentRole = PROTECTED_SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())
            ? 'super_admin'
            : 'user';
          toast.success('Account created successfully!');
          onSuccess?.(userEmail, currentRole);
          if (onClose) onClose();
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign In
    if (!email.trim() || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        const userEmail = data?.user?.email || email;
        const currentRole = PROTECTED_SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase())
          ? 'super_admin'
          : role || 'user';
        toast.success('Welcome back!');
        onSuccess?.(userEmail, currentRole);
        if (onClose) onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePresetSelect = (presetEmail: string, presetName: string) => {
    setEmail(presetEmail);
    setFullName(presetName);
    setPassword('AniGuard@2026!');
    setConfirmPassword('AniGuard@2026!');
    setErrorMsg(null);
    toast.info(`Autofilled credentials for ${presetName}`);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto relative rounded-[28px] overflow-hidden bg-gradient-to-b from-[#051c17] via-[#07241e] to-[#03110d] border border-[#10b981]/30 shadow-[0_0_50px_rgba(16,185,129,0.18)] p-6 sm:p-8 text-white transition-all">
      {/* Corner Leaves Graphics */}
      <LeafCornerOverlay />

      {/* Close button if in Modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-[#072821] border border-emerald-800/60 text-slate-300 hover:text-white flex items-center justify-center transition hover:scale-105"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mt-1 mb-5">
        <div className="relative mb-2 group cursor-pointer" onClick={() => setShowPresets(!showPresets)}>
          <AniGuardLogoSvg className="w-20 h-20 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 font-sans">
          AniGuard
        </h1>
        <p className="text-[11px] font-medium tracking-wide text-slate-300/80 mt-0.5">
          Healthier Livestock <span className="text-emerald-500 font-bold">|</span> Stronger Farms
        </p>

        {/* Preset autofill bar toggle */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[10px] font-medium text-emerald-400/80 hover:text-emerald-300 flex items-center gap-1 bg-[#092e26]/80 px-2.5 py-1 rounded-full border border-emerald-800/40 transition"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{showPresets ? 'Hide Demo Presets' : '⚡ Demo Autofill Logins'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Quick Presets Panel */}
      {showPresets && (
        <div className="mb-5 p-3 rounded-2xl bg-[#041914] border border-emerald-800/50 space-y-2 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Test Accounts:</p>
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <button
              type="button"
              onClick={() => handlePresetSelect('abdul.salam.bt.2024@miet.ac.in', 'Abdul Salam')}
              className="p-1.5 rounded-xl bg-[#092d24] border border-amber-500/40 hover:border-amber-400 text-[10px] transition"
            >
              <span className="font-bold text-amber-300 block truncate">Abdul Salam</span>
              <span className="text-[9px] text-slate-400">Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('hayatamr9608@gmail.com', 'Hayat Amr')}
              className="p-1.5 rounded-xl bg-[#092d24] border border-amber-500/40 hover:border-amber-400 text-[10px] transition"
            >
              <span className="font-bold text-amber-300 block truncate">Hayat Amr</span>
              <span className="text-[9px] text-slate-400">Super Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('dr.arvind.patel@aniguard.in', 'Dr. Arvind Patel')}
              className="p-1.5 rounded-xl bg-[#092d24] border border-cyan-500/40 hover:border-cyan-400 text-[10px] transition"
            >
              <span className="font-bold text-cyan-300 block truncate">Dr. Arvind Patel</span>
              <span className="text-[9px] text-slate-400">Veterinary</span>
            </button>
            <button
              type="button"
              onClick={() => handlePresetSelect('ramesh.kumar@dairy.in', 'Ramesh Kumar')}
              className="p-1.5 rounded-xl bg-[#092d24] border border-emerald-500/40 hover:border-emerald-400 text-[10px] transition"
            >
              <span className="font-bold text-emerald-300 block truncate">Ramesh Kumar</span>
              <span className="text-[9px] text-slate-400">Dairy Farmer</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Title & Description */}
      <div className="mb-5 text-left">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {mode === 'signin' && 'Sign In'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>
        <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
          {mode === 'signin' && 'Welcome back! Please sign in to continue.'}
          {mode === 'signup' && 'Join AniGuard and take a step towards healthier livestock and better farms.'}
          {mode === 'reset' && 'Enter your email address to receive a password reset link.'}
        </p>
      </div>

      {/* Error & Success Messages */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="flex-1 text-[11px] leading-snug">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-700/90 text-emerald-200 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="flex-1 text-[11px] leading-snug">{successMsg}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name field (Create Account only) */}
        {mode === 'signup' && (
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0a382d] border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Full Name"
              className="w-full h-11 bg-[#06241e]/90 border border-[#14493d] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-full pl-13 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
          </div>
        )}

        {/* Email Address */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0a382d] border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Mail className="w-3.5 h-3.5" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email Address"
            className="w-full h-11 bg-[#06241e]/90 border border-[#14493d] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-full pl-13 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Password (Sign In & Create Account) */}
        {mode !== 'reset' && (
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0a382d] border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full h-11 bg-[#06241e]/90 border border-[#14493d] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-full pl-13 pr-11 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Confirm Password (Create Account only) */}
        {mode === 'signup' && (
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#0a382d] border border-emerald-700/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm Password"
              className="w-full h-11 bg-[#06241e]/90 border border-[#14493d] focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-full pl-13 pr-11 text-xs text-white placeholder-slate-400 focus:outline-none transition shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Forgot password link for Sign In */}
        {mode === 'signin' && (
          <div className="text-right pt-0.5">
            <button
              type="button"
              onClick={() => {
                setMode('reset');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-2 rounded-full bg-gradient-to-r from-[#00c875] via-[#10b981] to-[#059669] hover:from-[#00e686] hover:to-[#047857] active:scale-[0.99] text-white font-bold text-sm tracking-wide transition shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <span>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-[#124237] w-full" />
        <span className="bg-[#07251f] px-3 text-[11px] text-slate-400 font-medium relative -top-0.5">or</span>
      </div>

      {/* Switch Mode Links */}
      <div className="text-center text-xs text-slate-300 font-medium">
        {mode === 'signin' && (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition hover:underline ml-1"
            >
              Create account
            </button>
          </p>
        )}

        {mode === 'signup' && (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition hover:underline ml-1"
            >
              Sign in
            </button>
          </p>
        )}

        {mode === 'reset' && (
          <p>
            Remembered your password?{' '}
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition hover:underline ml-1"
            >
              Sign in
            </button>
          </p>
        )}
      </div>

      {/* Bottom Farm Vector Graphic */}
      <div className="mt-5 -mx-6 -mb-6 relative overflow-hidden rounded-b-[28px]">
        <FarmLandscapeSvg />
        {/* Footer Tagline inside graphic */}
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 text-[10px] text-slate-300/80 font-medium tracking-tight px-2 text-center select-none">
          <span>Better Health</span>
          <span className="text-emerald-400 text-[8px]">•</span>
          <Leaf className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400 inline" />
          <span>Higher Productivity</span>
          <span className="text-emerald-400 text-[8px]">•</span>
          <span>Sustainable Tomorrow</span>
        </div>
      </div>
    </div>
  );
};
