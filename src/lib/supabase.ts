import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://btkclxrjrajypzaofuxe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2NseHJqcmFqeXB6YW9mdXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDgwNTEsImV4cCI6MjA5MDQ4NDA1MX0.DTt1TsFkLTV7LstQHoNp_u8CiM7_TCiTrcvn8Etr-u4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (...args) => fetch(...args),
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
