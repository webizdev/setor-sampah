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
  
  // Show screen
  appDiv.innerHTML = '<div class="flex items-center justify-center min-h-screen"><span class="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span></div>';
  await renderFunc(appDiv);
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
