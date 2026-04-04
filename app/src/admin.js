import '../style.css';
import { supabase } from './supabase.js';

// Import Admin Views
import { renderAdminLogin } from './views/admin_login.js';
import { renderAdminDashboard } from './views/admin_dashboard.js';
import { renderAdminCatalog } from './views/admin_catalog.js';
import { renderAdminTransactions } from './views/admin_transactions.js';
import { renderAdminArtikel } from './views/admin_artikel.js';
import { renderAdminReports } from './views/admin_reports.js';
import { renderAdminMember } from './views/admin_member.js';

// Simple Router for Admin Pages
const adminRoutes = {
  '/': renderAdminDashboard,
  '/login': renderAdminLogin,
  '/catalog': renderAdminCatalog,
  '/transactions': renderAdminTransactions,
  '/artikel': renderAdminArtikel,
  '/laporan': renderAdminReports,
  '/member': renderAdminMember,
};

// Check if admin is authenticated
export function getAdminSession() {
  const sessionString = localStorage.getItem('yari_admin_session');
  if (!sessionString) return null;
  try {
    return JSON.parse(sessionString);
  } catch(e) {
    return null;
  }
}

export function setAdminSession(adminData) {
  localStorage.setItem('yari_admin_session', JSON.stringify(adminData));
}

export function clearAdminSession() {
  localStorage.removeItem('yari_admin_session');
}

// Top App Bar Nav component for authenticated admin pages
export function getAdminTopNav(currentPath) {
  return `
    <header class="w-full bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:h-16 gap-3 py-3 md:py-0">
            <!-- Logo -->
            <div class="flex items-center gap-2 w-full md:w-auto justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined text-sm">shield_person</span>
                    </div>
                    <h1 class="headline font-black text-xl text-slate-800 tracking-tight">Admin<span class="text-primary">Panel</span></h1>
                </div>
            </div>

            <!-- Navigation Links -->
            <nav class="flex items-center gap-1 sm:gap-4 overflow-x-auto w-full md:w-auto scrollbar-hide">
                <a href="#/" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/' ? 'font-fill' : ''}">dashboard</span>
                    <span class="text-xs sm:text-sm">Dasbor</span>
                </a>
                <a href="#/laporan" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/laporan' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/laporan' ? 'font-fill' : ''}">analytics</span>
                    <span class="text-xs sm:text-sm">Laporan</span>
                </a>
                <a href="#/member" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/member' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/member' ? 'font-fill' : ''}">group</span>
                    <span class="text-xs sm:text-sm">Member</span>
                </a>
                <a href="#/transactions" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/transactions' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/transactions' ? 'font-fill' : ''}">receipt_long</span>
                    <span class="text-xs sm:text-sm">Transaksi</span>
                </a>
                <a href="#/catalog" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/catalog' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/catalog' ? 'font-fill' : ''}">inventory_2</span>
                    <span class="text-xs sm:text-sm">Katalog</span>
                </a>
                <a href="#/artikel" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg whitespace-nowrap ${currentPath === '/artikel' ? 'bg-primary/5 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[18px] ${currentPath === '/artikel' ? 'font-fill' : ''}">article</span>
                    <span class="text-xs sm:text-sm">Artikel</span>
                </a>
                <button onclick="window.logoutAdmin()" class="flex items-center gap-1.5 transition-colors px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 ml-auto md:ml-0 whitespace-nowrap font-medium cursor-pointer">
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                    <span class="text-xs sm:text-sm">Keluar</span>
                </button>
            </nav>
        </div>
    </header>
  `;
}

async function adminRouter() {
  const path = window.location.hash.slice(1) || '/';
  const appDiv = document.getElementById('admin-app');
  
  const session = getAdminSession();
  
  // Guard Clauses
  if (!session && path !== '/login') {
    window.location.hash = '#/login';
    return;
  }
  
  if (session && path === '/login') {
    window.location.hash = '#/';
    return;
  }

  const renderFunc = adminRoutes[path] || renderAdminDashboard;
  appDiv.innerHTML = '<div class="flex items-center justify-center min-h-screen text-primary"><span class="material-symbols-outlined animate-spin text-4xl">autorenew</span></div>';
  await renderFunc(appDiv, path);
}

// Global logout hook
window.logoutAdmin = () => {
    clearAdminSession();
    window.location.hash = '#/login';
};

window.addEventListener('hashchange', adminRouter);
window.addEventListener('load', adminRouter);
