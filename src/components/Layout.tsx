import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { LogOut, User, BookOpen, Settings, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="https://lh3.googleusercontent.com/d/1JrqOeG2Fnb72n7QNKbbli_fEAJnqlaWN" 
                alt="Logo K3S Beji" 
                className="h-10 w-10 object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="font-bold text-xl text-slate-800 hidden sm:block">
                K3S Beji
              </span>
            </Link>

            <nav className="flex items-center space-x-4">
              <a 
                href="/#pusat-unduhan" 
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors hidden md:flex items-center space-x-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Perangkat Pembelajaran</span>
              </a>
              <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
              {user ? (
                <>
                  <Link 
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  <div className="flex items-center space-x-3">
                    <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-100" />
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-500 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                      title="Keluar"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Masuk</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <img 
              src="https://lh3.googleusercontent.com/d/1JrqOeG2Fnb72n7QNKbbli_fEAJnqlaWN" 
              alt="Logo K3S Beji" 
              className="h-8 w-8 object-contain opacity-80 grayscale"
              referrerPolicy="no-referrer"
            />
            <span className="font-semibold text-slate-300">K3S Kecamatan Beji</span>
          </div>
          <p className="text-sm">Â© {new Date().getFullYear()} Komunitas Belajar Kelompok Kerja Kepala Sekolah SD Kecamatan Beji.</p>
        </div>
      </footer>
    </div>
  );
}
