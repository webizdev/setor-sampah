import { supabase, fetchBrandName } from '../supabase.js';
import { getNotificationBellHTML } from '../utils/notifications.js';
import { getBottomNav } from './home.js';

export async function renderBeli(container) {
  const brandName = await fetchBrandName();

  // Fetch user data for the avatar
  const { data: user } = await supabase
    .from('yari_users')
    .select('avatar_url')
    .eq('id', window.USER_ID)
    .single();

  const avatar = user?.avatar_url || '';
  const notificationsHTML = await getNotificationBellHTML();

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
    ${notificationsHTML}
    </div>
    <h1 class="text-[#0f5238] font-black tracking-tighter text-lg font-['Plus_Jakarta_Sans']">${brandName}</h1>
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
        <button onclick="window.jualSampah('${item.id}', ${item.price_per_kg}, '${item.name.replace(/'/g, "\\'")}')" class="w-full mt-auto bg-surface-container-high text-primary font-bold py-2 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 hover:bg-primary hover:text-white transition-all duration-300 text-[11px] md:text-base tracking-wide">
            <span class="material-symbols-outlined text-[14px] md:text-[18px]">add_shopping_cart</span>
            Jual
        </button>
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
    <!-- Quantity Modal -->
    <div id="qty-modal" class="fixed inset-0 z-[6000] hidden items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="window.closeModal()"></div>
        <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-scale-up border border-slate-100/50">
            <div class="mb-8 text-center md:text-left">
                <span class="text-primary font-black text-xs uppercase tracking-[0.2em] mb-2 block">Konfirmasi Jual</span>
                <h3 id="modal-item-name" class="headline text-2xl font-black text-on-surface leading-tight">Memuat Item...</h3>
                <p id="modal-item-price" class="text-on-surface-variant font-bold text-sm opacity-60">Rp 0/Kg</p>
            </div>
            
            <div class="space-y-6">
                <div>
                    <label class="text-[10px] uppercase font-black tracking-widest text-outline mb-3 block">Banyaknya Sampah (Kg)</label>
                    <div class="relative group">
                        <input id="qty-input" type="number" step="0.1" min="0.1" placeholder="Contoh: 1.5" 
                               class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-2xl font-bold focus:ring-0 focus:border-primary transition-all outline-none"
                               oninput="window.updateTotal()">
                        <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Kg</span>
                    </div>
                </div>

                <div class="bg-primary/5 rounded-2xl p-5 flex justify-between items-center border border-primary/10">
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-primary/60">Estimasi Saldo</p>
                        <p id="total-estimation" class="text-2xl font-black text-primary">Rp 0</p>
                    </div>
                    <span class="material-symbols-outlined text-primary opacity-20 text-4xl">payments</span>
                </div>
            </div>

            <div class="flex flex-col gap-3 mt-10">
                <button onclick="window.confirmSale()" class="w-full bg-primary text-white font-black py-5 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-lg">Konfirmasi Jual</button>
                <button onclick="window.closeModal()" class="w-full text-on-surface-variant font-bold py-3 hover:bg-slate-100 rounded-2xl transition-all">Batalkan</button>
            </div>
        </div>
    </div>

    <style>
        @keyframes scale-up {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
            animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
    </style>

    ${getBottomNav('/jual')}
  `;

  container.innerHTML = html;

  // Internal state for selected transaction
  let currentWasteId = null;
  let currentPrice = 0;

  // Global function handler for opening modal
  window.jualSampah = (wasteId, price, name) => {
    currentWasteId = wasteId;
    currentPrice = price;
    
    const modal = document.getElementById('qty-modal');
    const modalName = document.getElementById('modal-item-name');
    const modalPrice = document.getElementById('modal-item-price');
    const qtyInput = document.getElementById('qty-input');
    const totalEst = document.getElementById('total-estimation');

    if (modal && modalName && modalPrice) {
        modalName.textContent = name;
        modalPrice.textContent = `Rp ${price.toLocaleString('id-ID')}/Kg`;
        qtyInput.value = '';
        totalEst.textContent = 'Rp 0';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Auto focus input
        setTimeout(() => qtyInput.focus(), 100);
    }
  };

  window.closeModal = () => {
    const modal = document.getElementById('qty-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
  };

  window.updateTotal = () => {
    const qtyInput = document.getElementById('qty-input');
    const totalEst = document.getElementById('total-estimation');
    const qty = parseFloat(qtyInput.value) || 0;
    
    const total = qty * currentPrice;
    totalEst.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  };

  window.confirmSale = async () => {
    const qtyInput = document.getElementById('qty-input');
    const qty = parseFloat(qtyInput.value);
    
    if (!qty || qty <= 0) {
        alert('Masukkan berat sampah yang valid!');
        return;
    }

    try {
        const { error } = await supabase.from('yari_transactions').insert({
            user_id: window.USER_ID,
            waste_id: currentWasteId,
            qty_kg: qty,
            total_price: qty * currentPrice,
            status: 'pending'
        });

        if (error) throw error;
        
        alert(`Berhasil! Pengajuan jual ${qty}kg sampah telah tercatat.`);
        window.closeModal();
    } catch(err) {
        console.error(err);
        alert('Gagal memproses transaksi: ' + err.message);
    }
  };
}

