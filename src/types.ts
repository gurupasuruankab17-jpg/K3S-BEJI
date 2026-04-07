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
  contributor?: string;
  phase?: string;
  class?: string;
  imageUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  image_url?: string;
}
