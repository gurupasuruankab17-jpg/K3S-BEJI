import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { motion } from 'motion/react';
import { LogIn, KeyRound, Mail, UserPlus, Building, Phone, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  
  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nip, setNip] = useState('');
  const [school, setSchool] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('tendik');
  const [phone, setPhone] = useState('');
  
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.status === 'needs_registration') {
      setIsRegistering(true);
      setEmail(user.email);
      // Pre-fill name if available from Google
      if (user.name && user.name !== user.email.split('@')[0]) {
        const parts = user.name.split(' ');
        setFirstName(parts[0]);
        if (parts.length > 1) {
          setLastName(parts.slice(1).join(' '));
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && user.status !== 'needs_registration' && user.status !== 'pending') {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [user, navigate]);

  if (user && user.status !== 'needs_registration' && user.status !== 'pending') {
    return null;
  }

  if (user?.status === 'pending') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pendaftaran Berhasil</h2>
          <p className="text-slate-600">
            Akun Anda sedang menunggu validasi oleh Admin. Silakan hubungi admin untuk mempercepat proses validasi.
          </p>
          <a 
            href="https://wa.me/6285749662221" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Hubungi Admin via WhatsApp
          </a>
          <button 
            onClick={() => logout()}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700"
          >
            Keluar
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        let authUserId = user?.id;
        
        // If not already authenticated via Google, create auth user
        if (!authUserId) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: `${firstName} ${lastName}`.trim(),
              }
            }
          });
          if (authError) throw authError;
          authUserId = authData.user?.id;
        }

        if (!authUserId) throw new Error("Gagal membuat akun");

        const isAdmin = email === 'admin@belajar.id';

        // Insert or update into users table with pending status
        const { error: insertError } = await supabase.from('users').upsert({
          id: authUserId,
          name: `${firstName} ${lastName}`.trim(),
          email,
          role: isAdmin ? 'admin' : 'user',
          status: isAdmin ? 'active' : 'pending',
          school,
          nip,
          phone,
          employment_status: employmentStatus,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        });

        if (insertError) {
          console.error("Supabase insert error:", insertError);
          // Fallback for RLS infinite recursion or other DB errors
          const fallbackUser = {
            id: authUserId,
            name: `${firstName} ${lastName}`.trim(),
            email,
            role: isAdmin ? 'admin' : 'user',
            status: isAdmin ? 'active' : 'pending',
            school,
            nip,
            phone,
            employment_status: employmentStatus,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
          };
          localStorage.setItem(`fallback_user_${email}`, JSON.stringify(fallbackUser));
          localStorage.setItem(`fallback_user_nip_${nip}`, email);
        }

        setShowSuccessPopup(true);
      } else {
        await login(nip, password);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Terjadi kesalahan.";
      setErrorPopup(isRegistering ? `Gagal mendaftar: ${errorMsg}` : `Gagal masuk: ${errorMsg}. Silakan periksa kembali NIP dan kata sandi Anda.`);
      console.error(error);
    }
  };

  if (showSuccessPopup) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
          <p className="text-slate-600">
            Terima kasih telah mendaftar. Akun Anda akan aktif setelah divalidasi oleh admin.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Anda akan dialihkan ke WhatsApp Admin untuk konfirmasi.
          </p>
          <a 
            href="https://wa.me/6285749662221" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Lanjutkan ke WhatsApp
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
      >
        <div>
          <img
            className="mx-auto h-20 w-auto drop-shadow-md"
            src="https://lh3.googleusercontent.com/d/1JrqOeG2Fnb72n7QNKbbli_fEAJnqlaWN"
            alt="K3S Beji"
            referrerPolicy="no-referrer"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {isRegistering ? 'Daftar Akun Baru' : 'Masuk ke Platform'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Komunitas Belajar K3S Beji
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Depan</label>
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Belakang</label>
                  <input
                    type="text"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NIP / NIPY / NIK</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Masukkan NIP Anda"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                />
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Asal Lembaga</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="appearance-none rounded-xl relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="appearance-none rounded-xl relative block w-full px-3 py-2 border border-slate-300 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  >
                    <option value="tendik">Tenaga Pendidik (Guru)</option>
                    <option value="kependidikan">Tenaga Kependidikan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No HP (+62)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="+628123456789"
                      className="appearance-none rounded-xl relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email (Untuk Pemulihan Akun)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={user?.status === 'needs_registration'}
                      className="appearance-none rounded-xl relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors disabled:bg-slate-100 disabled:text-slate-500"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            
            {(!user || user.status !== 'needs_registration') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-3 py-2 pl-10 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="group relative flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-sm hover:shadow-md"
              >
                {isRegistering ? 'Kirim Pendaftaran' : 'Masuk'}
              </button>
              
              {!isRegistering && !user && (
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="group relative flex-1 flex justify-center py-3 px-4 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-sm"
                >
                  Daftar
                </button>
              )}
            </div>
            
            {isRegistering && !user && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>

      {/* Error Popup */}
      {errorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center"
          >
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Gagal Masuk</h3>
            <div className="text-sm text-slate-600 mb-6 space-y-2">
              <p>{errorPopup}</p>
              {errorPopup.includes('admin') && (
                <div className="bg-slate-50 p-3 rounded-lg text-left mt-2 border border-slate-100">
                  <p className="font-medium text-slate-700 mb-1">Solusi untuk Admin:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Pastikan NIP/Username diisi: <strong>admin</strong></li>
                    <li>Pastikan Password diisi: <strong>admin@beji</strong></li>
                    <li>Perhatikan huruf kecil semua dan tanpa spasi</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => setErrorPopup(null)}
              className="w-full py-2 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Tutup & Coba Lagi
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
