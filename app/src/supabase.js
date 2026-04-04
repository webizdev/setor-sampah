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

/**
 * Fetches the brand name from the yari_company_profile table.
 * Caches the result in window.APP_BRAND_NAME to avoid redundant fetches.
 */
export async function fetchBrandName() {
  if (window.APP_BRAND_NAME) return window.APP_BRAND_NAME;
  
  try {
    const { data, error } = await supabase.from('yari_company_profile').select('nama').limit(1).single();
    if (error) throw error;
    window.APP_BRAND_NAME = data?.nama || 'YARI';
    document.title = window.APP_BRAND_NAME; // Update browser tab title
    return window.APP_BRAND_NAME;
  } catch (err) {
    console.warn("Failed to fetch brand name, using default.", err);
    window.APP_BRAND_NAME = 'YARI';
    return window.APP_BRAND_NAME;
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase URL and Key are missing in environment variables!");
  setTimeout(() => alert("Error: Sistem gagal terhubung ke database. Cek Environment Variables di Vercel."), 1000);
}
