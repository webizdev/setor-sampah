import { supabase } from '../supabase.js';
import { getBottomNav } from './home.js';

export async function renderProfile(container) {
  // Fetch user data
  const { data: user } = await supabase
    .from('yari_users')
    .select('*')
    .eq('id', window.USER_ID)
    .single();

  // Fetch pickups data for stats
  const { count: pickUpCount } = await supabase
    .from('yari_pickups')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', window.USER_ID);

  const saldo = user?.saldo || 0;
  const name = user?.full_name || 'User';
  const avatar = user?.avatar_url || '';
  const bank = user?.bank_name || '';
  const req = user?.bank_account || '';
  const wa = user?.whatsapp || '';
  const address = user?.address || '';

  const html = `
    <!-- Top App Bar -->
    <header class="fixed top-0 w-full z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl">
    <div class="flex justify-between items-center px-6 py-4 w-full">
    <button class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5] hover:bg-emerald-100/30 p-2 rounded-full transition-all">menu</button>
    <h1 class="headline tracking-tight font-bold text-lg text-[#0f5238] dark:text-[#f3f4f5]">Setor Sampah</h1>
    </div>
    </header>
    <main class="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
    <!-- Profile Header Section -->
    <section class="flex flex-col items-center text-center space-y-6">
    <div class="relative">
    <div class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-surface-container-lowest shadow-2xl">
    <img alt="User Profile" class="w-full h-full object-cover" src="${avatar}">
    </div>
    <button class="absolute bottom-1 right-1 bg-primary text-on-primary p-2 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
    <span class="material-symbols-outlined text-sm">edit</span>
    </button>
    </div>
    <div class="space-y-1">
    <h2 class="text-3xl font-headline font-extrabold tracking-tight text-on-surface">${name}</h2>
    <p class="text-on-surface-variant font-medium">Sustainability Enthusiast</p>
    </div>
    <!-- Action Cluster -->
    <div class="flex gap-4 w-full">
    <button class="flex-1 bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-on-primary py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all">
    <span class="material-symbols-outlined">chat</span>
        WhatsApp Contact
    </button>
    <button class="bg-surface-container-high text-primary p-4 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-all">
    <span class="material-symbols-outlined">settings</span>
    </button>
    </div>
    </section>
    <!-- Information Bento Grid -->
    <section class="grid grid-cols-1 gap-4">
    <!-- Personal Info Card -->
    <div class="bg-surface-container-lowest p-6 rounded-xl space-y-4">
    <div class="flex items-center justify-between">
    <h3 class="text-xs font-bold uppercase tracking-widest text-primary/60">Account Details</h3>
    <span class="material-symbols-outlined text-primary/40">verified_user</span>
    </div>
    <div class="space-y-4">
    <!-- Bank Name -->
    <div class="flex items-center gap-4">
    <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
    <span class="material-symbols-outlined">account_balance</span>
    </div>
    <div>
    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Bank</p>
    <p class="font-semibold text-on-surface">${bank}</p>
    </div>
    </div>
    <!-- Account Number -->
    <div class="flex items-center gap-4">
    <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
    <span class="material-symbols-outlined">payments</span>
    </div>
    <div>
    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">No. Rekening</p>
    <p class="font-semibold text-on-surface">${req}</p>
    </div>
    </div>
    <!-- WhatsApp Number -->
    <div class="flex items-center gap-4">
    <div class="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
    <span class="material-symbols-outlined">chat</span>
    </div>
    <div>
    <p class="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">WhatsApp</p>
    <p class="font-semibold text-on-surface">${wa}</p>
    </div>
    </div>
    </div>
    </div>
    <!-- Address & Map Section -->
    <div class="bg-surface-container-lowest p-6 rounded-xl space-y-6">
    <div class="flex items-center justify-between">
    <h3 class="text-xs font-bold uppercase tracking-widest text-primary/60">Pickup Address</h3>
    </div>
    <div class="flex gap-4">
    <div class="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
    <span class="material-symbols-outlined">location_on</span>
    </div>
    <div class="flex-1">
    <p class="font-bold text-on-surface leading-tight">${address}</p>
    </div>
    </div>
    </div>
    <!-- Stats Bar -->
    <div class="flex gap-4">
    <div class="flex-1 bg-secondary-container p-4 rounded-xl flex flex-col items-center justify-center text-center">
    <p class="text-3xl font-headline font-extrabold text-on-secondary-container">${pickUpCount || 0}</p>
    <p class="text-[10px] uppercase font-bold text-on-secondary-container opacity-70">Total Pickups</p>
    </div>
    <div class="flex-1 bg-tertiary-fixed p-4 rounded-xl flex flex-col items-center justify-center text-center">
    <p class="text-3xl font-headline font-extrabold text-on-tertiary-fixed-variant">${saldo.toLocaleString('id-ID')}</p>
    <p class="text-[10px] uppercase font-bold text-on-tertiary-fixed-variant opacity-70">SALDO</p>
    </div>
    </div>
    </section>
    </main>
    ${getBottomNav('/profile')}
  `;

  container.innerHTML = html;
}
