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
 * Fetches company profile information (brand name, whatsapp, etc.)
 * Caches the result in window.APP_COMPANY_INFO to avoid redundant fetches.
 */
export async function fetchCompanyInfo() {
  if (window.APP_COMPANY_INFO) return window.APP_COMPANY_INFO;
  
  try {
    const { data, error } = await supabase.from('yari_company_profile').select('*').limit(1).single();
    if (error) throw error;
    
    window.APP_COMPANY_INFO = data || { nama: 'YARI', whatsapp: '628123456789' };
    window.APP_BRAND_NAME = window.APP_COMPANY_INFO.nama;
    document.title = window.APP_BRAND_NAME; 
    
    return window.APP_COMPANY_INFO;
  } catch (err) {
    console.warn("Failed to fetch company info, using defaults.", err);
    window.APP_COMPANY_INFO = { nama: 'YARI', whatsapp: '628123456789' };
    window.APP_BRAND_NAME = 'YARI';
    return window.APP_COMPANY_INFO;
  }
}

/**
 * Fetches the brand name from the yari_company_profile table.
 * Caches the result in window.APP_BRAND_NAME to avoid redundant fetches.
 */
export async function fetchBrandName() {
  const info = await fetchCompanyInfo();
  return info.nama;
}

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Supabase URL and Key are missing in environment variables!");
  setTimeout(() => {
    if (typeof yariAlert === 'function') {
      yariAlert("Koneksi Gagal", "Sistem gagal terhubung ke database. Cek Environment Variables Anda.", "error", 0);
    } else {
      alert("Error: Sistem gagal terhubung ke database. Cek Environment Variables.");
    }
  }, 1000);
}
