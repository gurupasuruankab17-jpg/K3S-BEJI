import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://btkclxrjrajypzaofuxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0a2NseHJqcmFqeXB6YW9mdXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MDgwNTEsImV4cCI6MjA5MDQ4NDA1MX0.DTt1TsFkLTV7LstQHoNp_u8CiM7_TCiTrcvn8Etr-u4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.rpc('get_email_by_nip', { p_nip: 'admin' });
  console.log('RPC result:', data, error);
}

test();
