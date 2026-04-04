import { supabase } from '../supabase.js';
import { getBottomNav } from './home.js';

export async function renderBeli(container) {
  // Fetch user data for the avatar
  const { data: user } = await supabase
    .from('yari_users')
    .select('avatar_url')
    .eq('id', window.USER_ID)
    .single();

  const avatar = user?.avatar_url || '';

  // Fetch catalog categories
  const { data: categories } = await supabase
    .from('yari_waste_categories')
    .select('*');

  // Fetch catalog items
  const { data: catalog } = await supabase
    .from('yari_waste_catalog')
    .select('*, yari_waste_categories(name)');

  const html = `
    <!-- Top Navigation Anchor (Shared Component) -->
    <header class="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full">
    <div class="flex items-center gap-4">
    <span class="material-symbols-outlined text-[#0f5238]">menu</span>
    </div>
    <h1 class="text-[#0f5238] font-black tracking-tighter text-lg font-['Plus_Jakarta_Sans']">Setor Sampah</h1>
    <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
    <img class="w-full h-full object-cover" src="${avatar}"/>
    </div>
    </header>
    <!-- Main Content Canvas -->
    <main class="pt-24 px-6 pb-32 max-w-5xl mx-auto">
    <!-- Search and Filter (Asymmetric Layout) -->
    <section class="mb-10">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div class="max-w-md">
    <span class="text-secondary font-bold text-xs uppercase tracking-[0.2em] mb-2 block">Katalog Marketplace</span>
    <h2 class="headline font-extrabold text-4xl tracking-tight text-on-surface uppercase">Jual Sampah</h2>
    <p class="text-on-surface-variant mt-2 text-sm md:text-base">Tukarkan sampah anorganik Anda menjadi saldo digital dengan nilai ekonomi tinggi.</p>
    </div>
    <div class="w-full md:w-72">
    <div class="bg-surface-container-low rounded-xl px-4 py-3 flex items-center gap-3">
    <span class="material-symbols-outlined text-outline">search</span>
    <input class="bg-transparent border-none focus:ring-0 text-sm w-full p-0" placeholder="Cari jenis sampah..." type="text"/>
    </div>
    </div>
    </div>
    </section>
    <!-- Category Horizontal Filmstrip -->
    <section class="mb-12">
    <div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
    <button class="flex-none bg-gradient-to-br from-[#0f5238] to-[#2d6a4f] text-white px-6 py-3 rounded-xl font-bold text-sm">Semua</button>
    ${(categories || []).map(cat => `
        <button class="flex-none bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors px-6 py-3 rounded-xl font-medium text-sm">${cat.name}</button>
    `).join('')}
    </div>
    </section>
    <!-- Product Bento Grid -->
    <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6" id="catalog-container">
    ${(catalog || []).map(item => `
        <div class="bg-surface-container-lowest rounded-xl md:rounded-[1.5rem] overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col">
        <div class="h-32 md:h-48 overflow-hidden relative">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}"/>
        ${item.is_popular ? `<div class="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-wider">Populer</div>` : ''}
        </div>
        <div class="p-3 md:p-6 flex-1 flex flex-col">
        <div class="flex flex-col mb-3 md:mb-4 flex-1">
        <div>
        <h3 class="font-bold text-[13px] md:text-lg text-on-surface line-clamp-1" title="${item.name}">${item.name}</h3>
        <span class="text-[9px] md:text-xs text-outline font-medium line-clamp-1">${item.yari_waste_categories?.name || 'Uncategorized'}</span>
        </div>
        <div class="mt-2 md:mt-0 text-left md:text-right">
        <p class="text-primary font-black text-[13px] md:text-lg">Rp ${item.price_per_kg.toLocaleString('id-ID')}</p>
        <p class="text-[9px] md:text-[10px] text-outline font-bold uppercase tracking-widest">Per Kg</p>
        </div>
        </div>
        <button onclick="window.jualSampah('${item.id}', ${item.price_per_kg})" class="w-full mt-auto bg-surface-container-high text-primary font-bold py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-all duration-300 text-[11px] md:text-base"><span class="material-symbols-outlined text-[14px] md:text-[18px]">add_shopping_cart</span> Jual</button>
        </div>
        </div>
    `).join('')}
    </section>

    <!-- Full-width Banner Card (Asymmetric Element) -->
    <section class="mt-8">
      <div class="bg-tertiary rounded-[1.5rem] p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-end min-h-[200px] md:min-h-[300px]">
      <div class="absolute top-0 right-0 p-4">
      <span class="material-symbols-outlined text-white/20 text-6xl md:text-8xl">eco</span>
      </div>
      <h4 class="headline text-xl md:text-2xl font-bold mb-2">Ingin Setoran Skala Besar?</h4>
      <p class="text-white/80 text-xs md:text-sm mb-4 md:mb-6 max-w-sm">Hubungi tim kurir khusus kami untuk penjemputan limbah industri di atas 100kg.</p>
      <button class="bg-white text-tertiary font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm self-start hover:scale-105 transition-transform">Hubungi Admin</button>
      </div>
    </section>
    </main>
    ${getBottomNav('/jual')}
  `;

  container.innerHTML = html;

  // Global function handler for Jual action
  window.jualSampah = async (wasteId, price) => {
    // Determine qty, for demo let's say 2kg
    const qty = 2; // prompt("Opsi: Berapa Kg?", "1");
    // if(!qty) return;

    try {
        await supabase.from('yari_transactions').insert({
            user_id: window.USER_ID,
            waste_id: wasteId,
            qty_kg: qty,
            total_price: qty * price
        });
        alert('Berhasil! Sampah telah dimasukkan ke daftar jual Anda.');
    } catch(err) {
        console.error(err);
        alert('Gagal memproses transaksi.');
    }
  };
}
