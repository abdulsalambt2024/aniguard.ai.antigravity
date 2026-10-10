import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AniGuardAuthCard } from '@/components/aniguard/AniGuardAuthCard';

export default function Auth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-[#030e0b] overflow-hidden">
      {/* Background Decorative Ambient Glow & Leaf Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#083027] via-[#041612] to-[#020a08] opacity-90" />

      {/* Decorative Outer Leaves Silhouette */}
      <svg className="absolute top-0 left-0 w-80 h-80 text-emerald-950/40 pointer-events-none" viewBox="0 0 200 200" fill="currentColor">
        <path d="M0 0 C60 20 100 60 100 120 C60 100 20 60 0 0 Z" />
        <path d="M0 40 C40 50 70 80 80 140 C50 120 20 90 0 40 Z" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-96 h-96 text-emerald-950/40 transform rotate-180 pointer-events-none" viewBox="0 0 200 200" fill="currentColor">
        <path d="M0 0 C60 20 100 60 100 120 C60 100 20 60 0 0 Z" />
        <path d="M0 40 C40 50 70 80 80 140 C50 120 20 90 0 40 Z" />
      </svg>

      {/* Auth Card Centered */}
      <div className="relative z-10 w-full flex justify-center my-auto">
        <AniGuardAuthCard
          onSuccess={() => {
            navigate('/');
          }}
        />
      </div>
    </div>
  );
}
