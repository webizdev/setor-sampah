import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

export async function renderAdminCompany(container, currentPath) {
    async function loadView() {
        const { data: profile, error } = await supabase
            .from('yari_company_profile')
            .select('*')
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows'
            console.error("Error loading profile", error);
        }

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 max-w-4xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Profil <span class="text-primary">Perusahaan</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Identitas utama dan informasi kontak sistem YARI.</p>
                        </div>
                    </header>

                    <!-- Profile Form Card -->
                    <div class="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 md:p-14 max-w-4xl mx-auto relative overflow-hidden group/card transition-all hover:shadow-2xl hover:shadow-slate-200/80">
                        
                        <!-- Decorative background icon -->
                        <div class="absolute right-[-40px] top-[-40px] opacity-[0.03] pointer-events-none rotate-12 transition-transform group-hover/card:scale-110 duration-700">
                             <span class="material-symbols-outlined text-[300px]">business</span>
                        </div>

                        <form id="company-form" class="space-y-10 relative z-10">
                            <input type="hidden" id="form-id" value="${profile?.id || ''}">
                            
                            <div class="grid grid-cols-1 gap-10">
                                <!-- Logo Section -->
                                <div class="group bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200 hover:border-primary/30 transition-all text-center relative overflow-hidden group/logo">
                                    <label class="flex flex-col items-center cursor-pointer">
                                        <div id="logo-preview" class="w-24 h-24 rounded-2xl bg-white shadow-lg mb-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover/logo:scale-110 transition-transform duration-500">
                                            ${profile?.logo_url 
                                                ? `<img src="${profile.logo_url}" class="w-full h-full object-cover">` 
                                                : `<span class="material-symbols-outlined text-4xl text-slate-300 font-variation-settings-fill">add_photo_alternate</span>`
                                            }
                                        </div>
                                        <h4 class="font-black text-slate-800 text-sm uppercase tracking-widest">Logo <span class="text-primary">Aplikasi</span></h4>
                                        <p class="text-[10px] text-slate-400 mt-2 font-medium">Klik untuk ganti (Rekomendasi: 512x512px)</p>
                                        <input type="file" id="form-logo" class="hidden" accept="image/*">
                                    </label>
                                </div>

                                <!-- Company Name -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm font-bold">domain</span> Nama Entitas Bisnis
                                    </label>
                                    <input id="form-nama" required value="${profile?.nama || ''}"
                                           class="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] px-8 py-5.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xl shadow-inner placeholder:text-slate-300" 
                                           placeholder="e.g. Setor Sampah Indonesia">
                                </div>
                                
                                <!-- Address -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm font-bold">location_on</span> Alamat Operasional
                                    </label>
                                    <textarea id="form-alamat" rows="4" required
                                              class="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] px-8 py-5.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner leading-relaxed placeholder:text-slate-300" 
                                              placeholder="Jl. Merdeka No. 123, Jakarta Selatan...">${profile?.alamat || ''}</textarea>
                                </div>

                                <!-- WhatsApp Number -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm font-bold">chat</span> WhatsApp Customer Service (CS)
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">+</span>
                                        <input type="number" id="form-whatsapp" required value="${profile?.whatsapp || ''}"
                                               class="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] pl-14 pr-8 py-5.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xl shadow-inner placeholder:text-slate-300" 
                                               placeholder="628123456789">
                                    </div>
                                    <p class="mt-4 text-[11px] text-slate-400 ml-2 font-medium opacity-60">Nomor ini menjadi basis rujukan semua tombol "Hubungi Kami" & CTA di aplikasi client.</p>
                                </div>

                                <!-- Tier Thresholds Section -->
                                <div class="pt-8 border-t border-slate-100">
                                    <div class="mb-8">
                                        <h3 class="text-xl font-black headline tracking-tight uppercase">Konfigurasi <span class="text-primary">Hierarchy Tier</span></h3>
                                        <p class="text-[11px] text-slate-400 mt-1 font-medium opacity-70 uppercase tracking-widest">Atur persentase kontribusi minimal untuk setiap level keanggotaan.</p>
                                    </div>

                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <!-- Prioritas -->
                                        <div class="group">
                                            <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                                <span class="material-symbols-outlined text-sm font-bold">military_tech</span> Prioritas (%)
                                            </label>
                                            <input type="number" id="form-tier-prioritas" required step="0.1" value="${profile?.tier_prioritas_threshold ?? 60}"
                                                   class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner">
                                        </div>

                                        <!-- Gold -->
                                        <div class="group">
                                            <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                                <span class="material-symbols-outlined text-sm font-bold">workspace_premium</span> Gold (%)
                                            </label>
                                            <input type="number" id="form-tier-gold" required step="0.1" value="${profile?.tier_gold_threshold ?? 30}"
                                                   class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner">
                                        </div>

                                        <!-- Silver -->
                                        <div class="group">
                                            <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-2 group-focus-within:text-primary transition-colors">
                                                <span class="material-symbols-outlined text-sm font-bold">verified</span> Silver (%)
                                            </label>
                                            <input type="number" id="form-tier-silver" required step="0.1" value="${profile?.tier_silver_threshold ?? 20}"
                                                   class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner">
                                        </div>
                                    </div>
                                    <p class="mt-6 text-[10px] text-amber-600 bg-amber-50 p-4 rounded-2xl font-bold flex items-start gap-3">
                                        <span class="material-symbols-outlined text-sm">warning</span>
                                        <span>REKOMENDASI: Urutkan nilai dari yang tertinggi ke terendah (Prioritas > Gold > Silver). Angka di bawah ambang batas Silver otomatis menjadi BRONZE.</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div class="pt-6">
                                <button type="submit" id="save-btn" 
                                        class="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] cursor-pointer text-base flex items-center justify-center gap-4 group uppercase tracking-[0.3em] hover:-translate-y-1">
                                    <span class="material-symbols-outlined group-hover:rotate-12 transition-transform text-2xl">verified</span>
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                            <!-- Advanced Policy -->
                            <div class="col-span-2 pt-6 border-t border-slate-100 mt-4">
                                <div class="flex items-center gap-3 mb-6">
                                    <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <span class="material-symbols-outlined text-xl">security</span>
                                    </div>
                                    <h5 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Otorisasi Tingkat Lanjut</h5>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-primary transition-colors">Password Reset Sistem (Hard Reset)</label>
                                        <input type="password" id="form-reset-password" value="${profile?.reset_password || 'asiana'}" placeholder="Masukkan password untuk reset total" 
                                               class="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary/30 focus:bg-white transition-all outline-none" />
                                        <p class="mt-2 ml-1 text-[9px] text-slate-400 font-medium">Password ini diperlukan untuk menjalankan fitur penghapusan data masal di Danger Zone.</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <!-- Additional Info Cards -->
                    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                         <div class="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex gap-6 group transition-all hover:bg-primary/10">
                              <span class="material-symbols-outlined text-primary text-4xl font-fill opacity-20 group-hover:opacity-100 transition-opacity">info</span>
                              <div>
                                   <h4 class="font-black text-slate-800 mb-2 uppercase tracking-widest text-xs">Sinkronisasi Realtime</h4>
                                   <p class="text-sm text-slate-500 leading-relaxed font-medium opacity-70">Pembaruan data akan langsung terefleksi pada UI aplikasi user tanpa perlu deployment ulang.</p>
                              </div>
                         </div>
                         <div class="bg-amber-50 border border-amber-100 rounded-[2.5rem] p-8 flex gap-6 group transition-all hover:bg-amber-100/50">
                              <span class="material-symbols-outlined text-amber-500 text-4xl font-fill opacity-20 group-hover:opacity-100 transition-opacity">warning</span>
                              <div>
                                   <h4 class="font-black text-slate-800 mb-2 uppercase tracking-widest text-xs">Validasi WhatsApp</h4>
                                   <p class="text-sm text-slate-500 leading-relaxed font-medium opacity-70">Gunakan prefix internasional (62) tanpa karakter khusus agar tautan WhatsApp tetap fungsional.</p>
                              </div>
                         </div>
                    </div>

                    <!-- Danger Zone Section -->
                    <div class="mt-16 pt-12 border-t-2 border-dashed border-red-100 max-w-4xl mx-auto pb-12">
                        <div class="mb-8">
                            <h3 class="text-xl font-black headline tracking-tight uppercase text-red-600 flex items-center gap-3">
                                <span class="material-symbols-outlined font-variation-settings-fill">emergency_home</span>
                                Danger <span class="text-slate-400">Zone</span>
                            </h3>
                            <p class="text-[11px] text-slate-400 mt-1 font-medium opacity-70 uppercase tracking-widest">Gunakan dengan sangat hati-hati. Tindakan di bawah ini tidak dapat dibatalkan.</p>
                        </div>

                        <div class="bg-red-50/50 border border-red-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center md:justify-between gap-8 group hover:bg-red-50 transition-all">
                            <div class="flex gap-6 items-center md:items-start text-center md:text-left">
                                <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <span class="material-symbols-outlined text-4xl">restart_alt</span>
                                </div>
                                <div>
                                    <h4 class="font-black text-slate-800 mb-2 uppercase tracking-widest text-sm">Reset Total Kapasitas & Saldo</h4>
                                    <p class="text-xs text-slate-500 leading-relaxed font-medium opacity-70 max-w-md">Menghapus SELURUH riwayat supply, penjualan, dan setoran member. <b>Dibutuhkan password otorisasi untuk melanjutkan.</b></p>
                                </div>
                            </div>
                            <button onclick="window.clearInventoryLogs()" 
                                    class="w-full md:w-auto px-10 py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 cursor-pointer text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                                <span class="material-symbols-outlined text-lg">dangerous</span>
                                <span>RESET TOTAL SISTEM</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;

        // Preview Listener
        const logoInput = document.getElementById('form-logo');
        const logoPreview = document.getElementById('logo-preview');
        logoInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    logoPreview.innerHTML = `<img src="${re.target.result}" class="w-full h-full object-cover">`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Form Submit Handler
        const form = document.getElementById('company-form');
        if(form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('save-btn');
                const originalContent = btn.innerHTML;
                
                btn.innerHTML = `<span class="material-symbols-outlined animate-spin">autorenew</span> <span>MENYIMPAN...</span>`;
                btn.disabled = true;
                btn.classList.add('opacity-50');

                const id = document.getElementById('form-id').value;

                try {
                    let logoUrl = profile?.logo_url || '';
                    
                    // Handle Logo Upload
                    const logoFile = logoInput.files[0];
                    if (logoFile) {
                        const fileExt = logoFile.name.split('.').pop();
                        const fileName = `logo-${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const filePath = `branding/${fileName}`;

                        const { error: uploadError } = await supabase.storage
                            .from('yari_assets')
                            .upload(filePath, logoFile);

                        if (uploadError) throw uploadError;

                        const { data: { publicUrl } } = supabase.storage
                            .from('yari_assets')
                            .getPublicUrl(filePath);
                            
                        logoUrl = publicUrl;
                    }

                    const payload = {
                        nama: document.getElementById('form-nama').value,
                        alamat: document.getElementById('form-alamat').value,
                        whatsapp: document.getElementById('form-whatsapp').value,
                        tier_prioritas_threshold: document.getElementById('form-tier-prioritas').value,
                        tier_gold_threshold: document.getElementById('form-tier-gold').value,
                        tier_silver_threshold: document.getElementById('form-tier-silver').value,
                        reset_password: document.getElementById('form-reset-password').value,
                        logo_url: logoUrl
                    };

                    let res;
                    if (id) {
                        res = await supabase.from('yari_company_profile').update(payload).eq('id', id);
                    } else {
                        res = await supabase.from('yari_company_profile').insert(payload);
                    }
                    
                    if(res.error) throw res.error;

                    // Show success state
                    btn.classList.replace('bg-slate-900', 'bg-green-600');
                    btn.classList.remove('opacity-50');
                    btn.innerHTML = `<span class="material-symbols-outlined">done_all</span> <span>BERHASIL DISIMPAN</span>`;
                    
                    setTimeout(() => {
                        btn.classList.replace('bg-green-600', 'bg-slate-900');
                        btn.innerHTML = originalContent;
                        btn.disabled = false;
                        loadView(); // Refresh to catch ID if new
                    }, 2000);

                } catch (err) {
                    console.error(err);
                    yariAlert('Gagal', "Gagal memperbarui profil: " + err.message, 'error');
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                }
            });
        }

        // Global Reset Action
        window.clearInventoryLogs = async () => {
            const firstConfirm = await yariConfirm(
                'Konfirmasi Reset Total',
                'Tindakan ini akan menghapus SELURUH riwayat inventaris dan setoran member. Lanjutkan?'
            );

            if (!firstConfirm) return;

            const secondConfirm = await yariConfirm(
                'PERINGATAN AKHIR',
                'Seluruh SALDO user akan otomatis menjadi Rp 0. Apakah Anda benar-benar yakin ingin melakukan reset total sistem?'
            );

            if (secondConfirm) {
                // Add a small delay to ensure modals don't collide
                await new Promise(r => setTimeout(r, 400));
                
                const password = await yariPrompt(
                    'Otorisasi Reset',
                    'Masukkan password hard reset untuk mengonfirmasi pembersihan total sistem. Data yang dihapus TIDAK DAPAT dikembalikan.',
                    'Password...',
                    true
                );

                if (!password) return;

                const currentPassword = profile?.reset_password || 'asiana';
                if (password !== currentPassword) {
                    await new Promise(r => setTimeout(r, 100));
                    yariAlert('Otorisasi Gagal', 'Password yang Anda masukkan salah.', 'error');
                    return;
                }

                try {
                    // 1. Clear Inventory Logs (Manual supply/out)
                    const { error: err1 } = await supabase
                        .from('yari_inventory_log')
                        .delete()
                        .neq('id', '00000000-0000-0000-0000-000000000000');

                    if (err1) throw err1;

                    // 2. Clear Member Transactions
                    const { error: err2 } = await supabase
                        .from('yari_transactions')
                        .delete()
                        .neq('id', '00000000-0000-0000-0000-000000000000');
                    
                    if (err2) throw err2;

                    // 3. Reset All Users (Balance & Contribution)
                    const { error: err3 } = await supabase
                        .from('yari_users')
                        .update({
                            saldo: 0,
                            total_contribution_kg: 0,
                            tier: 'Bronze'
                        })
                        .neq('id', '00000000-0000-0000-0000-000000000000');
                    
                    if (err3) throw err3;

                    yariAlert('Reset Berhasil', 'Sistem telah dibersihkan secara total. Semua kuantitas dan saldo kembali ke 0.', 'success');
                    loadView();
                } catch (err) {
                    console.error("Error resetting system", err);
                    yariAlert('Gagal', 'Terjadi kesalahan saat reset sistem: ' + err.message, 'error');
                }
            }
        };
    }

    await loadView();
}
