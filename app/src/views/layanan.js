import { supabase, fetchBrandName } from '../supabase.js';
import { getBottomNav } from './home.js';

export async function renderLayanan(container) {
  const brandName = await fetchBrandName();

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

  const html = `
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-[5000] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
      <div class="flex items-center gap-4">
        <span class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5]">menu</span>
      </div>
      <h1 class="text-[#0f5238] dark:text-[#f3f4f5] font-black tracking-tighter text-lg headline">${brandName}</h1>
      <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm cursor-pointer" onclick="window.location.hash = '#/profile'">
        <img alt="User Profile" class="w-full h-full object-cover" src="${avatar}">
      </div>
    </header>
    
    <!-- Content Canvas -->
    <main class="pt-24 px-6 pb-32 max-w-2xl mx-auto">
      <section class="mb-8">
        <span class="text-secondary font-bold tracking-widest text-[9px] uppercase mb-1.5 block">Interactive Services</span>
        <h2 class="text-2xl font-black headline text-on-surface tracking-tight mb-2 leading-tight">Layanan Kami.</h2>
        <p class="text-on-surface-variant text-sm leading-relaxed opacity-70">Klik kartu untuk melihat detail layanan.</p>
      </section>

      <!-- Services List (Interactive) -->
      <div class="space-y-4">
        ${serviceItems.map((item, idx) => `
          <div id="service-card-${idx}" 
               onclick="window.toggleServiceCard(${idx})"
               class="bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 transition-all cursor-pointer overflow-hidden shadow-sm hover:shadow-md group relative">
            
            <!-- Card Header -->
            <div class="p-5 flex items-center gap-5 relative z-10">
              <div class="w-12 h-12 bg-primary/10 rounded-2xl flex-shrink-0 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner shadow-primary/5">
                <span class="material-symbols-outlined text-2xl">${item.icon || 'star'}</span>
              </div>
              
              <div class="flex-grow min-w-0">
                <h3 class="headline text-base font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">${item.judul}</h3>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Lihat Detail</span>
              </div>
              
              <div id="arrow-${idx}" class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 transition-all duration-300">
                <span class="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>

            <!-- Expandable Area (Using Grid trick for height transition) -->
            <div id="content-${idx}" class="grid transition-all duration-300 ease-in-out" style="grid-template-rows: 0fr;">
              <div class="overflow-hidden">
                <div class="px-5 pb-6 pt-0 mt-1 border-t border-slate-50 dark:border-slate-700/30">
                   <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 pt-5">
                    ${item.deskripsi || 'Nikmati layanan pengelolaan sampah terbaik dari kami untuk lingkungan yang lebih bersih dan sehat.'}
                   </p>
                   
                   <a href="${item.link_cta || '#/'}" 
                      onclick="event.stopPropagation()"
                      class="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center flex items-center justify-center gap-3 shadow-lg shadow-primary/10 hover:bg-[#0f5238] transition-all active:scale-[0.98]">
                      ${item.text_cta || 'Jadwalkan Sekarang'} 
                      <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                   </a>
                </div>
              </div>
            </div>

            <!-- Subtle background hint -->
            <div class="absolute right-[-20px] top-[-20px] opacity-[0.01] group-hover:opacity-[0.03] transition-opacity pointer-events-none">
                <span class="material-symbols-outlined text-[100px]">${item.icon || 'star'}</span>
            </div>
          </div>
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

  // Toggle Function Logic
  window.toggleServiceCard = (index) => {
    const cards = document.querySelectorAll('[id^="service-card-"]');
    const targetContent = document.getElementById(`content-${index}`);
    const targetArrow = document.getElementById(`arrow-${index}`);
    const targetCard = document.getElementById(`service-card-${index}`);
    
    const isExpanding = targetContent.style.gridTemplateRows === '0fr';

    // Close others
    cards.forEach((card, idx) => {
        document.getElementById(`content-${idx}`).style.gridTemplateRows = '0fr';
        document.getElementById(`arrow-${idx}`).style.transform = 'rotate(0deg)';
        document.getElementById(`service-card-${idx}`).classList.remove('ring-2', 'ring-primary/20', 'bg-slate-50', 'dark:bg-slate-900/50', 'shadow-xl');
    });

    if (isExpanding) {
        targetContent.style.gridTemplateRows = '1fr';
        targetArrow.style.transform = 'rotate(180deg)';
        targetCard.classList.add('ring-2', 'ring-primary/20', 'bg-slate-50', 'dark:bg-slate-900/50', 'shadow-xl');
    }
  };
}
