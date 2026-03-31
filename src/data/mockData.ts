export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'upcoming' | 'completed';
  image: string;
  speaker: string;
  location: string;
  materialsLink?: string;
  certificateLink?: string;
  attendanceLink?: string;
  submissionLink?: string;
  feedbackLink?: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Implementasi Kurikulum Merdeka di SD',
    description: 'Diskusi dan berbagi praktik baik mengenai penerapan Kurikulum Merdeka di sekolah dasar, tantangan yang dihadapi, dan solusi inovatif.',
    date: '15 Agustus 2026',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    speaker: 'Bpk. Budi Santoso, M.Pd.',
    location: 'SDN Beji 1 / Daring',
    materialsLink: 'https://drive.google.com/drive/folders/1',
    certificateLink: 'https://forms.gle/certificate1',
    attendanceLink: 'https://forms.gle/attendance1',
    submissionLink: 'https://forms.gle/submission1',
    feedbackLink: 'https://forms.gle/feedback1',
  },
  {
    id: '2',
    title: 'Pemanfaatan AI untuk Pembelajaran Interaktif',
    description: 'Workshop praktis penggunaan tools AI seperti ChatGPT dan Canva untuk membuat media pembelajaran yang menarik bagi siswa SD.',
    date: '20 September 2026',
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    speaker: 'Ibu Siti Aminah, S.Pd.',
    location: 'Aula Kecamatan Beji',
    materialsLink: 'https://drive.google.com/drive/folders/2',
    certificateLink: 'https://forms.gle/certificate2',
    attendanceLink: 'https://forms.gle/attendance2',
    submissionLink: 'https://forms.gle/submission2',
    feedbackLink: 'https://forms.gle/feedback2',
  },
  {
    id: '3',
    title: 'Strategi Literasi dan Numerasi Kelas Awal',
    description: 'Berbagi pengalaman sukses dalam meningkatkan kemampuan literasi dan numerasi siswa kelas 1-3 SD melalui metode permainan.',
    date: '10 November 2026',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    speaker: 'Dr. Rina Wati',
    location: 'Daring (Zoom)',
    materialsLink: 'https://drive.google.com/drive/folders/3',
    certificateLink: 'https://forms.gle/certificate3',
    attendanceLink: 'https://forms.gle/attendance3',
    submissionLink: 'https://forms.gle/submission3',
    feedbackLink: 'https://forms.gle/feedback3',
  },
  {
    id: '4',
    title: 'Manajemen Sekolah Berbasis Data',
    description: 'Pelatihan untuk Kepala Sekolah dalam memanfaatkan Rapor Pendidikan untuk perencanaan berbasis data.',
    date: '05 Desember 2026',
    status: 'upcoming',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
    speaker: 'Pengawas Bina Kecamatan Beji',
    location: 'SDN Beji 3',
    materialsLink: 'https://drive.google.com/drive/folders/4',
    certificateLink: 'https://forms.gle/certificate4',
    attendanceLink: 'https://forms.gle/attendance4',
    submissionLink: 'https://forms.gle/submission4',
    feedbackLink: 'https://forms.gle/feedback4',
  }
];

export interface UserReport {
  eventId: string;
  status: 'attended' | 'registered';
  hasAttended?: boolean;
  hasSubmittedTask?: boolean;
  hasSubmittedFeedback?: boolean;
  certificateIssued?: boolean;
  certificateUrl?: string;
  submissionUrl?: string;
}

export const mockUserReports: UserReport[] = [
  {
    eventId: '1',
    status: 'attended',
    hasAttended: true,
    hasSubmittedTask: true,
    hasSubmittedFeedback: true,
    certificateIssued: true,
    certificateUrl: 'https://k3sbeji.id/cert/user-123-event-1',
    submissionUrl: 'https://drive.google.com/file/d/123',
  },
  {
    eventId: '2',
    status: 'attended',
    hasAttended: true,
    hasSubmittedTask: false,
    hasSubmittedFeedback: true,
    certificateIssued: false,
  },
  {
    eventId: '3',
    status: 'registered',
    hasAttended: false,
    hasSubmittedTask: false,
    hasSubmittedFeedback: false,
    certificateIssued: false,
  }
];

export const mockChartData = [
  { name: 'Kegiatan 1', kehadiran: 85, kepuasan: 90 },
  { name: 'Kegiatan 2', kehadiran: 92, kepuasan: 95 },
  { name: 'Kegiatan 3', kehadiran: 78, kepuasan: 88 },
  { name: 'Kegiatan 4', kehadiran: 95, kepuasan: 96 },
];

export interface ResourceItem {
  id: string;
  category: 'modul_ajar' | 'modul_kokurikuler' | 'bank_soal';
  title: string;
  url: string;
}

export let mockResources: ResourceItem[] = [
  { id: 'ma1', category: 'modul_ajar', title: 'Modul Kelas 1', url: '' },
  { id: 'ma2', category: 'modul_ajar', title: 'Modul Kelas 2', url: '' },
  { id: 'ma3', category: 'modul_ajar', title: 'Modul Kelas 3', url: '' },
  { id: 'ma4', category: 'modul_ajar', title: 'Modul Kelas 4', url: '' },
  { id: 'ma5', category: 'modul_ajar', title: 'Modul Kelas 5', url: '' },
  { id: 'ma6', category: 'modul_ajar', title: 'Modul Kelas 6', url: '' },
  { id: 'mk1', category: 'modul_kokurikuler', title: 'Gaya Hidup Berkelanjutan', url: '' },
  { id: 'mk2', category: 'modul_kokurikuler', title: 'Kearifan Lokal', url: '' },
  { id: 'mk3', category: 'modul_kokurikuler', title: 'Bhinneka Tunggal Ika', url: '' },
  { id: 'mk4', category: 'modul_kokurikuler', title: 'Bangunlah Jiwa dan Raganya', url: '' },
  { id: 'mk5', category: 'modul_kokurikuler', title: 'Kewirausahaan', url: '' },
  { id: 'bs1', category: 'bank_soal', title: 'Soal ASTS (Tengah Semester)', url: '' },
  { id: 'bs2', category: 'bank_soal', title: 'Soal ASAS (Akhir Semester)', url: '' },
  { id: 'bs3', category: 'bank_soal', title: 'Latihan Soal OSN Matematika', url: '' },
  { id: 'bs4', category: 'bank_soal', title: 'Latihan Soal OSN IPA', url: '' },
  { id: 'bs5', category: 'bank_soal', title: 'Instrumen Asesmen Awal', url: '' },
];
