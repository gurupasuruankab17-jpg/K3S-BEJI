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
  attendanceRate?: number;
  satisfactionRate?: number;
}

export interface UserReport {
  id: string;
  user_id: string;
  eventId: string;
  status: 'attended' | 'registered';
  hasAttended?: boolean;
  hasSubmittedTask?: boolean;
  hasSubmittedFeedback?: boolean;
  certificateIssued?: boolean;
  certificateUrl?: string;
  submissionUrl?: string;
}

export interface ResourceItem {
  id: string;
  category: 'modul_ajar' | 'modul_kokurikuler' | 'bank_soal';
  title: string;
  url: string;
}
