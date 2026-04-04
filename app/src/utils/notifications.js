import { supabase } from '../supabase.js';

/**
 * Shared utility for granular notifications based on yari_articles.
 * Tracks read states in localStorage and removes read items from the "Latest Update" list.
 */

function getReadIds() {
  try {
    const stored = localStorage.getItem('yari_read_notif_ids');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveReadId(id) {
  const readIds = getReadIds();
  if (!readIds.includes(id)) {
    readIds.push(id);
    localStorage.setItem('yari_read_notif_ids', JSON.stringify(readIds));
  }
}

export async function getNotificationBellHTML() {
  const readIds = getReadIds();
  
  // Fetch only the latest article that has been marked for notification
  const { data: latest } = await supabase
    .from('yari_articles')
    .select('id')
    .eq('is_notified', true)
    .order('notified_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasNew = latest && !readIds.includes(latest.id);

  return `
    <div id="notif-bell-container" class="relative cursor-pointer group" onclick="window.toggleNotifications()">
      <span class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5] text-2xl group-hover:scale-110 transition-transform">notifications</span>
      ${hasNew ? `
        <span id="notif-badge-solid" class="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        <span id="notif-badge-ping" class="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
      ` : ''}
    </div>
  `;
}

// Global action to mark as read and handle navigation
window.markNotifAsRead = (id, url) => {
  // 1. Save state
  saveReadId(id);
  
  // 2. Immediate UI feedback in panel
  const item = document.getElementById(`notif-item-${id}`);
  if (item) {
    item.classList.add('opacity-0', 'scale-95', '-translate-x-4');
    setTimeout(() => {
      item.remove();
      // If list is empty, show empty state
      const container = document.getElementById('notif-list-container');
      if (container && container.children.length === 0) {
        container.innerHTML = `
          <div class="flex flex-col items-center justify-center py-20 opacity-30">
            <span class="material-symbols-outlined text-6xl mb-4">notifications_off</span>
            <p class="font-bold uppercase tracking-widest text-xs">Belum ada notifikasi.</p>
          </div>
        `;
      }
    }, 300);
  }

  // 3. Immediate UI feedback on bell (if this was the latest)
  // We check if there's any newer unread notification locally? 
  // For simplicity, we remove the badge from the bell immediately if it exists
  const badgeSolid = document.getElementById('notif-badge-solid');
  const badgePing = document.getElementById('notif-badge-ping');
  if (badgeSolid) badgeSolid.remove();
  if (badgePing) badgePing.remove();

  // 4. Navigate
  if (url && url !== 'undefined') {
    window.open(url, '_blank');
  }
};

window.toggleNotifications = async () => {
  const existing = document.getElementById('notification-overlay');
  if (existing) {
    existing.classList.add('opacity-0');
    setTimeout(() => existing.remove(), 300);
    return;
  }

  const readIds = getReadIds();

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

  // Fetch all notified articles
  const { data: articles } = await supabase
    .from('yari_articles')
    .select('*')
    .eq('is_notified', true)
    .order('notified_at', { ascending: false })
    .limit(10);

  const container = document.getElementById('notif-list-container');
  
  // Filter out already read articles (Inbox Zero approach)
  const unreadArticles = (articles || []).filter(item => !readIds.includes(item.id));

  if (unreadArticles.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 opacity-30">
        <span class="material-symbols-outlined text-6xl mb-4">notifications_off</span>
        <p class="font-bold uppercase tracking-widest text-xs">Belum ada notifikasi baru.</p>
      </div>
    `;
  } else {
    container.innerHTML = unreadArticles.map(item => {
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
        <div id="notif-item-${item.id}" 
             class="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-primary/50 transition-all duration-300 cursor-pointer group shadow-sm"
             onclick="window.markNotifAsRead('${item.id}', '${item.link_website}')">
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
  }
};
