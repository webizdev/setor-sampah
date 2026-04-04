import { supabase } from '../supabase.js';
import { getBottomNav } from './home.js';

export async function renderProfile(container) {
  // Fetch user data
  async function loadData() {
    const { data: user } = await supabase
      .from('yari_users')
      .select('*')
      .eq('id', window.USER_ID)
      .single();

    const { data: pendingTxs } = await supabase
      .from('yari_transactions')
      .select('total_price')
      .eq('user_id', window.USER_ID)
      .eq('status', 'pending');

    return { user, pendingTxs };
  }

  let { user, pendingTxs } = await loadData();
  let leafletMap = null;

  function render() {
    const pendingSaldo = (pendingTxs || []).reduce((acc, tx) => acc + parseFloat(tx.total_price || 0), 0);
    const saldo = user?.saldo || 0;
    const name = user?.full_name || 'User';
    const avatar = user?.avatar_url || 'https://via.placeholder.com/150';
    const bank = user?.bank_name || '-';
    const req = user?.bank_account || '-';
    const wa = user?.whatsapp || '-';
    const address = user?.address || '-';
    const org = user?.organization || '-';
    const lat = user?.latitude;
    const lng = user?.longitude;

    const html = `
      <!-- Top App Bar -->
      <header class="fixed top-0 w-full z-[60] bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50">
        <div class="flex justify-between items-center px-6 py-4 w-full">
          <button class="material-symbols-outlined text-[#0f5238] dark:text-[#f3f4f5] hover:bg-emerald-100/30 p-2 rounded-full transition-all">menu</button>
          <h1 class="headline tracking-tight font-black text-lg text-[#0f5238] dark:text-[#f3f4f5]">Setor Sampah</h1>
          <button id="open-settings-btn" onclick="window.openSettings()" class="material-symbols-outlined text-[#0f5238]/60 dark:text-[#f3f4f5]/60 hover:text-primary transition-colors p-2">settings</button>
        </div>
      </header>

      <main class="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <!-- Profile Header Section -->
        <section class="flex flex-col items-center text-center space-y-6">
          <div class="relative group">
            <div class="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-2xl relative">
              <img id="profile-avatar-display" alt="User Profile" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="${avatar}">
              <div id="avatar-loading" class="absolute inset-0 bg-black/40 flex items-center justify-center hidden">
                <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <button onclick="document.getElementById('avatar-input').click()" class="absolute bottom-1 right-1 bg-primary text-white p-2.5 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10">
              <span class="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
            <input type="file" id="avatar-input" accept="image/*" class="hidden">
          </div>
          
          <div class="space-y-1">
            <h2 class="text-3xl font-black headline tracking-tight text-slate-800">${name}</h2>
            <div class="flex items-center justify-center gap-2 text-slate-500 font-bold text-sm">
              <span class="material-symbols-outlined text-sm">corporate_fare</span>
              <span>${org}</span>
            </div>
          </div>

          <!-- Action Cluster -->
          <div class="flex gap-4 w-full">
            <button onclick="window.shareApp()" class="flex-1 bg-gradient-to-br from-[#0f5238] to-[#1b4332] text-white py-4 px-6 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 active:scale-95 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all border border-emerald-800/20">
              <span class="material-symbols-outlined">share</span>
              Bagikan Aplikasi
            </button>
          </div>
        </section>

        <!-- Stats Bar -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-primary/20 group">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Saldo Pending</p>
            <p class="text-2xl font-black text-orange-500">Rp ${pendingSaldo.toLocaleString('id-ID')}</p>
          </div>
          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:border-primary/20 group">
            <p class="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Saldo Utama</p>
            <p class="text-2xl font-black text-primary">Rp ${saldo.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <!-- Information Sections -->
        <div class="space-y-4">
          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Informasi Pembayaran</h3>
            
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span class="material-symbols-outlined">account_balance</span>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Bank Kami</p>
                  <p class="font-bold text-slate-700">${bank}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span class="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nomor Rekening</p>
                  <p class="font-bold text-slate-700">${req}</p>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <span class="material-symbols-outlined">phone_iphone</span>
                </div>
                <div>
                  <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WhatsApp Contact</p>
                  <p class="font-bold text-slate-700">${wa}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Alamat Penjemputan</h3>
              ${lat ? `
                <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
                  <span class="material-symbols-outlined text-xs">directions</span> Petunjuk Jalan
                </a>
              ` : ''}
            </div>
            <div class="flex flex-col gap-4">
              <!-- Mini Map Preview -->
              <div id="mini-map" class="w-full h-32 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 relative group cursor-pointer" onclick="window.openMap(true)">
                ${!lat ? `
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <span class="material-symbols-outlined text-3xl">map</span>
                    <p class="text-[10px] font-black uppercase tracking-widest">Titik Map Belum Diset</p>
                  </div>
                ` : ''}
                <div class="absolute top-2 right-2 z-[10] bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="material-symbols-outlined text-sm text-primary">zoom_in</span>
                </div>
              </div>

              <div class="flex gap-4 items-start">
                <div class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <span class="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div class="space-y-1 pt-1 flex-grow">
                  <p class="font-bold text-slate-600 text-sm leading-relaxed">${address}</p>
                  ${lat ? `
                    <p class="text-[10px] text-slate-400 font-medium">Koordinat: ${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}</p>
                  ` : ''}
                </div>
              </div>

              <!-- Direct Action Button -->
              <button onclick="window.openMap(true)" class="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <span class="material-symbols-outlined text-sm">map</span>
                ${lat ? 'Ubah Titik Map' : 'Pilih di Peta'}
              </button>
            </div>
          </div>
        </div>

        <div id="bottom-nav-container">
          ${getBottomNav('/profile')}
        </div>
      </main>

      <!-- Settings Modal -->
      <div id="settings-modal" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm hidden transition-all duration-300 opacity-0">
        <div class="bg-white w-full sm:max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative translate-y-full transition-transform duration-300">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-2xl font-black headline tracking-tight">Pengaturan Profil</h3>
            <button onclick="window.closeSettings()" class="material-symbols-outlined p-2 hover:bg-slate-100 rounded-full transition-colors">close</button>
          </div>

          <div class="max-h-[60vh] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</label>
              <input id="edit-name" type="text" value="${name}" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Organisasi/Perusahaan</label>
              <input id="edit-org" type="text" value="${org}" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nomor WhatsApp</label>
              <input id="edit-wa" type="text" value="${wa}" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            </div>

            <div class="space-y-2 border-t border-slate-100 pt-5">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Informasi Bank</label>
              <div class="grid grid-cols-1 gap-3">
                <input id="edit-bank" type="text" placeholder="Nama Bank" value="${bank}" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                <input id="edit-acc" type="text" placeholder="Nomor Rekening" value="${req}" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center ml-1">
                <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Penjemputan</label>
                <button onclick="window.openMap()" class="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
                  <span class="material-symbols-outlined text-xs">map</span> Pilih di Peta
                </button>
              </div>
              <textarea id="edit-address" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 outline-none transition-all rows-3" placeholder="Isi alamat detail...">${address}</textarea>
              <input type="hidden" id="edit-lat" value="${lat || ''}">
              <input type="hidden" id="edit-lng" value="${lng || ''}">
            </div>
          </div>

          <button id="save-settings" onclick="window.saveSettings()" class="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">save</span>
            Simpan Perubahan
          </button>
        </div>
      </div>

      <!-- Map Selection Modal -->
      <div id="map-modal" class="fixed inset-0 z-[110] bg-white hidden flex-col transition-all duration-500 opacity-0 text-slate-800">
        <header class="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100 flex-shrink-0 z-[111] shadow-sm">
          <div>
            <h4 class="text-lg font-black headline tracking-tight">Tandai Lokasi</h4>
            <div id="map-address-preview" class="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">Mendeteksi lokasi...</div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.closeMap()" class="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Batal</button>
            <button onclick="window.confirmLocation()" class="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-black hover:bg-[#0f5238] transition-colors shadow-lg shadow-primary/20">Pasang Pin</button>
          </div>
        </header>
        <div id="map-view" class="flex-grow w-full relative bg-slate-50">
          <!-- Loading State Overlay -->
          <div id="map-loading-overlay" class="absolute inset-0 z-[1050] bg-slate-50 flex flex-col items-center justify-center gap-4 transition-opacity duration-500">
            <div class="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Menyiapkan Peta...</p>
          </div>
          <!-- Crosshair Overlay -->
          <div class="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none mb-8">
            <div class="relative">
               <span class="material-symbols-outlined text-primary text-5xl drop-shadow-[0_8px_8px_rgba(0,0,0,0.2)]">location_on</span>
               <div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[2px]"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Handle Image Upload
    const avatarInput = document.getElementById('avatar-input');
    avatarInput?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const loader = document.getElementById('avatar-loading');
      loader?.classList.remove('hidden');

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${window.USER_ID}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('yari_assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('yari_assets')
          .getPublicUrl(filePath);

        // Update User table
        const { error: updateError } = await supabase
          .from('yari_users')
          .update({ avatar_url: publicUrl })
          .eq('id', window.USER_ID);

        if (updateError) throw updateError;

        // Update Preview
        document.getElementById('profile-avatar-display').src = publicUrl;
        user.avatar_url = publicUrl;
        alert('Foto profil berhasil diperbarui!');
      } catch (err) {
        console.error(err);
        alert('Gagal mengunggah foto: ' + err.message);
      } finally {
        loader?.classList.add('hidden');
      }
    });

    // Initialize Mini Map if coordinates exist
    if (lat && lng) {
      setTimeout(() => {
        const miniMapContainer = document.getElementById('mini-map');
        if (miniMapContainer && window.L) {
          const miniMap = L.map('mini-map', {
            center: [lat, lng],
            zoom: 16,
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false
          });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
          L.marker([lat, lng]).addTo(miniMap);
        }
      }, 300);
    }
  }

  // Global functions on window
  window.openSettings = () => {
    const modal = document.getElementById('settings-modal');
    const content = modal.querySelector('div');
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.add('opacity-100');
      content.classList.remove('translate-y-full');
    }, 10);
  };

  window.closeSettings = () => {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    const content = modal.querySelector('div');
    content.classList.add('translate-y-full');
    modal.classList.remove('opacity-100');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  };

  window.saveSettings = async () => {
    const btn = document.getElementById('save-settings');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
    btn.disabled = true;

    const data = {
      full_name: document.getElementById('edit-name').value,
      organization: document.getElementById('edit-org').value,
      whatsapp: document.getElementById('edit-wa').value,
      bank_name: document.getElementById('edit-bank').value,
      bank_account: document.getElementById('edit-acc').value,
      address: document.getElementById('edit-address.value'),
      latitude: document.getElementById('edit-lat').value ? parseFloat(document.getElementById('edit-lat').value) : null,
      longitude: document.getElementById('edit-lng').value ? parseFloat(document.getElementById('edit-lng').value) : null
    };

    // Fix for address value selector
    data.address = document.getElementById('edit-address').value;

    try {
      const { error } = await supabase
        .from('yari_users')
        .update(data)
        .eq('id', window.USER_ID);

      if (error) throw error;

      alert('Profil berhasil diperbarui!');
      window.closeSettings();
      
      // Update local state and re-render
      const newData = await loadData();
      user = newData.user;
      pendingTxs = newData.pendingTxs;
      render();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan: ' + err.message);
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };

  window.shareApp = async () => {
    const shareData = {
      title: 'Setor Sampah',
      text: 'Ayo bergabung dengan Setor Sampah untuk mengelola sampah jadi uang!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link aplikasi berhasil disalin ke clipboard!');
      }
    } catch (err) {
      console.log('Share error or cancelled', err);
    }
  };

  // MAP LOGIC
  window.DIRECT_MAP_SAVE = false;
  window.openMap = (direct = false) => {
    window.DIRECT_MAP_SAVE = direct;
    const modal = document.getElementById('map-modal');
    const loading = document.getElementById('map-loading-overlay');
    
    if (loading) loading.style.opacity = '1';
    modal.classList.remove('hidden');
    
    setTimeout(() => {
      modal.classList.add('opacity-100');
      initLeaflet();
      // Force immediate resize after transition starts
      if (leafletMap) {
        setTimeout(() => {
          leafletMap.invalidateSize();
          if (loading) loading.style.opacity = '0';
          setTimeout(() => loading?.classList.add('hidden'), 500);
        }, 600);
      }
    }, 50);
  };

  window.closeMap = () => {
    const modal = document.getElementById('map-modal');
    modal.classList.remove('opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
  };

  function initLeaflet() {
    if (leafletMap) {
        setTimeout(() => leafletMap.invalidateSize(), 300);
        return;
    }
    
    const currentLat = parseFloat(document.getElementById('edit-lat').value) || -6.200000;
    const currentLng = parseFloat(document.getElementById('edit-lng').value) || 106.816666;

    if (!window.L) {
        console.error("Leaflet library not loaded!");
        return;
    }

    leafletMap = L.map('map-view', {
      center: [currentLat, currentLng],
      zoom: 15,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(leafletMap);

    // Hide loader once map is initialized
    setTimeout(() => {
      const loading = document.getElementById('map-loading-overlay');
      if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.classList.add('hidden'), 500);
      }
    }, 1000);

    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    // Try to get actual location
    if (!document.getElementById('edit-lat').value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 17);
      });
    }

    leafletMap.on('move', () => {
      updateMapPreview();
    });
    updateMapPreview();
  }

  let geocodeTimeout = null;
  async function updateMapPreview() {
    if (!leafletMap) return;
    const center = leafletMap.getCenter();
    
    clearTimeout(geocodeTimeout);
    geocodeTimeout = setTimeout(async () => {
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
        const data = await resp.json();
        if (data.display_name) {
          document.getElementById('map-address-preview').innerText = data.display_name;
        }
      } catch (err) {}
    }, 500);
  }

  window.confirmLocation = async () => {
    if (!leafletMap) return;
    const center = leafletMap.getCenter();
    const addressPreview = document.getElementById('map-address-preview').innerText;

    if (window.DIRECT_MAP_SAVE) {
      const btn = document.querySelector('#map-modal button[onclick="window.confirmLocation()"]');
      const originalText = btn.innerText;
      btn.innerText = 'Menyimpan...';
      btn.disabled = true;

      try {
        const { error } = await supabase
          .from('yari_users')
          .update({
            latitude: center.lat,
            longitude: center.lng,
            address: (addressPreview && addressPreview !== 'Geser peta untuk memilih...') ? addressPreview : user.address
          })
          .eq('id', window.USER_ID);

        if (error) throw error;
        
        window.closeMap();
        // Refresh local state and re-render
        const newData = await loadData();
        user = newData.user;
        pendingTxs = newData.pendingTxs;
        render();
      } catch (err) {
        alert('Gagal menyimpan lokasi: ' + err.message);
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    } else {
      // Internal settings modal flow
      document.getElementById('edit-lat').value = center.lat;
      document.getElementById('edit-lng').value = center.lng;
      if (addressPreview && addressPreview !== 'Geser peta untuk memilih...') {
        document.getElementById('edit-address').value = addressPreview;
      }
      window.closeMap();
    }
  };

  render();
}
