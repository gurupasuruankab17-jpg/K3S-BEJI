import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Users, Award, Calendar, ArrowRight, CheckCircle2, BarChart3, Download, FileText, Layers, FileQuestion, Lock } from 'lucide-react';
import { mockEvents, mockChartData, mockResources } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '../store/auth';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming');
  const pastEvents = mockEvents.filter(e => e.status === 'completed');

  const handleDownloadClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan masuk (login) terlebih dahulu untuk mengunduh perangkat pembelajaran.');
      navigate('/login');
      return;
    }
    if (!url || url === '') {
      alert('Tautan unduhan belum dikonfigurasi oleh admin.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2000')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-800/50 rounded-full px-4 py-2 mb-6 border border-blue-700/50 backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
                <span className="text-sm font-medium text-blue-100">Komunitas Belajar Aktif</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Tingkatkan Kualitas <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">Pendidikan Dasar</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">
                Wadah kolaborasi, inovasi, dan berbagi praktik baik bagi Kepala Sekolah dan Guru SD se-Kecamatan Beji untuk mewujudkan pendidikan yang lebih baik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login" 
                  className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] flex items-center justify-center space-x-2"
                >
                  <span>Mulai Sekarang</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#kegiatan" 
                  className="bg-blue-800/40 hover:bg-blue-800/60 border border-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center"
                >
                  Lihat Kegiatan
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <img 
                src="https://lh3.googleusercontent.com/d/1JrqOeG2Fnb72n7QNKbbli_fEAJnqlaWN" 
                alt="Logo K3S Beji 3D" 
                className="w-full max-w-md mx-auto relative z-10 drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))' }}
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 Keuntungan Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Mengapa Bergabung dengan K3S Beji?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Kami menyediakan ekosistem belajar yang mendukung pengembangan profesional berkelanjutan.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kolaborasi Aktif</h3>
              <p className="text-slate-600 leading-relaxed">
                Berjejaring dengan sesama pendidik, bertukar ide, dan menyelesaikan tantangan pendidikan bersama-sama dalam lingkungan yang suportif.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Berbagi Praktik Baik</h3>
              <p className="text-slate-600 leading-relaxed">
                Akses ke berbagai materi, modul, dan pengalaman nyata dari sekolah-sekolah yang telah berhasil menerapkan inovasi pembelajaran.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sertifikasi & Laporan</h3>
              <p className="text-slate-600 leading-relaxed">
                Dapatkan pengakuan resmi berupa sertifikat untuk setiap kegiatan yang diikuti, terintegrasi langsung dengan profil Anda.
              </p>
            </motion.div>
          </div>

          {/* Statistik Komunitas */}
          <div className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 flex items-center justify-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <span>Statistik & Umpan Balik Kegiatan</span>
              </h3>
              <p className="text-slate-600">Grafik tingkat kehadiran dan kepuasan peserta pada kegiatan-kegiatan sebelumnya.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-80">
                <h4 className="text-center font-semibold text-slate-700 mb-6">Tingkat Kehadiran (%)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="kehadiran" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-80">
                <h4 className="text-center font-semibold text-slate-700 mb-6">Kepuasan Peserta (%)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="kepuasan" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pusat Unduhan Section */}
      <section id="pusat-unduhan" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pusat Perangkat Pembelajaran</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Akses dan unduh berbagai perangkat ajar, modul kokurikuler, serta bank soal secara gratis untuk mendukung proses pembelajaran yang berkualitas di kelas Anda.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Modul Ajar */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modul Ajar (Fase A - C)</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">
                Kumpulan modul ajar Kurikulum Merdeka lengkap untuk Kelas 1 hingga Kelas 6 SD.
              </p>
              <div className="space-y-3">
                {mockResources.filter(r => r.category === 'modul_ajar').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group/link"
                  >
                    <span className="font-medium text-slate-700 group-hover/link:text-blue-600">{item.title}</span>
                    {user ? (
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600" />
                    )}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Modul Kokurikuler */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Modul Kokurikuler (P5)</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">
                Panduan dan modul Projek Penguatan Profil Pelajar Pancasila dengan berbagai tema menarik.
              </p>
              <div className="space-y-3">
                {mockResources.filter(r => r.category === 'modul_kokurikuler').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group/link"
                  >
                    <span className="font-medium text-slate-700 group-hover/link:text-emerald-600 line-clamp-1 pr-4">{item.title}</span>
                    {user ? (
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-emerald-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 group-hover/link:text-emerald-600 shrink-0" />
                    )}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Bank Soal */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileQuestion className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Bank Soal & Evaluasi</h3>
              <p className="text-slate-600 mb-6 line-clamp-2">
                Kumpulan soal asesmen sumatif, formatif, dan latihan soal OSN untuk persiapan siswa.
              </p>
              <div className="space-y-3">
                {mockResources.filter(r => r.category === 'bank_soal').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group/link"
                  >
                    <span className="font-medium text-slate-700 group-hover/link:text-amber-600 line-clamp-1 pr-4">{item.title}</span>
                    {user ? (
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-amber-600 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 group-hover/link:text-amber-600 shrink-0" />
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Kegiatan Section */}
      <section id="kegiatan" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Kegiatan Komunitas</h2>
              <p className="text-lg text-slate-600 max-w-2xl">Ikuti berbagai kegiatan peningkatan kapasitas dan berbagi praktik baik.</p>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span>Akan Dilaksanakan</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map(event => (
                <Link to={`/event/${event.id}`} key={event.id}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 transition-all group flex flex-col sm:flex-row h-full"
                  >
                    <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Akan Datang
                      </div>
                    </div>
                    <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-600 mb-2">{event.date}</p>
                        <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                      </div>
                      <div className="flex items-center text-sm font-medium text-slate-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.speaker}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Past Events */}
          <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Telah Dilaksanakan</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {pastEvents.map(event => (
                <Link to={`/event/${event.id}`} key={event.id}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 transition-all group flex flex-col sm:flex-row h-full opacity-90"
                  >
                    <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 left-3 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        Selesai
                      </div>
                    </div>
                    <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 mb-2">{event.date}</p>
                        <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4">{event.description}</p>
                      </div>
                      <div className="flex items-center text-sm font-medium text-slate-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="truncate">{event.speaker}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
