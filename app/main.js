import './style.css';
import { supabase } from './src/supabase.js';
import { renderHome } from './src/views/home.js';
import { renderBeli } from './src/views/beli.js';
import { renderLayanan } from './src/views/layanan.js';
import { renderProfile } from './src/views/profile.js';

// Simple Router
const routes = {
  '/': renderHome,
  '/jual': renderBeli,
  '/layanan': renderLayanan,
  '/profile': renderProfile,
};

async function router() {
  const path = window.location.hash.slice(1) || '/';
  const appDiv = document.getElementById('app');
  
  const renderFunc = routes[path] || renderHome;
  await renderFunc(appDiv);
}

// Global user ID for demo purposes
// In a real app, this comes from Supabase Auth
window.USER_ID = '11111111-1111-1111-1111-111111111111';

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
