import './style.css';
import { supabase } from './src/supabase.js';
import { renderHome } from './src/views/home.js';
import { renderBeli } from './src/views/beli.js';
import { renderLayanan } from './src/views/layanan.js';
import { renderProfile } from './src/views/profile.js';
import { renderOnboarding } from './src/views/onboarding.js';
import { renderRegister } from './src/views/register.js';
import './src/utils/pwa.js'; // Ensure PWA listener is active
import { initDynamicBranding } from './src/utils/branding.js';

// Init Branding (Logo, Favicon, naming)
initDynamicBranding();

// Global Session Check
window.USER_ID = localStorage.getItem('yari_user_id') || null;

// Simple Router
const routes = {
  '/': renderOnboarding,
  '/register': renderRegister,
  '/home': renderHome,
  '/jual': renderBeli,
  '/layanan': renderLayanan,
  '/profile': renderProfile,
};

async function router() {
  const path = window.location.hash.slice(1) || '/';
  const appDiv = document.getElementById('app');
  
  // Update Global ID from Storage (in case of updates)
  window.USER_ID = localStorage.getItem('yari_user_id') || null;

  // Protected Routes Logic (Simple)
  const protectedRoutes = ['/home', '/jual', '/layanan', '/profile'];
  if (protectedRoutes.includes(path) && !window.USER_ID) {
    window.location.hash = '#/register';
    return;
  }

  const renderFunc = routes[path] || renderOnboarding;
  
  // Show skeleton screen while loading
  appDiv.innerHTML = `
    <div class="flex flex-col min-h-screen bg-slate-50 animate-pulse">
      <div class="h-16 bg-white border-b border-slate-100 w-full"></div>
      <div class="flex-1 p-6 space-y-4 max-w-lg mx-auto w-full pt-8">
        <div class="h-32 bg-slate-200 rounded-3xl w-full"></div>
        <div class="h-5 bg-slate-200 rounded-full w-3/4"></div>
        <div class="h-4 bg-slate-100 rounded-full w-1/2"></div>
        <div class="grid grid-cols-2 gap-4 pt-2">
          <div class="h-24 bg-slate-200 rounded-2xl"></div>
          <div class="h-24 bg-slate-200 rounded-2xl"></div>
          <div class="h-24 bg-slate-100 rounded-2xl"></div>
          <div class="h-24 bg-slate-100 rounded-2xl"></div>
        </div>
        <div class="h-12 bg-slate-200 rounded-2xl w-full mt-4"></div>
      </div>
    </div>
  `;
  await renderFunc(appDiv);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
