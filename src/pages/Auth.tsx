import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Loader2, Sparkles, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMsg('Please enter your registered email address.');
        return;
      }
      setIsSubmitting(true);
      try {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setErrorMsg(error.message || 'Failed to send reset link.');
        } else {
          setSuccessMsg('A password reset link has been dispatched to your email.');
          toast.success('Reset link dispatched!');
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
        setErrorMsg('Please complete all required fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setErrorMsg(error.message || 'Account registration failed.');
        } else {
          toast.success('Welcome to AniGuard! Account created.');
          navigate('/');
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Registration failed.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign in flow
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(error.message || 'Invalid email or password.');
      } else {
        toast.success('Authenticated successfully. Welcome back!');
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const autofillPreset = (presetEmail: string, presetName: string) => {
    setEmail(presetEmail);
    setFullName(presetName);
    setPassword('AniGuard@2026!');
    setConfirmPassword('AniGuard@2026!');
    setErrorMsg(null);
    toast.info(`Autofilled demo session for ${presetName}`);
  };

  return (
    <div className="min-h-screen bg-[#061811] text-white flex flex-col justify-center">
      {/* Two-Column Responsive Wrapper */}
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Form & Brand Interface (40% on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 bg-[#0C2B1D] px-6 py-10 sm:px-10 lg:px-12 xl:px-16 flex flex-col justify-between relative z-10 border-r border-[#15432E]/60 shadow-2xl">
          {/* Top Brand Logo */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                🌾
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  AniGuard
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8BE314]" />
                </span>
                <span className="text-[10px] text-[#719E86] font-medium tracking-wide block uppercase">
                  AI Livestock Intelligence
                </span>
              </div>
            </div>

            {/* Headline matching Reference Image 3 */}
            <div className="mt-8 sm:mt-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {mode === 'signin' && 'Start Your Day Fresh'}
                {mode === 'signup' && 'Create Your Farm Hub'}
                {mode === 'forgot' && 'Reset Access'}
              </h1>
              <p className="text-xs sm:text-sm text-[#8EB8A1] mt-2 leading-relaxed">
                {mode === 'signin' &&
                  'Manage your herd health, track milk yields and explore AI early warning insights. Enjoy precision livestock intelligence from our eco-conscious farm platform.'}
                {mode === 'signup' &&
                  'Join thousands of progressive dairy farmers and veterinary experts powering healthier herds and higher profitability with AI.'}
                {mode === 'forgot' &&
                  'Enter your registered email address and we will dispatch a secure recovery token to restore your farm account.'}
              </p>
            </div>

            {/* Error or Success feedback alert */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full Name Field (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Farmer or Organization Name"
                      className="w-full bg-[#082015]/80 border border-[#16432E] focus:border-[#8BE314] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-[#587F6A] focus:outline-none transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@gmail.com"
                    className="w-full bg-[#082015]/80 border border-[#16432E] focus:border-[#8BE314] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-[#587F6A] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              {mode !== 'forgot' && (
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#082015]/80 border border-[#16432E] focus:border-[#8BE314] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-[#587F6A] focus:outline-none pr-10 transition tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#587F6A] hover:text-white transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator (Sign Up) */}
                  {mode === 'signup' && password && (
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-[#082015] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength <= 25
                              ? 'bg-red-500 w-1/4'
                              : passwordStrength <= 50
                              ? 'bg-amber-500 w-2/4'
                              : passwordStrength <= 75
                              ? 'bg-blue-400 w-3/4'
                              : 'bg-[#8BE314] w-full'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-[#719E86]">
                        {passwordStrength <= 50 ? 'Medium complexity' : 'Strong secure password'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Sign Up) */}
              {mode === 'signup' && (
                <div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-[#082015]/80 border border-[#16432E] focus:border-[#8BE314] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-[#587F6A] focus:outline-none transition tracking-widest"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password Row (Sign In) */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#A3C8B2]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#082015] border-[#16432E] text-[#8BE314] accent-[#8BE314] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[#A3C8B2] hover:text-[#8BE314] transition font-medium"
                  >
                    Forgot Password ?
                  </button>
                </div>
              )}

              {/* Primary Action Button (Glowing Lime Button matching Image 3) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-[#8BE314] hover:bg-[#9BF024] text-[#0A2619] font-bold text-sm shadow-[0_0_20px_rgba(139,227,20,0.35)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A2619]" />
                  ) : mode === 'signin' ? (
                    'Sign in'
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Dispatch Reset Token'
                  )}
                </button>
              </div>

              {/* Switch Auth Mode Toggle */}
              <div className="pt-2 text-center text-xs text-[#8EB8A1]">
                {mode === 'signin' && (
                  <p>
                    Don't have an account ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-[#8BE314] font-bold hover:underline ml-1"
                    >
                      Sign Up
                    </button>
                  </p>
                )}
                {mode === 'signup' && (
                  <p>
                    Already have an account ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#8BE314] font-bold hover:underline ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                )}
                {mode === 'forgot' && (
                  <p>
                    Remember your password ?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-[#8BE314] font-bold hover:underline ml-1"
                    >
                      Return to Sign In
                    </button>
                  </p>
                )}
              </div>
            </form>

            {/* Quick Demo Credentials Autofill Helper */}
            <div className="mt-8 pt-4 border-t border-[#15432E]/60 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#649079] font-semibold block">
                Quick Demo Presets:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => autofillPreset('ramesh@dairy.in', 'Ramesh Kumar (Farmer)')}
                  className="px-3 py-2 rounded-lg bg-[#082015] hover:bg-[#0d2e1f] border border-[#16432E] text-left text-[11px] text-[#A3C8B2] hover:text-white transition"
                >
                  🚜 <strong>Farmer Ramesh</strong>
                </button>
                <button
                  type="button"
                  onClick={() => autofillPreset('dr.patel@aniguard.ai', 'Dr. Arvind Patel (Vet)')}
                  className="px-3 py-2 rounded-lg bg-[#082015] hover:bg-[#0d2e1f] border border-[#16432E] text-left text-[11px] text-[#A3C8B2] hover:text-white transition"
                >
                  🩺 <strong>Dr. Patel (Vet)</strong>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Copyright matching Image 3 */}
          <div className="pt-8 text-[11px] text-[#587F6A]">
            <p>Copyright © 2026 AniGuard Technologies Inc. All rights reserved.</p>
          </div>
        </div>

        {/* Right Column: Panoramic Pastoral Landscape (60% on Desktop) */}
        <div className="hidden lg:block lg:col-span-7 xl:col-span-7 relative overflow-hidden bg-[#0A2619]">
          {/* High-Resolution Artistic Landscape SVG */}
          <div className="absolute inset-0 w-full h-full">
            <svg
              viewBox="0 0 1000 800"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full object-cover"
            >
              <defs>
                {/* Sky Gradient */}
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7CC0EA" />
                  <stop offset="45%" stopColor="#B3E1F7" />
                  <stop offset="70%" stopColor="#E0F3FD" />
                  <stop offset="100%" stopColor="#EBF8FE" />
                </linearGradient>

                {/* Distant Blue Hills */}
                <linearGradient id="distHills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C9FB5" />
                  <stop offset="100%" stopColor="#5588A0" />
                </linearGradient>

                {/* Mid Hills */}
                <linearGradient id="midHills" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A855" />
                  <stop offset="100%" stopColor="#3C7E34" />
                </linearGradient>

                {/* Foreground Meadow */}
                <linearGradient id="foreMeadow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87CF53" />
                  <stop offset="60%" stopColor="#69BA3A" />
                  <stop offset="100%" stopColor="#4A9326" />
                </linearGradient>

                {/* Tree Foliage */}
                <radialGradient id="treeGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#559933" />
                  <stop offset="70%" stopColor="#2E691A" />
                  <stop offset="100%" stopColor="#1C4510" />
                </radialGradient>
              </defs>

              {/* Sky */}
              <rect width="1000" height="800" fill="url(#skyGrad)" />

              {/* Fluffy Clouds */}
              <path
                d="M100 120 Q 140 80, 200 100 T 300 110 Q 360 90, 420 120 L 420 160 L 100 160 Z"
                fill="#FFFFFF"
                opacity="0.85"
              />
              <path
                d="M600 90 Q 660 50, 740 80 T 880 90 Q 940 70, 1000 100 L 1000 150 L 600 150 Z"
                fill="#FFFFFF"
                opacity="0.75"
              />

              {/* Distant Blue Mountain Ridge */}
              <path
                d="M0 290 Q 250 210, 500 260 T 1000 240 L 1000 450 L 0 450 Z"
                fill="url(#distHills)"
                opacity="0.75"
              />

              {/* Rolling Green Hills */}
              <path
                d="M0 320 Q 300 240, 650 310 T 1000 290 L 1000 500 L 0 500 Z"
                fill="url(#midHills)"
              />
              <path
                d="M0 370 Q 200 320, 500 380 T 1000 350 L 1000 600 L 0 600 Z"
                fill="#549E35"
              />

              {/* Foreground Lush Meadow */}
              <path
                d="M0 430 Q 350 380, 700 440 T 1000 410 L 1000 800 L 0 800 Z"
                fill="url(#foreMeadow)"
              />

              {/* Oak Tree on Left */}
              <g transform="translate(10, 140)">
                {/* Trunk */}
                <path
                  d="M120 420 C130 360, 110 300, 115 250 C120 200, 150 170, 160 140 L 175 145 C165 190, 140 240, 145 300 C150 360, 165 400, 175 420 Z"
                  fill="#5A3A1E"
                />
                {/* Foliage Clusters */}
                <circle cx="150" cy="120" r="85" fill="url(#treeGrad)" />
                <circle cx="110" cy="160" r="75" fill="url(#treeGrad)" />
                <circle cx="200" cy="150" r="80" fill="url(#treeGrad)" />
                <circle cx="160" cy="80" r="65" fill="#69B840" opacity="0.6" />
              </g>

              {/* Dairy Cow 1 (Holstein Grazing Center) */}
              <g transform="translate(620, 390) scale(0.95)">
                {/* Cow Body */}
                <ellipse cx="60" cy="45" rx="55" ry="32" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                {/* Brown/Black Patches */}
                <path d="M30 25 Q 45 15, 65 30 Q 80 40, 60 55 Q 35 60, 30 25 Z" fill="#80381B" />
                <path d="M85 30 Q 105 25, 100 45 Q 90 60, 80 50 Z" fill="#80381B" />
                {/* Legs */}
                <rect x="25" y="65" width="8" height="40" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="42" y="65" width="8" height="38" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="75" y="65" width="8" height="40" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="92" y="65" width="8" height="38" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                {/* Head */}
                <ellipse cx="118" cy="35" rx="16" ry="18" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <ellipse cx="120" cy="32" rx="10" ry="12" fill="#80381B" />
                {/* Ears & Horns */}
                <ellipse cx="108" cy="22" rx="4" ry="7" fill="#80381B" />
                <ellipse cx="126" cy="22" rx="4" ry="7" fill="#FFFFFF" stroke="#2B1A0E" />
                {/* IoT Collar Telemetry Marker */}
                <rect x="108" y="42" width="16" height="5" rx="2" fill="#10B981" />
                <circle cx="116" cy="45" r="2.5" fill="#8BE314" />
              </g>

              {/* Dairy Cow 2 (Standing Right Background) */}
              <g transform="translate(760, 410) scale(0.68)">
                <ellipse cx="60" cy="45" rx="55" ry="32" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <path d="M30 25 Q 45 15, 65 30 Q 80 40, 60 55 Q 35 60, 30 25 Z" fill="#5A2411" />
                <rect x="25" y="65" width="8" height="40" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="42" y="65" width="8" height="38" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="75" y="65" width="8" height="40" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="92" y="65" width="8" height="38" rx="3" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <ellipse cx="118" cy="35" rx="16" ry="18" fill="#FFFFFF" stroke="#2B1A0E" strokeWidth="1.5" />
                <rect x="108" y="42" width="16" height="5" rx="2" fill="#10B981" />
              </g>

              {/* Wildflowers in foreground */}
              <g fill="#2B6CB0">
                <circle cx="450" cy="710" r="3" />
                <circle cx="465" cy="730" r="3.5" />
                <circle cx="580" cy="690" r="3" />
                <circle cx="620" cy="740" r="4" />
                <circle cx="700" cy="720" r="3" />
                <circle cx="850" cy="710" r="3.5" />
              </g>
              <g fill="#E53E3E">
                <circle cx="420" cy="730" r="3" />
                <circle cx="530" cy="750" r="3.5" />
                <circle cx="640" cy="710" r="3" />
                <circle cx="780" cy="740" r="4" />
                <circle cx="890" cy="730" r="3.5" />
              </g>
              <g fill="#D69E2E">
                <circle cx="480" cy="740" r="3" />
                <circle cx="560" cy="710" r="3" />
                <circle cx="660" cy="730" r="3.5" />
                <circle cx="740" cy="700" r="3" />
              </g>
            </svg>
          </div>

          {/* Floating AI Glassmorphic Badges */}
          <div className="absolute top-8 right-8 z-20 space-y-3 max-w-xs">
            {/* Badge 1: IoT Collar telemetry */}
            <div className="backdrop-blur-md bg-[#0C2B1D]/80 border border-emerald-400/30 rounded-2xl p-3.5 shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8BE314] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8BE314] animate-pulse" />
                  IoT Smart Collar
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">99.8% Sync</span>
              </div>
              <p className="text-xs text-white font-medium">Cow 101 · Rumination & Temp Normal</p>
            </div>

            {/* Badge 2: 48-Hour Early Warning */}
            <div className="backdrop-blur-md bg-[#0C2B1D]/80 border border-emerald-400/30 rounded-2xl p-3.5 shadow-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  ICAR AI Health Guard
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  Active
                </span>
              </div>
              <p className="text-xs text-white font-medium">48-Hour Mastitis & Anomaly Early Warning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
