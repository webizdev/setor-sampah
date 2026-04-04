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
    <main class="pt-24 px-6 pb-32 max-w-5xl mx-auto">
    <!-- Hero Section / Header -->
    <section class="mb-12">
    <span class="text-secondary font-bold tracking-widest text-[11px] uppercase mb-2 block">Our Services</span>
    <h2 class="text-4xl font-extrabold headline text-on-surface tracking-tight mb-4 leading-tight">Solusi Berkelanjutan untuk <br><span class="text-primary">Masa Depan Bumi.</span></h2>
    <p class="text-on-surface-variant max-w-xl text-lg leading-relaxed">Pilih layanan pengelolaan limbah premium yang dirancang khusus untuk kebutuhan gaya hidup modern dan tanggung jawab industri.</p>
    </section>
    <!-- Services Grid (Bento Style) -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
    <!-- Pick-up Service (Main Highlight) -->
    <div class="md:col-span-8 bg-surface-container-lowest rounded-[1.5rem] p-8 flex flex-col justify-between min-h-[320px] relative overflow-hidden group">
    <div class="relative z-10">
    <div class="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center mb-6">
    <span class="material-symbols-outlined text-primary text-3xl">local_shipping</span>
    </div>
    <h3 class="headline text-2xl font-bold text-on-surface mb-3">Pick-up Service</h3>
    <p class="text-on-surface-variant max-w-sm">Penjemputan sampah rutin langsung dari depan pintu Anda. Kami mengelola logistik, Anda cukup memilah.</p>
    </div>
    <div class="relative z-10 mt-6">
    <button onclick="window.jadwalkan()" class="bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-white px-6 py-3 rounded-full font-bold text-sm inline-flex items-center gap-2 group-hover:scale-105 transition-transform">
        Jadwalkan Sekarang
        <span class="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
    </div>
    <div class="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
    <span class="material-symbols-outlined text-[200px]">recycling</span>
    </div>
    </div>
    <!-- Recycling Training -->
    <div class="md:col-span-4 bg-secondary-container/30 rounded-[1.5rem] p-8 flex flex-col group">
    <div class="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-6">
    <span class="material-symbols-outlined text-white">school</span>
    </div>
    <h3 class="headline text-xl font-bold text-on-surface mb-3">Recycling Training</h3>
    <p class="text-on-surface-variant text-sm leading-relaxed mb-6">Edukasi mendalam tentang cara memproses limbah rumah tangga menjadi nilai ekonomi tinggi.</p>
    <div class="mt-auto">
    <span class="text-secondary font-bold text-sm inline-flex items-center gap-1 cursor-pointer">
        Pelajari Modul <span class="material-symbols-outlined text-xs">chevron_right</span>
    </span>
    </div>
    </div>
    </div>
    </main>
    ${getBottomNav('/layanan')}
  `;

  container.innerHTML = html;

  window.jadwalkan = async () => {
    alert("Proses Penjadwalan: Aplikasi akan diarahkan ke form pemesanan pickup address.");
  };
}
