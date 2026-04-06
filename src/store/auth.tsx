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
  login: (nip: string, password?: string) => Promise<void>;
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

    // Check for hardcoded admin session
    const hardcodedAdmin = localStorage.getItem('hardcoded_admin');
    if (hardcodedAdmin === 'true') {
      setUser({
        id: 'admin-hardcoded-id',
        name: 'Administrator',
        email: 'admin@belajar.id',
        role: 'admin',
        status: 'active',
        nip: 'admin',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin@belajar.id`,
      });
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
      // Ignore if hardcoded admin is active
      if (localStorage.getItem('hardcoded_admin') === 'true') return;

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

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
        
        // Check for fallback user in localStorage
        const fallbackStr = localStorage.getItem(`fallback_user_${email}`);
        if (fallbackStr) {
          setUser(JSON.parse(fallbackStr));
          return;
        }

        if (error.code === 'PGRST116' || error.message.includes('infinite recursion')) {
          // Hardcode admin profile if not found in db due to RLS
          if (email === 'admin@belajar.id') {
            setUser({
              id: userId,
              name: 'Administrator',
              email: email,
              role: 'admin',
              status: 'active',
              nip: 'admin',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            });
            return;
          }

          // No rows returned or RLS error - User needs to register
          console.warn('Profile not found or inaccessible, needs registration');
          setUser({
            id: userId,
            name: email.split('@')[0],
            email: email,
            role: 'user',
            status: 'needs_registration' as any,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          });
          return;
        }
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

  const login = async (nip: string, password?: string) => {
    if (!isSupabaseConfigured) {
      alert('Supabase is not configured. Please connect to Supabase first.');
      return;
    }
    if (!password) {
      alert('Password is required for login');
      return;
    }

    let emailToLogin = '';
    
    // Normalize NIP for admin check
    const normalizedNip = nip.trim().toLowerCase();
    
    // Bypass RPC for admin
    if (normalizedNip === 'admin') {
      if (password === 'admin@beji') {
        localStorage.setItem('hardcoded_admin', 'true');
        setUser({
          id: 'admin-hardcoded-id',
          name: 'Administrator',
          email: 'admin@belajar.id',
          role: 'admin',
          status: 'active',
          nip: 'admin',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin@belajar.id`,
        });
        return;
      } else {
        throw new Error('Password admin salah. Silakan periksa kembali.');
      }
    } else {
      // Check fallback first
      const fallbackEmail = localStorage.getItem(`fallback_user_nip_${nip}`);
      if (fallbackEmail) {
        emailToLogin = fallbackEmail;
      } else {
        // 1. Cari email berdasarkan NIP
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('nip', nip)
          .maybeSingle();

        if (userData?.email) {
          emailToLogin = userData.email;
        } else if (nip.includes('@')) {
          // If user entered email instead of NIP
          emailToLogin = nip;
        } else {
          throw new Error('NIP tidak ditemukan atau belum terdaftar.');
        }
      }
    }

    // 2. Login menggunakan email yang ditemukan
    const { error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      throw new Error('Password salah atau akun tidak valid.');
    }
  };

  const logout = async () => {
    if (user?.id === 'admin-hardcoded-id') {
      localStorage.removeItem('hardcoded_admin');
      setUser(null);
      return;
    }
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
