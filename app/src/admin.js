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
import { renderAdminLayanan } from './views/admin_layanan.js';
import { renderAdminCompany } from './views/admin_company.js';
import { renderAdminOnboarding } from './views/admin_onboarding.js';

// Simple Router for Admin Pages
const adminRoutes = {
  '/': renderAdminDashboard,
  '/login': renderAdminLogin,
  '/catalog': renderAdminCatalog,
  '/transactions': renderAdminTransactions,
  '/artikel': renderAdminArtikel,
  '/laporan': renderAdminReports,
  '/member': renderAdminMember,
  '/services': renderAdminLayanan,
  '/company': renderAdminCompany,
  '/onboarding': renderAdminOnboarding,
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

// Mobile Toggle State Handler
window.toggleAdminSidebar = () => {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isHidden = sidebar.classList.contains('-translate-x-full');
    
    if (isHidden) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
};

// Sidebar Navigation Component
export function getAdminSidebar(currentPath) {
  const menuItems = [
    { path: '/', label: 'Dasbor', icon: 'dashboard' },
    { path: '/laporan', label: 'Laporan', icon: 'analytics' },
    { path: '/member', label: 'Member', icon: 'group' },
    { path: '/transactions', label: 'Transaksi', icon: 'receipt_long' },
    { path: '/catalog', label: 'Katalog', icon: 'inventory_2' },
    { path: '/services', label: 'Layanan', icon: 'category' },
    { path: '/artikel', label: 'Artikel', icon: 'article' },
    { path: '/company', label: 'Profil Perusahaan', icon: 'business' },
    { path: '/onboarding', label: 'Onboarding', icon: 'auto_awesome' },
  ];

  return `
    <!-- Mobile Header -->
    <div class="lg:hidden fixed top-0 w-full bg-white border-b border-slate-100 z-[60] flex items-center justify-between px-6 py-4 shadow-sm backdrop-blur-md bg-white/80">
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl font-fill">shield_person</span>
            <h1 class="headline font-black text-lg text-slate-800 tracking-tight">Admin<span class="text-primary">Panel</span></h1>
        </div>
        <button onclick="window.toggleAdminSidebar()" class="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600 hover:text-primary transition-colors cursor-pointer">
            <span class="material-symbols-outlined">menu</span>
        </button>
    </div>

    <!-- Sidebar Backdrop for Mobile -->
    <div id="sidebar-overlay" onclick="window.toggleAdminSidebar()" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] hidden lg:hidden transition-all duration-300"></div>

    <!-- Main Sidebar -->
    <aside id="admin-sidebar" class="fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-white border-r border-slate-100 z-[80] transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-out shadow-2xl lg:shadow-none flex flex-col pt-6 pb-8 overflow-hidden">
        
        <!-- Branding Desktop -->
        <div class="px-8 mb-10 hidden lg:flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <span class="material-symbols-outlined font-fill text-2xl">shield_person</span>
            </div>
            <div>
                <h1 class="headline font-black text-xl text-slate-800 tracking-tight leading-none mb-0.5 uppercase">Admin<span class="text-primary">Panel</span></h1>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Management Suite</p>
            </div>
        </div>

        <!-- Scrollable Nav Section -->
        <nav class="flex-grow px-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
            ${menuItems.map(item => `
                <a href="#${item.path}" 
                   onclick="if(window.innerWidth < 1024) window.toggleAdminSidebar()"
                   class="flex items-center gap-4 transition-all px-4 py-3.5 rounded-2xl group ${currentPath === item.path ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'}">
                    <span class="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${currentPath === item.path ? 'font-fill rotate-3' : ''}">${item.icon}</span>
                    <span class="text-sm tracking-tight">${item.label}</span>
                </a>
            `).join('')}
        </nav>

        <!-- Footer / Logout -->
        <div class="px-4 mt-8 pt-6 border-t border-slate-50 group">
            <button onclick="window.logoutAdmin()" 
                    class="w-full flex items-center gap-4 transition-all px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold cursor-pointer hover:shadow-inner">
                <span class="material-symbols-outlined text-[22px] group-hover:-translate-x-1 transition-transform">logout</span>
                <span class="text-sm">Keluar Panel</span>
            </button>
            <div class="mt-6 px-4 py-4 bg-slate-50 rounded-3xl">
                 <div class="flex items-center gap-3">
                     <div class="w-8 h-8 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center font-black text-[10px] text-primary uppercase shadow-sm">AD</div>
                     <div class="flex-1 min-w-0">
                         <p class="text-[10px] text-slate-400 font-black uppercase tracking-wider leading-none mb-1">Authenticated as</p>
                         <p class="text-xs font-bold text-slate-700 truncate">Administrator</p>
                     </div>
                 </div>
            </div>
        </div>
    </aside>
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
