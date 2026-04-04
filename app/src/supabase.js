import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const mockClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error("Supabase Keys Missing") }),
        order: () => ({
          limit: async () => ({ data: null, error: new Error("Supabase Keys Missing") })
        })
      }),
      order: () => ({
          order: () => ({
              limit: async () => ({ data: null, error: new Error("Supabase Keys Missing") })
          }),
          limit: async () => ({ data: null, error: new Error("Supabase Keys Missing") })
      }),
      limit: async () => ({ data: null, error: new Error("Supabase Keys Missing") })
    }),
    insert: async () => ({ error: new Error("Supabase Keys Missing") }),
    update: () => ({
      eq: async () => ({ error: new Error("Supabase Keys Missing") })
    })
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: new Error("Supabase Keys Missing") }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  auth: {
    signInWithPassword: async () => ({ error: new Error("Supabase Keys Missing") }),
    getSession: async () => ({ data: { session: null }, error: null })
  }
};

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : mockClient;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase URL and Key are missing in environment variables!");
  setTimeout(() => alert("Error: Sistem gagal terhubung ke database. Cek Environment Variables di Vercel."), 1000);
}
