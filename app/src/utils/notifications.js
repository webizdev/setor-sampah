import { supabase } from '../supabase.js';

/**
 * Shared utility for simple notifications based on yari_articles.
 */

export async function getNotificationBellHTML() {
  const lastSeenId = localStorage.getItem('yari_last_notif_id') || '';
  
  // Fetch only the latest article to check for indicator
  const { data: latest } = await supabase
    .from('yari_articles')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasNew = latest && latest.id !== lastSeenId;

  return `
    <div class="relative cursor-pointer group" onclick="window.toggleNotifications()">
      <span class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5] text-2xl group-hover:scale-110 transition-transform">notifications</span>
      ${hasNew ? `
        <span class="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        <span class="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
      ` : ''}
    </div>
  `;
}

// Global functions for the notification system
window.toggleNotifications = async () => {
  const existing = document.getElementById('notification-overlay');
  if (existing) {
    existing.classList.add('opacity-0');
    setTimeout(() => existing.remove(), 300);
    return;
  }

  // Create Overlay Layer
  const overlay = document.createElement('div');
  overlay.id = 'notification-overlay';
  overlay.className = 'fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md opacity-0 transition-opacity duration-300 flex justify-end';
  
  overlay.innerHTML = `
    <div class="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform translate-x-full transition-transform duration-300 ease-out" id="notification-panel">
      <!-- Panel Header -->
      <div class="px-6 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <div>
          <h2 class="headline text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Notifikasi</h2>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Update Terakhir</p>
        </div>
        <button onclick="window.toggleNotifications()" class="w-10 h-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all">
          <span class="material-symbols-outlined text-slate-500">close</span>
        </button>
      </div>

      <!-- Panel Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3" id="notif-list-container">
        <div class="flex flex-col items-center justify-center py-20 opacity-40">
           <span class="material-symbols-outlined text-5xl mb-4 animate-pulse">refresh</span>
           <p class="text-sm font-bold uppercase tracking-widest">Memuat Kabar Baru...</p>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="p-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p class="text-[10px] font-medium text-slate-400 italic">Terus hijaukan bumi dengan kontribusi Anda setiap hari!</p>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  
  // Animate Entrance
  requestAnimationFrame(() => {
    overlay.classList.remove('opacity-0');
    document.getElementById('notification-panel').classList.remove('translate-x-full');
  });

  // Fetch Data
  const { data: articles } = await supabase
    .from('yari_articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const container = document.getElementById('notif-list-container');
  if (!articles || articles.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 opacity-30">
        <span class="material-symbols-outlined text-6xl mb-4">notifications_off</span>
        <p class="font-bold uppercase tracking-widest text-xs">Belum ada notifikasi.</p>
      </div>
    `;
  } else {
    container.innerHTML = articles.map(item => {
      const type = item.kategori?.toLowerCase() || 'info';
      let icon = 'info';
      let bg = 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      
      if (type === 'event') {
        icon = 'event';
        bg = 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      } else if (type === 'layanan') {
        icon = 'eco';
        bg = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      }

      return `
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30 hover:border-primary/30 transition-all cursor-pointer group"
             onclick="window.open('${item.link_website}', '_blank')">
          <div class="flex gap-4">
            <div class="w-12 h-12 rounded-xl ${bg} flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-2xl">${icon}</span>
            </div>
            <div class="flex-grow min-w-0">
               <div class="flex justify-between items-start mb-1">
                 <span class="text-[9px] font-black uppercase tracking-widest opacity-50">${type}</span>
                 <span class="text-[9px] font-medium text-slate-400 italic">${new Date(item.created_at).toLocaleDateString('id-ID')}</span>
               </div>
               <h4 class="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-2 group-hover:text-primary transition-colors">${item.title}</h4>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Mark as read
    localStorage.setItem('yari_last_notif_id', articles[0].id);
  }
};
