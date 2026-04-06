import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/auth';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, Users, FileText, Settings, Search, Calendar, X, CheckCircle2, XCircle, Download, Eye, Save, Building, Mail, Phone, User, Award, BookOpen, BarChart3, UserPlus } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent, getResources, createResource, updateResource, deleteResource, getAllUserReports } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Event, ResourceItem, UserReport } from '../types';

export function AdminDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'events' | 'users' | 'reports' | 'settings' | 'resources' | 'statistics'>('events');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<ResourceItem> | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    communityName: 'K3S Kecamatan Beji',
    email: 'admin@k3sbeji.id',
    phone: '+62 812-3456-7890',
    publicRegistration: true,
    autoCertificate: true,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsData, resourcesData, reportsData, { data: usersData }] = await Promise.all([
          getEvents(),
          getResources(),
          getAllUserReports(),
          supabase.from('users').select('*')
        ]);
        setEvents(eventsData);
        setResources(resourcesData);
        setAllReports(reportsData || []);
        setAllUsers(usersData || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    try {
      if (isAddingNew) {
        const { id, ...newEventData } = editingEvent;
        const savedEvent = await createEvent(newEventData);
        setEvents([savedEvent, ...events]);
        alert('Kegiatan baru berhasil ditambahkan!');
      } else {
        const { id, ...updateData } = editingEvent;
        const updatedEvent = await updateEvent(id, updateData);
        setEvents(events.map(ev => ev.id === id ? updatedEvent : ev));
        alert('Kegiatan berhasil diperbarui!');
      }
      setEditingEvent(null);
      setIsAddingNew(false);
    } catch (error: any) {
      alert(`Gagal menyimpan kegiatan: ${error.message}`);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(ev => ev.id !== id));
      } catch (error: any) {
        alert(`Gagal menghapus kegiatan: ${error.message}`);
      }
    }
  };

  const handleUpdateEventStats = async (id: string, field: 'attendanceRate' | 'satisfactionRate', value: number) => {
    try {
      // Optimistic update
      setEvents(events.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
      await updateEvent(id, { [field]: value });
    } catch (error: any) {
      alert(`Gagal memperbarui statistik: ${error.message}`);
      // Revert on error
      const originalEvent = events.find(ev => ev.id === id);
      if (originalEvent) {
        setEvents(events.map(ev => ev.id === id ? { ...ev, [field]: originalEvent[field] } : ev));
      }
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    
    try {
      if (editingResource.id) {
        const updated = await updateResource(editingResource.id, editingResource);
        setResources(resources.map(r => r.id === updated.id ? updated : r));
      } else {
        const created = await createResource(editingResource);
        setResources([created, ...resources]);
      }
      setIsResourceModalOpen(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Gagal menyimpan perangkat pembelajaran');
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus perangkat pembelajaran ini?')) {
      try {
        await deleteResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Gagal menghapus perangkat pembelajaran');
      }
    }
  };

  const handleSaveResources = async () => {
    try {
      // In a real app, you'd update each resource or use an upsert
      for (const resource of resources) {
        await supabase.from('resources').update({ url: resource.url }).eq('id', resource.id);
      }
      alert('Tautan perangkat pembelajaran berhasil disimpan!');
    } catch (error: any) {
      alert(`Gagal menyimpan perangkat: ${error.message}`);
    }
  };

  const handleValidateUser = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);
        
      if (error) throw error;
      
      setAllUsers(allUsers.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      alert(`Pengguna berhasil diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Nonaktif'}`);
    } catch (error: any) {
      alert(`Gagal memvalidasi pengguna: ${error.message}`);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setEditingEvent({
      id: '',
      title: '',
      description: '',
      date: '',
      status: 'upcoming',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
      speaker: '',
      location: '',
      materialsLink: '',
      attendanceLink: '',
      submissionLink: '',
      feedbackLink: '',
      certificateLink: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sticky top-24">
            <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-slate-100">
              <img src={user.avatar} alt="Admin" className="w-14 h-14 rounded-full bg-slate-100 ring-4 ring-slate-50" />
              <div>
                <h3 className="font-bold text-slate-900 leading-tight">{user.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Administrator</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'events' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Calendar className={`w-5 h-5 ${activeTab === 'events' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Kelola Kegiatan</span>
              </button>
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'users' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>Data Pengguna</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <FileText className={`w-5 h-5 ${activeTab === 'reports' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="text-left leading-tight">Laporan & Sertifikat</span>
              </button>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button 
                  onClick={() => setActiveTab('resources')}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'resources' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <BookOpen className={`w-5 h-5 ${activeTab === 'resources' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-left leading-tight">Perangkat Pembelajaran</span>
                </button>
                <button 
                  onClick={() => setActiveTab('statistics')}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === 'statistics' ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <BarChart3 className={`w-5 h-5 ${activeTab === 'statistics' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="text-left leading-tight">Statistik & Umpan Balik</span>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all mt-2 ${activeTab === 'settings' ? 'bg-slate-800 text-white font-semibold shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-slate-300' : 'text-slate-400'}`} />
                  <span>Pengaturan LMS</span>
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* TAB: EVENTS */}
          {activeTab === 'events' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Kelola Kegiatan</h2>
                  <p className="text-slate-500 mt-1">Daftar praktik baik dan kegiatan komunitas</p>
                </div>
                <button 
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-md flex items-center space-x-2 shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>

              <div className="mb-6 relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari kegiatan berdasarkan judul atau narasumber..." 
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <th className="py-4 font-semibold px-6">Judul Kegiatan</th>
                      <th className="py-4 font-semibold px-6">Tanggal</th>
                      <th className="py-4 font-semibold px-6">Status</th>
                      <th className="py-4 font-semibold px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group bg-white">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 line-clamp-1">{event.title}</div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center">
                            <User className="w-3.5 h-3.5 mr-1" />
                            {event.speaker}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            {event.date}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            event.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {event.status === 'completed' ? 'Selesai' : 'Akan Datang'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setIsAddingNew(false);
                                setEditingEvent(event);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" 
                              title="Edit"
                            >
                              <Edit2 className="w-4.5 h-4.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition-colors" 
                              title="Hapus"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: USERS */}
          {activeTab === 'users' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Data Pengguna</h2>
                  <p className="text-slate-500 mt-1">Kelola anggota komunitas K3S Beji</p>
                </div>
                <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center space-x-2 shrink-0">
                  <Download className="w-5 h-5" />
                  <span>Ekspor Data</span>
                </button>
              </div>

              {/* STATISTIK ANGGOTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
                  <div>
                    <div className="text-blue-600 text-sm font-bold mb-1">Total Pendaftar</div>
                    <div className="text-3xl font-extrabold text-blue-900">{allUsers.length}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-emerald-600 text-sm font-bold mb-1">Anggota Aktif</div>
                    <div className="text-3xl font-extrabold text-emerald-900">{allUsers.filter(u => u.status === 'active').length}</div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center justify-between">
                  <div>
                    <div className="text-amber-600 text-sm font-bold mb-1">Menunggu Validasi</div>
                    <div className="text-3xl font-extrabold text-amber-900">{allUsers.filter(u => u.status === 'pending').length}</div>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                      <th className="py-4 font-semibold px-6">Nama & Email</th>
                      <th className="py-4 font-semibold px-6">Peran</th>
                      <th className="py-4 font-semibold px-6">Instansi</th>
                      <th className="py-4 font-semibold px-6">Status</th>
                      <th className="py-4 font-semibold px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-sm text-slate-500 mt-1">{u.email}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 text-sm font-medium">{u.role === 'admin' ? 'Admin' : 'Guru'}</td>
                        <td className="py-4 px-6 text-slate-600 text-sm">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-slate-400" />
                            {u.school || '-'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Aktif
                            </span>
                          ) : u.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Menunggu Validasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u.status === 'pending' ? (
                            <div className="flex justify-end space-x-2">
                              <button 
                                onClick={() => handleValidateUser(u.id, 'active')}
                                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                Setujui
                              </button>
                              <button 
                                onClick={() => handleValidateUser(u.id, 'inactive')}
                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                              >
                                Tolak
                              </button>
                            </div>
                          ) : (
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                              Detail
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Laporan & Sertifikat</h2>
                  <p className="text-slate-500 mt-1">Pantau kehadiran, tugas, dan penerbitan sertifikat</p>
                </div>
              </div>

              <div className="space-y-6">
                {events.filter(e => e.status === 'completed').map(event => (
                  <div key={event.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-slate-50/50">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" /> {event.date}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Rekap Kehadiran</span>
                        </button>
                        <button 
                          onClick={() => alert(`Sertifikat untuk kegiatan ${event.title} berhasil diterbitkan untuk peserta yang memenuhi syarat!`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center space-x-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>Terbitkan Sertifikat</span>
                        </button>
                      </div>
                    </div>

                    {/* Mock Participants for this event */}
                    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                          <tr>
                            <th className="py-3 px-4 font-semibold">Peserta</th>
                            <th className="py-3 px-4 font-semibold text-center">Kehadiran</th>
                            <th className="py-3 px-4 font-semibold text-center">Tugas</th>
                            <th className="py-3 px-4 font-semibold text-center">Sertifikat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {allReports.filter(r => r.event_id === event.id).map((report) => {
                            const participant = allUsers.find(u => u.id === report.user_id);
                            return (
                              <tr key={report.id}>
                                <td className="py-3 px-4 font-medium text-slate-900">{participant?.name || 'Unknown User'}</td>
                                <td className="py-3 px-4 text-center">
                                  {report.report_url ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-slate-300 mx-auto" />}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {report.report_url ? (
                                    <a href={report.report_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat</a>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {report.certificate_url ? (
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Diterbitkan</span>
                                  ) : (
                                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">Tertunda</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {allReports.filter(r => r.event_id === event.id).length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-slate-500">Belum ada peserta yang mendaftar</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: RESOURCES */}
          {activeTab === 'resources' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Perangkat Pembelajaran</h2>
                  <p className="text-slate-500 mt-1">Kelola modul ajar, modul kokurikuler, dan bank soal</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingResource({ category: 'modul_ajar', title: '', url: '', contributor: '', phase: '', class: '' });
                    setIsResourceModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center space-x-2 shrink-0"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah Perangkat</span>
                </button>
              </div>

              <div className="space-y-10">
                {[
                  { id: 'modul_ajar', label: 'Modul Ajar (Fase A - C)', icon: <BookOpen className="w-5 h-5 mr-2 text-blue-600" />, color: 'blue' },
                  { id: 'modul_kokurikuler', label: 'Modul Kokurikuler (P5)', icon: <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />, color: 'emerald' },
                  { id: 'bank_soal', label: 'Bank Soal & Evaluasi', icon: <BookOpen className="w-5 h-5 mr-2 text-amber-600" />, color: 'amber' }
                ].map(category => (
                  <div key={category.id}>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center">
                        {category.icon} {category.label}
                      </h3>
                      <button 
                        onClick={() => {
                          setEditingResource({ category: category.id as any, title: '', url: '', contributor: '', phase: '', class: '' });
                          setIsResourceModalOpen(true);
                        }}
                        className={`text-sm font-medium text-${category.color}-600 hover:text-${category.color}-700 flex items-center`}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Tambah
                      </button>
                    </div>
                    
                    <div className="grid gap-4">
                      {resources.filter(r => r.category === category.id).length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                          Belum ada data
                        </div>
                      ) : (
                        resources.filter(r => r.category === category.id).map(item => (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex items-start sm:items-center gap-4 flex-1">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-slate-200">
                                <img 
                                  src={item.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.title}`} 
                                  alt={item.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.title}`;
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                                  {item.contributor && <span><span className="font-medium text-slate-600">Kontributor:</span> {item.contributor}</span>}
                                  {item.phase && <span><span className="font-medium text-slate-600">Fase:</span> {item.phase}</span>}
                                  {item.class && <span><span className="font-medium text-slate-600">Kelas:</span> {item.class}</span>}
                                </div>
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-1 inline-block truncate max-w-full">
                                  {item.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                              <button 
                                onClick={() => {
                                  setEditingResource(item);
                                  setIsResourceModalOpen(true);
                                }}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteResource(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'statistics' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Statistik & Umpan Balik Kegiatan</h2>
                <p className="text-slate-500 mt-1">Atur tingkat kehadiran dan kepuasan peserta untuk kegiatan yang telah selesai.</p>
              </div>

              <div className="space-y-6">
                {events.filter(e => e.status === 'completed').map(event => (
                  <div key={event.id} className="border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow bg-slate-50/50">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5" /> {event.date}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tingkat Kehadiran (%)</label>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={event.attendanceRate || 0}
                            onChange={(e) => handleUpdateEventStats(event.id, 'attendanceRate', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Kepuasan Peserta (%)</label>
                        <div className="flex items-center space-x-3">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={event.satisfactionRate || 0}
                            onChange={(e) => handleUpdateEventStats(event.id, 'satisfactionRate', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <span className="text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.status === 'completed').length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                    <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">Belum ada kegiatan selesai</h3>
                    <p className="text-slate-500">Statistik hanya dapat diatur untuk kegiatan yang telah selesai.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Pengaturan LMS</h2>
                  <p className="text-slate-500 mt-1">Konfigurasi platform komunitas belajar</p>
                </div>
                <button 
                  onClick={() => alert('Pengaturan berhasil disimpan!')}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center space-x-2 shrink-0"
                >
                  <Save className="w-5 h-5" />
                  <span>Simpan Pengaturan</span>
                </button>
              </div>

              <div className="space-y-8 max-w-3xl">
                {/* General Settings */}
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Informasi Umum</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Komunitas</label>
                      <input 
                        type="text" 
                        value={settings.communityName}
                        onChange={(e) => setSettings({...settings, communityName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Kontak</label>
                      <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="email" 
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Preferences */}
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Preferensi Sistem</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">Pendaftaran Publik Terbuka</div>
                        <div className="text-sm text-slate-500 mt-0.5">Izinkan pengguna baru mendaftar menggunakan akun belajar.id</div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.publicRegistration ? 'bg-blue-600' : 'bg-slate-200'}`} onClick={() => setSettings({...settings, publicRegistration: !settings.publicRegistration})}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.publicRegistration ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">Penerbitan Sertifikat Otomatis</div>
                        <div className="text-sm text-slate-500 mt-0.5">Terbitkan sertifikat otomatis setelah peserta mengisi daftar hadir dan tugas</div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoCertificate ? 'bg-blue-600' : 'bg-slate-200'}`} onClick={() => setSettings({...settings, autoCertificate: !settings.autoCertificate})}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoCertificate ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-bold text-slate-900">
                {isAddingNew ? 'Tambah Kegiatan Baru' : 'Edit Pengaturan Kegiatan'}
              </h3>
              <button 
                onClick={() => {
                  setEditingEvent(null);
                  setIsAddingNew(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              <form id="event-form" onSubmit={handleSaveEvent} className="space-y-8">
                
                {/* Section 1: Info Dasar */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Informasi Dasar</h4>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Kegiatan</label>
                    <input 
                      type="text" 
                      required
                      value={editingEvent.title}
                      onChange={e => setEditingEvent({...editingEvent, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Contoh: Workshop Implementasi Kurikulum Merdeka"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi</label>
                    <textarea 
                      required
                      rows={3}
                      value={editingEvent.description}
                      onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors resize-none"
                      placeholder="Jelaskan tujuan dan materi kegiatan..."
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Narasumber</label>
                      <input 
                        type="text" 
                        required
                        value={editingEvent.speaker}
                        onChange={e => setEditingEvent({...editingEvent, speaker: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Nama Pemateri"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi / Media</label>
                      <input 
                        type="text" 
                        required
                        value={editingEvent.location}
                        onChange={e => setEditingEvent({...editingEvent, location: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Contoh: Zoom Meeting atau SDN Beji 1"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select 
                        value={editingEvent.status}
                        onChange={e => setEditingEvent({...editingEvent, status: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors font-medium"
                      >
                        <option value="upcoming">Akan Datang</option>
                        <option value="completed">Selesai</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
                      <input 
                        type="text" 
                        required
                        value={editingEvent.date}
                        onChange={e => setEditingEvent({...editingEvent, date: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                        placeholder="Contoh: 15 Agustus 2026"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">URL Gambar (Opsional)</label>
                    <input 
                      type="url" 
                      value={editingEvent.image || ''}
                      onChange={e => setEditingEvent({...editingEvent, image: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 focus:bg-white transition-colors"
                      placeholder="https://..."
                    />
                    {editingEvent.image && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-100 relative">
                        <img src={editingEvent.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${editingEvent.title}`;
                        }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Tautan LMS */}
                <div className="space-y-5 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                    <Settings className="w-4 h-4 mr-2" /> Tautan Administrasi & LMS
                  </h4>
                  
                  <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Materi Kegiatan</label>
                      <input 
                        type="url" 
                        value={editingEvent.materialsLink || ''}
                        onChange={e => setEditingEvent({...editingEvent, materialsLink: e.target.value})}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Daftar Hadir</label>
                      <input 
                        type="url" 
                        value={editingEvent.attendanceLink || ''}
                        onChange={e => setEditingEvent({...editingEvent, attendanceLink: e.target.value})}
                        placeholder="https://forms.gle/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Pengumpulan Tugas</label>
                      <input 
                        type="url" 
                        value={editingEvent.submissionLink || ''}
                        onChange={e => setEditingEvent({...editingEvent, submissionLink: e.target.value})}
                        placeholder="https://forms.gle/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Umpan Balik</label>
                      <input 
                        type="url" 
                        value={editingEvent.feedbackLink || ''}
                        onChange={e => setEditingEvent({...editingEvent, feedbackLink: e.target.value})}
                        placeholder="https://forms.gle/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Download Sertifikat</label>
                      <input 
                        type="url" 
                        value={editingEvent.certificateLink || ''}
                        onChange={e => setEditingEvent({...editingEvent, certificateLink: e.target.value})}
                        placeholder="https://drive.google.com/... atau https://forms.gle/..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Statistik (Hanya untuk kegiatan selesai) */}
                {editingEvent.status === 'completed' && (
                  <div className="space-y-5 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" /> Statistik Umpan Balik
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tingkat Kehadiran (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={editingEvent.attendanceRate || ''}
                          onChange={e => setEditingEvent({...editingEvent, attendanceRate: Number(e.target.value)})}
                          placeholder="0 - 100"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kepuasan Peserta (%)</label>
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          value={editingEvent.satisfactionRate || ''}
                          onChange={e => setEditingEvent({...editingEvent, satisfactionRate: Number(e.target.value)})}
                          placeholder="0 - 100"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end space-x-3 shrink-0">
              <button 
                type="button"
                onClick={() => {
                  setEditingEvent(null);
                  setIsAddingNew(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="event-form"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Kegiatan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resource Modal */}
      {isResourceModalOpen && editingResource && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-slate-900">
                {editingResource.id ? 'Edit Perangkat Pembelajaran' : 'Tambah Perangkat Pembelajaran'}
              </h3>
              <button 
                onClick={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="resource-form" onSubmit={handleSaveResource} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
                  <select 
                    value={editingResource.category || 'modul_ajar'}
                    onChange={e => setEditingResource({...editingResource, category: e.target.value as any})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="modul_ajar">Modul Ajar (Fase A - C)</option>
                    <option value="modul_kokurikuler">Modul Kokurikuler (P5)</option>
                    <option value="bank_soal">Bank Soal & Evaluasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Modul / Bank Soal</label>
                  <input 
                    type="text" 
                    value={editingResource.title || ''}
                    onChange={e => setEditingResource({...editingResource, title: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama (Kontributor)</label>
                  <input 
                    type="text" 
                    value={editingResource.contributor || ''}
                    onChange={e => setEditingResource({...editingResource, contributor: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fase</label>
                    <input 
                      type="text" 
                      value={editingResource.phase || ''}
                      onChange={e => setEditingResource({...editingResource, phase: e.target.value})}
                      placeholder="Contoh: A, B, C"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kelas</label>
                    <input 
                      type="text" 
                      value={editingResource.class || ''}
                      onChange={e => setEditingResource({...editingResource, class: e.target.value})}
                      placeholder="Contoh: 1, 2, 3"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Link Drive / URL</label>
                  <input 
                    type="url" 
                    value={editingResource.url || ''}
                    onChange={e => setEditingResource({...editingResource, url: e.target.value})}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">URL Gambar (Opsional)</label>
                  <input 
                    type="url" 
                    value={editingResource.imageUrl || ''}
                    onChange={e => setEditingResource({...editingResource, imageUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {editingResource.imageUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 relative">
                      <img src={editingResource.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/shapes/svg?seed=${editingResource.title}`;
                      }} />
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end space-x-3 shrink-0">
              <button 
                type="button"
                onClick={() => {
                  setEditingResource(null);
                  setIsResourceModalOpen(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="resource-form"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

