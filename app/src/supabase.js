import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : { 
      from: () => ({ select: async () => ({ data: null, error: new Error("Supabase Keys Missing") }) }),
      auth: { signInWithPassword: async () => ({ error: new Error("Supabase Keys Missing") }) }
    };

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase URL and Key are missing in environment variables!");
  setTimeout(() => alert("Error: Sistem gagal terhubung ke database. Cek Environment Variables di Vercel."), 1000);
}
