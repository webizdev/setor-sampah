import { supabase } from '../supabase.js';
import { setAdminSession } from '../admin.js';

export async function renderAdminLogin(container) {
  const html = `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div class="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <div class="text-center mb-8">
                <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
                </div>
                <h1 class="headline text-2xl font-black text-on-surface tracking-tight">Super Admin</h1>
                <p class="text-on-surface-variant text-sm mt-1">Setor Sampah Management</p>
            </div>
            
            <form id="admin-login-form" class="space-y-6">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input id="email" type="email" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="admin@webiz.my.id">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                    <input id="password" type="password" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="••••••••">
                </div>
                
                <div id="login-error" class="hidden bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 font-medium text-center"></div>
                
                <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0f5238] transition-colors shadow-lg shadow-primary/20">
                    Masuk ke Dasbor
                    <span class="material-symbols-outlined text-sm">login</span>
                </button>
            </form>
        </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('login-error');
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">autorenew</span> Memproses...';
      submitBtn.disabled = true;
      errorDiv.classList.add('hidden');

      try {
          const { data, error } = await supabase
              .from('yari_admins')
              .select('*')
              .eq('email', email)
              .eq('password', password)
              .single();

          if (error || !data) {
              throw new Error('Email atau Password salah.');
          }

          // Success
          setAdminSession(data);
          window.location.hash = '#/';
          
      } catch (err) {
          errorDiv.textContent = err.message;
          errorDiv.classList.remove('hidden');
      } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
      }
  });
}
