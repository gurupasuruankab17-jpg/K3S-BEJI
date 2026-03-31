import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../store/auth';
import { Calendar, MapPin, User, FileText, CheckCircle2, ArrowLeft, Download, ClipboardCheck, UploadCloud, MessageSquareHeart, Lock } from 'lucide-react';
import { getEventById, getUserReports, updateUserReport } from '../lib/api';
import { Event, UserReport } from '../types';

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isRegistered, setIsRegistered] = useState(false);

  // Progress State
  const [progress, setProgress] = useState({
    hasAttended: false,
    hasSubmittedTask: false,
    hasSubmittedFeedback: false,
    certificateIssued: false,
  });

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const eventData = await getEventById(id);
        setEvent(eventData);

        if (user) {
          const reports = await getUserReports(user.id);
          const report = reports.find(r => r.eventId === id);
          if (report) {
            setUserReport(report);
            setIsRegistered(true);
            setProgress({
              hasAttended: report.hasAttended || false,
              hasSubmittedTask: report.hasSubmittedTask || false,
              hasSubmittedFeedback: report.hasSubmittedFeedback || false,
              certificateIssued: report.certificateIssued || false,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  // Check if all requirements are met
  const allRequirementsMet = progress.hasAttended && progress.hasSubmittedTask && progress.hasSubmittedFeedback;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Kegiatan Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-6">Maaf, kegiatan yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link to="/" className="text-blue-600 hover:underline flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    );
  }

  const handleRegister = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Simulate registration
    setIsRegistered(true);
    alert('Berhasil mendaftar kegiatan!');
  };

  const handleLinkClick = (e: React.MouseEvent, type: 'attendance' | 'task' | 'feedback', url?: string) => {
    e.preventDefault();
    if (!url) return;
    
    // Open link in new tab
    window.open(url, '_blank');
    
    // Simulate completing the task after a short delay (mocking a backend update)
    setTimeout(() => {
      setProgress(prev => ({
        ...prev,
        [type === 'attendance' ? 'hasAttended' : type === 'task' ? 'hasSubmittedTask' : 'hasSubmittedFeedback']: true
      }));
    }, 1500);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Image */}
      <div className="w-full h-[40vh] md:h-[50vh] relative overflow-hidden bg-slate-900">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Link to="/" className="inline-flex items-center space-x-2 text-slate-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              event.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {event.status === 'completed' ? 'Selesai' : 'Akan Datang'}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Deskripsi Kegiatan</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {event.description}
                </p>
                <p className="text-slate-600 leading-relaxed mt-4">
                  Kegiatan ini dirancang khusus untuk meningkatkan kompetensi dan berbagi praktik baik antar pendidik di lingkungan Kecamatan Beji. Peserta diharapkan dapat berpartisipasi aktif dan mengimplementasikan hasil diskusi di sekolah masing-masing.
                </p>
              </div>

              {/* Ruang Belajar (LMS View) - Shown if registered or completed */}
              {(isRegistered || event.status === 'completed') && user && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Ruang Belajar & Administrasi</h3>
                  
                  {/* Progress Indicator */}
                  <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-1.5 ${progress.hasAttended ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Hadir</span>
                      </div>
                      <div className="w-8 h-px bg-slate-200"></div>
                      <div className={`flex items-center space-x-1.5 ${progress.hasSubmittedTask ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Tugas</span>
                      </div>
                      <div className="w-8 h-px bg-slate-200"></div>
                      <div className={`flex items-center space-x-1.5 ${progress.hasSubmittedFeedback ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Umpan Balik</span>
                      </div>
                    </div>
                    {allRequirementsMet && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">Syarat Terpenuhi</span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Materi */}
                    <a 
                      href={event.materialsLink || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 group-hover:text-blue-700">Materi Kegiatan</p>
                        <p className="text-xs text-slate-500">Akses modul & presentasi</p>
                      </div>
                    </a>

                    {/* Daftar Hadir */}
                    <a 
                      href={event.attendanceLink || '#'} 
                      onClick={(e) => handleLinkClick(e, 'attendance', event.attendanceLink)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${progress.hasAttended ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${progress.hasAttended ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          <ClipboardCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold ${progress.hasAttended ? 'text-emerald-800' : 'text-slate-900 group-hover:text-indigo-700'}`}>Isi Daftar Hadir</p>
                          <p className={`text-xs ${progress.hasAttended ? 'text-emerald-600' : 'text-slate-500'}`}>Wajib diisi saat kegiatan</p>
                        </div>
                      </div>
                      {progress.hasAttended && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </a>

                    {/* Pengumpulan Tugas */}
                    <a 
                      href={event.submissionLink || '#'} 
                      onClick={(e) => handleLinkClick(e, 'task', event.submissionLink)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${progress.hasSubmittedTask ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${progress.hasSubmittedTask ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold ${progress.hasSubmittedTask ? 'text-emerald-800' : 'text-slate-900 group-hover:text-amber-700'}`}>Pengumpulan Tugas</p>
                          <p className={`text-xs ${progress.hasSubmittedTask ? 'text-emerald-600' : 'text-slate-500'}`}>Unggah bukti aksi nyata</p>
                        </div>
                      </div>
                      {progress.hasSubmittedTask && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </a>

                    {/* Umpan Balik */}
                    <a 
                      href={event.feedbackLink || '#'} 
                      onClick={(e) => handleLinkClick(e, 'feedback', event.feedbackLink)}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${progress.hasSubmittedFeedback ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${progress.hasSubmittedFeedback ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          <MessageSquareHeart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-semibold ${progress.hasSubmittedFeedback ? 'text-emerald-800' : 'text-slate-900 group-hover:text-rose-700'}`}>Form Umpan Balik</p>
                          <p className={`text-xs ${progress.hasSubmittedFeedback ? 'text-emerald-600' : 'text-slate-500'}`}>Evaluasi penyelenggaraan</p>
                        </div>
                      </div>
                      {progress.hasSubmittedFeedback && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </a>

                    {/* Sertifikat */}
                    {allRequirementsMet && progress.certificateIssued ? (
                      <a 
                        href={event.certificateLink || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-all group sm:col-span-2 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                            <Download className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-emerald-800">Download Sertifikat</p>
                            <p className="text-xs text-emerald-600 font-medium">Sertifikat Anda telah diterbitkan</p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 opacity-70 sm:col-span-2 cursor-not-allowed">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-500">Download Sertifikat</p>
                            <p className="text-xs text-slate-400">
                              {!allRequirementsMet 
                                ? "Selesaikan kehadiran, tugas, dan umpan balik terlebih dahulu" 
                                : "Menunggu admin menerbitkan sertifikat"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Informasi Pelaksanaan</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tanggal</p>
                    <p className="font-semibold text-slate-900">{event.date}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Lokasi / Media</p>
                    <p className="font-semibold text-slate-900">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Narasumber</p>
                    <p className="font-semibold text-slate-900">{event.speaker}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                {event.status === 'upcoming' ? (
                  !isRegistered ? (
                    <button 
                      onClick={handleRegister}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Daftar Sekarang</span>
                    </button>
                  ) : (
                    <div className="w-full bg-emerald-50 text-emerald-600 py-3.5 rounded-xl font-bold text-center border border-emerald-200 flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Terdaftar</span>
                    </div>
                  )
                ) : (
                  <div className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-xl font-bold text-center border border-slate-200">
                    Kegiatan Selesai
                  </div>
                )}
                {!user && (
                  <p className="text-xs text-center text-slate-500 mt-3">
                    *Pendaftaran menggunakan akun belajar.id
                  </p>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
