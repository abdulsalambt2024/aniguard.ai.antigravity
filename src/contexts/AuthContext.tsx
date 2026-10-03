import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'super_admin' | 'admin' | 'user' | 'veterinarian' | 'viewer' | 'member';

export const PROTECTED_SUPER_ADMIN_EMAILS = [
  'abdul.salam.bt.2024@miet.ac.in',
  'hayatamr9608@gmail.com',
  'ashi.gautam.bt.2024@miet.ac.in',
];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const determineRole = async (userId: string, email?: string | null): Promise<UserRole> => {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Immutable Protected Super Admin Check
    if (PROTECTED_SUPER_ADMIN_EMAILS.includes(normalizedEmail)) {
      return 'super_admin';
    }

    try {
      // 2. Check user_roles table
      const { data: roleData } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData?.role) {
        return roleData.role as UserRole;
      }

      // 3. Check RPC function
      const { data: rpcRole } = await (supabase as any)
        .rpc('get_user_role', { _user_id: userId });

      if (rpcRole) {
        return rpcRole as UserRole;
      }

      // 4. Check profiles table
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (profileData?.role) {
        return profileData.role as UserRole;
      }
    } catch (e) {
      console.warn('Role lookup check fallback:', e);
    }

    return 'user';
  };

  const handleUserSession = async (currentSession: Session | null) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      const resolvedRole = await determineRole(currentUser.id, currentUser.email);
      setRole(resolvedRole);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    // 1. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        await handleUserSession(currentSession);
        setLoading(false);
      }
    );

    // 2. Fetch existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      await handleUserSession(currentSession);
      setLoading(false);
    }).catch((err) => {
      console.error('Session retrieval error:', err);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshSession = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    await handleUserSession(currentSession);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        await handleUserSession(data.session);
      }

      toast({
        title: "Account Created!",
        description: data.session
          ? "You are now authenticated and signed in."
          : "Please check your inbox if email verification is required.",
      });

      return { data, error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        await handleUserSession(data.session);
      }

      toast({
        title: "Authenticated!",
        description: `Welcome back${email ? `, ${email}` : ''}!`,
      });

      return { data, error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setRole(null);

      toast({
        title: "Signed out",
        description: "You have been successfully signed out from AniGuard.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error?.message || 'Could not complete sign out.',
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "Password reset link sent to your inbox.",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
