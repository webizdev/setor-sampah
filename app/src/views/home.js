import { supabase } from '../supabase.js';

export async function renderHome(container) {
  // Fetch user data
  const { data: user } = await supabase
    .from('yari_users')
    .select('*')
    .eq('id', window.USER_ID)
    .single();

  const contribution = user?.total_contribution_kg || 0;
  const saldo = user?.saldo || 0;
  const tier = user?.tier || 'Silver';
  const name = user?.full_name?.split(' ')[0] || 'User';
  const avatar = user?.avatar_url || '';

  const html = `
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
    <div class="flex justify-between items-center px-6 py-4 w-full">
    <div class="flex items-center gap-4">
    <span class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5]">menu</span>
    <span class="text-[#0f5238] dark:text-[#f3f4f5] font-black tracking-tighter text-xl headline">Setor Sampah</span>
    </div>
    <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
    <img alt="User Profile" class="w-full h-full object-cover" src="${avatar}">
    </div>
    </div>
    </header>
    <main class="pt-24 px-6 pb-32">
    <!-- Hero / User Greeting -->
    <section class="mb-8">
    <h2 class="headline text-2xl font-bold tracking-tight text-on-surface">Halo, ${name}!</h2>
    <p class="text-on-surface-variant font-medium">Selamat berkontribusi untuk bumi hari ini.</p>
    </section>
    <!-- Impact Summary Bento Grid -->
    <section class="grid grid-cols-2 gap-4 mb-10">
    <div class="col-span-2 bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] p-6 rounded-xl text-white flex justify-between items-center relative overflow-hidden">
    <div class="z-10">
    <p class="text-xs uppercase tracking-widest opacity-80 mb-1">Total Kontribusi</p>
    <p class="headline text-3xl font-extrabold">${contribution}<span class="text-lg font-normal ml-1">kg</span></p>
    <p class="text-sm mt-2 font-medium bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">Sangat Bagus!</p>
    </div>
    <div class="z-10 text-right">
    <span class="material-symbols-outlined text-4xl opacity-50" style="font-variation-settings: 'FILL' 1;">eco</span>
    </div>
    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
    </div>
    <div class="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between h-32">
    <span class="material-symbols-outlined text-secondary">database</span>
    <div>
    <p class="headline text-xl font-bold">${saldo.toLocaleString('id-ID')}</p>
    <p class="text-[11px] uppercase tracking-wider text-on-surface-variant">SALDO</p>
    </div>
    </div>
    <div class="bg-surface-container-lowest p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between h-32">
    <span class="material-symbols-outlined text-tertiary">workspace_premium</span>
    <div>
    <p class="headline text-xl font-bold">${tier}</p>
    <p class="text-[11px] uppercase tracking-wider text-on-surface-variant">Tier Member</p>
    </div>
    </div>
    </section>
    <!-- Large Slider Section: Agenda, Kegiatan, Edukasi, Lowongan Kerja -->
    <section class="mb-10 -mx-6 overflow-hidden">
    <div class="px-6 flex justify-between items-end mb-4">
    <h3 class="headline text-lg font-bold">Eksplorasi Lingkungan</h3>
    <span class="text-primary font-bold text-xs uppercase tracking-widest">Lihat Semua</span>
    </div>
    <div class="flex overflow-x-auto hide-scrollbar gap-5 px-6 pb-4">
    <!-- Agenda -->
    <div class="min-w-[280px] bg-surface-container-low rounded-xl overflow-hidden group">
    <div class="h-44 overflow-hidden relative">
    <img alt="Agenda" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdEBqlgW-d-eCA7rmuX4Xhs4UQc7je3B6NDlFHf-f1ElwwjVfNxZ9Y8cBbTC6sXKGB6DASQvlMZtcYNreXc1F-8WDH9hfmMg-JpB3dNTGGDcSg7qFYPE2BU7Y3KF0HEVwX8WvgPb4r2iifKLBu2O3Gdwc7DLJ9OylhIcnekCjtBpuyJ6QaWcAazhPjHdFOAnYex3E0HyidcRnLE7T3GoKtY2jjasGDubia0Qxed4GvJGR9ZTD7TMi1xGQYbpwsE9G-174C_gJY9A">
    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">Agenda</div>
    </div>
    <div class="p-5">
    <h4 class="headline font-bold text-lg leading-tight mb-2">Piknik Bersih Pantai Ancol</h4>
    <div class="flex items-center gap-2 text-on-surface-variant text-sm">
    <span class="material-symbols-outlined text-sm">calendar_today</span>
    <span>24 Okt 2026</span>
    </div>
    </div>
    </div>
    <!-- Kegiatan -->
    <div class="min-w-[280px] bg-surface-container-low rounded-xl overflow-hidden group">
    <div class="h-44 overflow-hidden relative">
    <img alt="Kegiatan" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABuBs6EFVMhPkKHMievbhDGjEtu2IOw_fkefMGmpbWHvcx5BFEf9viKcCjr8pEg7GzsNK8IXWDJHvPPC5naHoXSUZa2cOONJIO51FS67DsVgjIqS9HmPF9KO-J4ZN_kKhrteTcNBwCVmUqoHU8LSSC0x1jreln7i-KU6wFMfaKOvGk1zqMfVUhkhq-y7XpXY1yVf2Gt8F01kaRyEvzU6nKHCFMs4bf3aHmhXVdqFZS3iwxZvMp0SUjvDSq8O_6eI8f0nEPDT2q9g">
    <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-secondary">Kegiatan</div>
    </div>
    <div class="p-5">
    <h4 class="headline font-bold text-lg leading-tight mb-2">Workshop Kompos Mandiri</h4>
    <div class="flex items-center gap-2 text-on-surface-variant text-sm">
    <span class="material-symbols-outlined text-sm">location_on</span>
    <span>Balai Kota, Jakarta</span>
    </div>
    </div>
    </div>
    </div>
    </section>
    <!-- Quick Actions / Layanan Terpopuler -->
    <section class="mb-10">
    <h3 class="headline text-lg font-bold mb-5">Layanan Tercepat</h3>
    <div class="space-y-4">
    <div class="flex items-center p-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]" onclick="location.hash='#/layanan'">
    <div class="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center text-secondary">
    <span class="material-symbols-outlined">local_shipping</span>
    </div>
    <div class="ml-4 flex-1">
    <h5 class="headline font-bold text-on-surface">Jemput Sampah</h5>
    <p class="text-xs text-on-surface-variant">Sampah langsung dijemput di rumah</p>
    </div>
    <span class="material-symbols-outlined text-outline-variant">chevron_right</span>
    </div>
    <div class="flex items-center p-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]" onclick="location.hash='#/jual'">
    <div class="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center text-primary">
    <span class="material-symbols-outlined">shopping_cart</span>
    </div>
    <div class="ml-4 flex-1">
    <h5 class="headline font-bold text-on-surface">Jual Sampah</h5>
    <p class="text-xs text-on-surface-variant">Tukarkan sampahmu menjadi saldo</p>
    </div>
    <span class="material-symbols-outlined text-outline-variant">chevron_right</span>
    </div>
    </div>
    </section>
    </main>
    <div class="fixed bottom-24 right-6 z-40">
    <button class="w-16 h-16 bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-white rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform duration-200">
    <span class="material-symbols-outlined text-3xl" style="font-variation-settings: 'FILL' 1;">add</span>
    </button>
    </div>
    ${getBottomNav('/')}
  `;

  container.innerHTML = html;
}

export function getBottomNav(activeTab) {
  const getActiveClass = (tab) => tab === activeTab 
    ? 'bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-white rounded-[1.5rem]' 
    : 'text-[#191c1d]/50 dark:text-[#f3f4f5]/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl';
  const getIconClass = (tab) => tab === activeTab ? 'style="font-variation-settings: \'FILL\' 1;"' : '';

  return `
    <!-- BottomNavBar -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl z-50 rounded-t-[1.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <a class="flex flex-col items-center justify-center px-5 py-2 duration-200 transition-all ${getActiveClass('/')}" href="#/">
        <span class="material-symbols-outlined" ${getIconClass('/')}>home</span>
        <span class="font-['Manrope'] font-medium text-[11px] uppercase tracking-wider mt-1">Home</span>
        </a>
        <a class="flex flex-col items-center justify-center px-5 py-2 duration-200 transition-all ${getActiveClass('/jual')}" href="#/jual">
        <span class="material-symbols-outlined" ${getIconClass('/jual')}>shopping_bag</span>
        <span class="font-['Manrope'] font-medium text-[11px] uppercase tracking-wider mt-1">Jual</span>
        </a>
        <a class="flex flex-col items-center justify-center px-5 py-2 duration-200 transition-all ${getActiveClass('/layanan')}" href="#/layanan">
        <span class="material-symbols-outlined" ${getIconClass('/layanan')}>eco</span>
        <span class="font-['Manrope'] font-medium text-[11px] uppercase tracking-wider mt-1">Layanan</span>
        </a>
        <a class="flex flex-col items-center justify-center px-5 py-2 duration-200 transition-all ${getActiveClass('/profile')}" href="#/profile">
        <span class="material-symbols-outlined" ${getIconClass('/profile')}>person</span>
        <span class="font-['Manrope'] font-medium text-[11px] uppercase tracking-wider mt-1">Profile</span>
        </a>
    </nav>
  `;
}
