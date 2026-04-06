import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Award, BookOpen, Clock, FileText, CheckCircle2, ChevronRight, Download, Calendar, Lock, Layers, FileQuestion } from 'lucide-react';
import { getEvents, getUserReports, getResources } from '../lib/api';
import { Event, UserReport, ResourceItem } from '../types';

export function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'resources'>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const [eventsData, reportsData, resourcesData] = await Promise.all([
          getEvents(),
          getUserReports(user.id),
          getResources()
        ]);
        setEvents(eventsData);
        setUserReports(reportsData);
        setResources(resourcesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Get user's events based on reports
  const userEvents = userReports.map(report => {
    const event = events.find(e => e.id === report.eventId);
    return { ...event, ...report };
  }).filter(e => e.id) as any[];

  const completedEvents = userEvents.filter(e => e.status === 'attended');
  const upcomingEvents = userEvents.filter(e => e.status === 'registered');

  const handleDownloadClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    if (!url || url === '') {
      alert('Tautan unduhan belum dikonfigurasi oleh admin.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-cyan-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-slate-100" />
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{user.name}</h1>
            <p className="text-slate-500 font-medium mb-4 flex items-center justify-center md:justify-start">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Akun belajar.id</span>
              <span className="mx-3 text-slate-300">•</span>
              <span>{user.email}</span>
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-slate-700">{userEvents.length} <span className="text-slate-500 font-normal">Kegiatan</span></span>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-slate-700">{completedEvents.length} <span className="text-slate-500 font-normal">Sertifikat</span></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'events' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <Calendar className="w-5 h-5" />
          <span>Kegiatan Saya</span>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center space-x-2 whitespace-nowrap ${activeTab === 'resources' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Perangkat Pembelajaran</span>
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Registered Events */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span>Kegiatan Mendatang</span>
              </h2>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <Link to={`/event/${event.id}`} key={event.id} className="block group">
                    <div className="border border-slate-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50 hover:bg-white flex items-center justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{event.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{event.date} • {event.location}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Belum ada kegiatan mendatang yang didaftar.
              </div>
            )}
          </motion.div>

          {/* Completed Events & Certificates */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Riwayat & Sertifikat</span>
              </h2>
            </div>

            <div className="space-y-4">
              {completedEvents.map(event => (
                <div key={event.id} className="border border-slate-100 rounded-2xl p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img src={event.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div>
                      <Link to={`/event/${event.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                        {event.title}
                      </Link>
                      <p className="text-sm text-slate-500 mt-1">{event.date}</p>
                      {event.hasSubmittedTask && (
                        <a href={event.submissionLink || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Lihat Laporan Tugas
                        </a>
                      )}
                    </div>
                  </div>
                  {event.certificateIssued ? (
                    <a 
                      href={event.certificateLink || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="shrink-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh Sertifikat</span>
                    </a>
                  ) : (
                    <div className="shrink-0 bg-slate-50 text-slate-400 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 flex items-center justify-center space-x-2 cursor-not-allowed">
                      <Lock className="w-4 h-4" />
                      <span>Sertifikat Belum Tersedia</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">LMS Modern K3S</h3>
            <p className="text-blue-100 text-sm mb-6 relative z-10">
              Akses materi pembelajaran, kumpulkan tugas, dan dapatkan sertifikat secara otomatis setelah menyelesaikan kegiatan.
            </p>
            <Link 
              to="/" 
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center space-x-2 relative z-10 w-full justify-center"
            >
              <BookOpen className="w-4 h-4" />
              <span>Jelajahi Kegiatan Lain</span>
            </Link>
          </motion.div>
        </div>
      </div>
      )}

      {activeTab === 'resources' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Perangkat Pembelajaran</h2>
            <p className="text-slate-500 mt-1">Akses dan unduh modul ajar, modul kokurikuler, serta bank soal yang telah disediakan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Modul Ajar */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Modul Ajar</h3>
              <div className="space-y-3 mt-4">
                {resources.filter(r => r.category === 'modul_ajar').length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">Belum ada modul ajar</div>
                ) : resources.filter(r => r.category === 'modul_ajar').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="block p-4 rounded-xl bg-white hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-colors group/link shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img 
                          src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.title}`} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 group-hover/link:text-blue-600 text-sm block mb-1 truncate">{item.title}</span>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {item.contributor && <div className="truncate"><span className="font-medium">Oleh:</span> {item.contributor}</div>}
                          {item.phase && <div className="truncate"><span className="font-medium">Fase:</span> {item.phase}</div>}
                          {item.class && <div className="truncate"><span className="font-medium">Kelas:</span> {item.class}</div>}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-blue-600 shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Modul Kokurikuler */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Modul Kokurikuler</h3>
              <div className="space-y-3 mt-4">
                {resources.filter(r => r.category === 'modul_kokurikuler').length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">Belum ada modul kokurikuler</div>
                ) : resources.filter(r => r.category === 'modul_kokurikuler').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="block p-4 rounded-xl bg-white hover:bg-emerald-50 border border-slate-100 hover:border-emerald-100 transition-colors group/link shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img 
                          src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.title}`} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 group-hover/link:text-emerald-600 text-sm block mb-1 truncate">{item.title}</span>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {item.contributor && <div className="truncate"><span className="font-medium">Oleh:</span> {item.contributor}</div>}
                          {item.phase && <div className="truncate"><span className="font-medium">Fase:</span> {item.phase}</div>}
                          {item.class && <div className="truncate"><span className="font-medium">Kelas:</span> {item.class}</div>}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-emerald-600 shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Bank Soal */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bank Soal</h3>
              <div className="space-y-3 mt-4">
                {resources.filter(r => r.category === 'bank_soal').length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-4">Belum ada bank soal</div>
                ) : resources.filter(r => r.category === 'bank_soal').map((item) => (
                  <a 
                    key={item.id} 
                    href={item.url || '#'} 
                    onClick={(e) => handleDownloadClick(e, item.url)}
                    className="block p-4 rounded-xl bg-white hover:bg-amber-50 border border-slate-100 hover:border-amber-100 transition-colors group/link shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                        <img 
                          src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.title}`} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-slate-800 group-hover/link:text-amber-600 text-sm block mb-1 truncate">{item.title}</span>
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {item.contributor && <div className="truncate"><span className="font-medium">Oleh:</span> {item.contributor}</div>}
                          {item.phase && <div className="truncate"><span className="font-medium">Fase:</span> {item.phase}</div>}
                          {item.class && <div className="truncate"><span className="font-medium">Kelas:</span> {item.class}</div>}
                        </div>
                      </div>
                      <Download className="w-4 h-4 text-slate-400 group-hover/link:text-amber-600 shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
