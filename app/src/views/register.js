import { supabase, fetchBrandName } from '../supabase.js';

export async function renderRegister(container) {
  const brandName = await fetchBrandName();
  let latitude = null;
  let longitude = null;
  let isLoginMode = false;

  function setUI() {
    container.innerHTML = `
      <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <span class="material-symbols-outlined text-4xl">${isLoginMode ? 'login' : 'person_add'}</span>
          </div>
          <h2 class="headline text-3xl font-black text-slate-800 tracking-tight">
            ${isLoginMode ? 'Masuk Akun' : 'Daftar Member'}
          </h2>
          <p class="mt-2 text-sm text-slate-500 font-medium">${brandName} • Ubah Sampah Jadi Berkah</p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-white py-8 px-8 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] border border-slate-100">
            <form id="register-form" class="space-y-6">
              <!-- Full Name (Only for Registration) -->
              <div id="field-name" class="${isLoginMode ? 'hidden' : ''}">
                <label for="full_name" class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap</label>
                <input id="full_name" name="full_name" type="text" ${isLoginMode ? '' : 'required'} 
                  class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300" 
                  placeholder="Contoh: Budi Santoso">
              </div>

              <!-- WhatsApp (Essential for both) -->
              <div>
                <label for="whatsapp" class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nomor WhatsApp</label>
                <div class="relative">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">+62</span>
                  <input id="whatsapp" name="whatsapp" type="tel" required 
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 text-slate-800 font-bold focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300" 
                    placeholder="8123456789">
                </div>
                <p class="mt-2 text-[10px] text-slate-400 font-medium">*Nomor ini adalah ID akses akun Anda.</p>
              </div>

              <!-- Address & Location (Only for Registration) -->
              <div id="field-address-container" class="${isLoginMode ? 'hidden' : 'space-y-6'}">
                <div>
                  <label for="address" class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Alamat Penjemputan</label>
                  <textarea id="address" name="address" rows="3" ${isLoginMode ? '' : 'required'}
                    class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300"
                    placeholder="Nama jalan, nomor rumah, RT/RW..."></textarea>
                </div>

                <div class="pt-2">
                  <button type="button" id="get-location-btn" 
                    class="w-full bg-slate-50 text-slate-500 py-3 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all active:scale-[0.98]">
                    <span class="material-symbols-outlined text-xl">my_location</span>
                    <span class="text-xs font-bold uppercase tracking-widest" id="location-text">Gunakan Lokasi Saat Ini</span>
                  </button>
                </div>
              </div>

              <div id="register-error" class="hidden p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">error</span>
                  <span id="error-message"></span>
              </div>

              <button type="submit" id="submit-btn"
                class="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                <span id="submit-btn-text">${isLoginMode ? 'Masuk Sekarang' : 'Daftar Sekarang'}</span>
                <span class="material-symbols-outlined" id="submit-btn-icon">${isLoginMode ? 'login' : 'rocket_launch'}</span>
              </button>
            </form>

            <p class="mt-8 text-center text-xs text-slate-400 font-medium">
              ${isLoginMode ? 'Belum punya akun?' : 'Sudah punya akun?'} 
              <button id="toggle-mode-btn" class="text-primary font-bold hover:underline cursor-pointer ml-1 focus:outline-none">
                ${isLoginMode ? 'Daftar Gratis' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </div>
      </div>
    `;

    attachEvents();
  }

  function attachEvents() {
    const form = document.getElementById('register-form');
    const locationBtn = document.getElementById('get-location-btn');
    const toggleBtn = document.getElementById('toggle-mode-btn');
    const errorDiv = document.getElementById('register-error');
    const errorMsg = document.getElementById('error-message');
    const submitBtn = document.getElementById('submit-btn');

    // Handle Mode Toggle
    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        setUI();
    });

    // Handle Geolocation
    locationBtn?.addEventListener('click', () => {
      const textSpan = document.getElementById('location-text');
      textSpan.textContent = 'MENCARI LOKASI...';
      locationBtn.disabled = true;

      if (!navigator.geolocation) {
        yariAlert('Oops!', 'Browser Anda tidak mendukung geolokasi.', 'warning');
        textSpan.textContent = 'Gunakan Lokasi Saat Ini';
        locationBtn.disabled = false;
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          textSpan.textContent = 'LOKASI TERDETEKSI ✓';
          locationBtn.classList.remove('text-slate-500', 'bg-slate-50');
          locationBtn.classList.add('text-primary', 'bg-emerald-50', 'border-primary/20');
          locationBtn.disabled = false;
        },
        (error) => {
          console.error(error);
          yariAlert('Oops!', 'Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.', 'warning');
          textSpan.textContent = 'Gunakan Lokasi Saat Ini';
          locationBtn.disabled = false;
        }
      );
    });

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorDiv.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">autorenew</span> MEMPROSES...';

      const formData = new FormData(form);
      const fullName = formData.get('full_name');
      const waRaw = formData.get('whatsapp');
      const address = formData.get('address');
      
      // Clean WA number (ensure it starts with 62)
      const whatsapp = '62' + waRaw.replace(/\D/g, '').replace(/^62/, '').replace(/^0/, '');

      try {
        // 1. Check if user already exists
        const { data: existingUser } = await supabase
          .from('yari_users')
          .select('id')
          .eq('whatsapp', whatsapp)
          .maybeSingle();

        if (existingUser) {
          // Success: Auto-login
          localStorage.setItem('yari_user_id', existingUser.id);
          window.USER_ID = existingUser.id;
          window.location.hash = '#/home';
          return;
        }

        // If in login mode but user not found
        if (isLoginMode) {
            throw new Error('Nomor WhatsApp belum terdaftar. Silakan daftar terlebih dahulu.');
        }

        // 2. Registration Logic (If not login mode)
        const { data: newUser, error: insertError } = await supabase
          .from('yari_users')
          .insert([{
            full_name: fullName,
            whatsapp: whatsapp,
            address: address,
            latitude: latitude,
            longitude: longitude,
            tier: 'Silver',
            saldo: 0,
            total_contribution_kg: 0,
            total_withdrawn: 0
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Success: Auto-login after registration
        localStorage.setItem('yari_user_id', newUser.id);
        window.USER_ID = newUser.id;
        
        if (window.showInstallPromotion) {
          window.showInstallPromotion();
        }

        window.location.hash = '#/home';

      } catch (err) {
        console.error(err);
        errorMsg.textContent = err.message || 'Terjadi kesalahan.';
        errorDiv.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>${isLoginMode ? 'Masuk Sekarang' : 'Daftar Sekarang'}</span><span class="material-symbols-outlined">${isLoginMode ? 'login' : 'rocket_launch'}</span>`;
      }
    });
  }

  // Initial render
  setUI();
}
