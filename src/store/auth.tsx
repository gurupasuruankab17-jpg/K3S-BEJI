import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type UserRole = 'admin' | 'user' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'inactive' | 'pending';
  school?: string;
  nip?: string;
  phone?: string;
  employment_status?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - User needs to register
        console.warn('Profile not found in users table, needs registration');
        setUser({
          id: userId,
          name: email.split('@')[0],
          email: email,
          role: 'user',
          status: 'needs_registration' as any,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        });
      } else if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar,
          status: data.status,
          school: data.school,
          nip: data.nip,
          phone: data.phone,
          employment_status: data.employment_status,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password?: string) => {
    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Please connect to Supabase first.');
      return;
    }
    if (!password) {
      alert('Password is required for email login');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please connect to Supabase first.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        }
      }
    });
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, loading }}>
      {!loading && children}
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
