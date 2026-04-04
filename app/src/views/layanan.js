import { supabase } from '../supabase.js';
import { getBottomNav } from './home.js';

export async function renderLayanan(container) {

  // Fetch user data for profile picture
  const { data: user } = await supabase
    .from('yari_users')
    .select('avatar_url')
    .eq('id', window.USER_ID)
    .single();

  const avatar = user?.avatar_url || 'https://via.placeholder.com/150';

  // Fetch dynamic services from the database
  const { data: services, error: servicesError } = await supabase
    .from('yari_services')
    .select('*')
    .order('urutan', { ascending: true });

  if (servicesError) console.error("Error loading services", servicesError);

  const serviceItems = services || [];
  const firstService = serviceItems[0];
  const otherServices = serviceItems.slice(1);

  const html = `
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-[5000] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
      <div class="flex items-center gap-4">
        <span class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5]">menu</span>
      </div>
      <h1 class="text-[#0f5238] dark:text-[#f3f4f5] font-black tracking-tighter text-lg headline">Setor Sampah</h1>
      <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm cursor-pointer" onclick="window.location.hash = '#/profile'">
        <img alt="User Profile" class="w-full h-full object-cover" src="${avatar}">
      </div>
    </header>
    
    <!-- Content Canvas -->
    <main class="pt-24 px-6 pb-32 max-w-2xl mx-auto">
      <section class="mb-8">
        <span class="text-secondary font-bold tracking-widest text-[9px] uppercase mb-1.5 block">Premium Services</span>
        <h2 class="text-2xl font-black headline text-on-surface tracking-tight mb-2 leading-tight">Layanan Kami.</h2>
        <p class="text-on-surface-variant text-sm leading-relaxed opacity-70">Pilih solusi pengelolaan limbah yang Anda butuhkan.</p>
      </section>

      <!-- Services List (Medium Compact) -->
      <div class="space-y-4">
        ${serviceItems.map(item => `
          <a href="${item.link_cta || '#/'}" class="bg-white dark:bg-slate-800 rounded-[2rem] p-5 flex items-center gap-5 group border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all hover:shadow-xl active:scale-[0.98] relative overflow-hidden">
            <div class="w-14 h-14 bg-primary/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner shadow-primary/5">
              <span class="material-symbols-outlined text-3xl">${item.icon || 'star'}</span>
            </div>
            
            <div class="flex-grow min-w-0">
              <h3 class="headline text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-1 truncate">${item.judul}</h3>
              <p class="text-slate-500 dark:text-slate-400 text-xs leading-none opacity-70 truncate">${item.deskripsi || ''}</p>
            </div>
            
            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
              <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
            </div>

            <!-- Subtle background hint -->
            <div class="absolute right-[-10%] top-[-10%] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <span class="material-symbols-outlined text-[120px]">${item.icon || 'star'}</span>
            </div>
          </a>
        `).join('')}

        ${serviceItems.length === 0 ? `
          <div class="py-12 text-center bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p class="text-slate-400 font-bold text-sm">Layanan belum tersedia.</p>
          </div>
        ` : ''}
      </div>
    </main>
    ${getBottomNav('/layanan')}
  `;

  container.innerHTML = html;
}
