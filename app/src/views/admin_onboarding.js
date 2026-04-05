import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

export async function renderAdminOnboarding(container, currentPath) {
    async function loadView() {
        const { data: content, error } = await supabase
            .from('yari_onboarding_content')
            .select('*')
            .order('section', { ascending: true });

        const isEmpty = !content || content.length === 0;

        const sortHero = (a, b) => {
            const order = ['hero_title', 'hero_subtitle', 'hero_image_1', 'hero_image_2', 'hero_image_3', 'hero_image_4', 'hero_image_5'];
            return order.indexOf(a.key) - order.indexOf(b.key);
        };

        const sortLayanan = (a, b) => {
            const order = [
                'layanan_title', 'layanan_desc', 
                'service_1_title', 'service_1_desc', 
                'service_2_title', 'service_2_desc', 
                'service_3_title', 'service_3_desc'
            ];
            return order.indexOf(a.key) - order.indexOf(b.key);
        };

        const sortFitur = (a, b) => {
            const order = [
                'fitur_title', 'fitur_subtitle', 
                'feature_1_title', 'feature_1_desc', 'feature_1_icon',
                'feature_2_title', 'feature_2_desc', 'feature_2_icon',
                'feature_3_title', 'feature_3_desc', 'feature_3_icon',
                'feature_4_title', 'feature_4_desc', 'feature_4_icon'
            ];
            return order.indexOf(a.key) - order.indexOf(b.key);
        };

        const sortFooter = (a, b) => {
            const order = ['footer_about', 'footer_fb', 'footer_ig', 'footer_tiktok'];
            return order.indexOf(a.key) - order.indexOf(b.key);
        };

        const sections = {
            hero: (content?.filter(c => c.section === 'hero') || []).sort(sortHero),
            layanan: (content?.filter(c => c.section === 'layanan') || []).sort(sortLayanan),
            fitur: (content?.filter(c => c.section === 'fitur') || []).sort(sortFitur),
            cta: content?.filter(c => c.section === 'cta') || [],
            footer: (content?.filter(c => c.section === 'footer') || []).sort(sortFooter)
        };

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 max-w-5xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Editor <span class="text-primary">Onboarding</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Kelola semua konten visual dan tekstual pada halaman Beranda utama.</p>
                        </div>
                        <button id="save-all-btn" class="bg-primary hover:bg-[#0f5238] transition-all text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 cursor-pointer hover:-translate-y-1 active:scale-95">
                            <span class="material-symbols-outlined text-[20px]">save</span>
                            <span>Simpan Semua Perubahan</span>
                        </button>
                    </header>

                    <div class="max-w-5xl mx-auto space-y-12">
                        ${isEmpty ? `
                            <div class="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
                                <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                                    <span class="material-symbols-outlined text-5xl">auto_awesome</span>
                                </div>
                                <h3 class="text-2xl font-black headline uppercase tracking-tight mb-4">Siap Memulai Editor Onboarding?</h3>
                                <p class="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
                                    Sepertinya database Anda masih kosong. Tekan tombol di bawah untuk mengisi data default dan mulai mengedit halaman depan Anda.
                                </p>
                                <button id="init-btn" class="bg-primary hover:bg-[#0f5238] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 mx-auto shadow-xl shadow-primary/20 transition-all active:scale-95">
                                    <span class="material-symbols-outlined">rocket_launch</span>
                                    <span>Inisialisasi Data Sekarang</span>
                                </button>
                            </div>
                        ` : `
                            ${renderSection('Hero Section', 'rocket_launch', sections.hero)}
                            ${renderSection('Layanan Section', 'category', sections.layanan)}
                            ${renderSection('Fitur Section', 'auto_awesome', sections.fitur)}
                            ${renderSection('CTA Section', 'campaign', sections.cta)}
                            ${renderSection('Footer Section', 'info', sections.footer)}
                        `}
                    </div>
                </main>
            </div>

            <!-- Hidden File Input for Uploads -->
            <input type="file" id="global-uploader" class="hidden" accept="image/*">
        `;

        container.innerHTML = html;
        bindEvents();
    }

    function renderSection(title, icon, items) {
        if (items.length === 0) return '';
        return `
            <section class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 md:p-12 relative overflow-hidden group/section">
                <div class="absolute right-[-30px] top-[-30px] opacity-[0.02] pointer-events-none transition-transform group-hover/section:scale-110 duration-700">
                     <span class="material-symbols-outlined text-[200px]">${icon}</span>
                </div>
                
                <div class="flex items-center gap-4 mb-10 relative z-10">
                    <div class="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined font-fill text-2xl">${icon}</span>
                    </div>
                    <h3 class="text-2xl font-black headline tracking-tight uppercase">${title}</h3>
                </div>

                <div class="grid grid-cols-1 gap-8 relative z-10">
                    ${items.map(item => renderField(item)).join('')}
                </div>
            </section>
        `;
    }

    function renderField(item) {
        const isImage = item.type === 'image_url';
        const isTextarea = item.type === 'textarea';

        return `
            <div class="group field-group" data-key="${item.key}">
                <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">
                    ${item.label}
                </label>
                
                ${isImage ? `
                    <div class="flex flex-col md:flex-row gap-6 items-start">
                        <div class="w-full md:w-48 aspect-video md:aspect-square rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50 shadow-inner group-hover:border-primary/20 transition-all relative">
                            <img id="preview-${item.key}" src="${item.value || ''}" class="w-full h-full object-cover ${!item.value ? 'hidden' : ''}">
                            ${!item.value ? `<div class="w-full h-full flex items-center justify-center text-slate-300"><span class="material-symbols-outlined text-4xl">image</span></div>` : ''}
                        </div>
                        <div class="flex-1 w-full space-y-3">
                            <div class="flex gap-2">
                                <input id="input-${item.key}" type="text" value="${item.value || ''}" 
                                       class="flex-1 bg-slate-50 border-2 border-transparent rounded-xl px-5 py-3.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 transition-all text-sm shadow-sm" 
                                       placeholder="URL Gambar...">
                                <button onclick="window.triggerUpload('${item.key}')" class="bg-slate-800 text-white px-4 rounded-xl hover:bg-black transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95">
                                    <span class="material-symbols-outlined text-sm">upload</span>
                                    <span>Ganti</span>
                                </button>
                            </div>
                            <p class="text-[10px] text-slate-400 font-medium italic">Rekomendasi: Ukuran file < 500KB, format .webp atau .png (tanpa background jika ikon).</p>
                        </div>
                    </div>
                ` : isTextarea ? `
                    <textarea id="input-${item.key}" rows="3"
                              class="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 transition-all text-base shadow-inner leading-relaxed placeholder:text-slate-300" 
                              placeholder="Masukkan deskripsi...">${item.value || ''}</textarea>
                ` : `
                    <input id="input-${item.key}" type="text" value="${item.value || ''}"
                           class="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] px-6 py-4 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 transition-all text-lg shadow-inner placeholder:text-slate-300" 
                           placeholder="Masukkan teks...">
                `}
            </div>
        `;
    }

    function bindEvents() {
        // Initialization
        const initBtn = document.getElementById('init-btn');
        if (initBtn) {
            initBtn.addEventListener('click', async () => {
                const originalContent = initBtn.innerHTML;
                initBtn.innerHTML = `<span class="material-symbols-outlined animate-spin">autorenew</span> <span>MENGINISIALISASI...</span>`;
                initBtn.disabled = true;

                const defaults = [
                    { key: 'hero_title', value: 'Ubah Sampah Jadi Berkah.', type: 'text', section: 'hero', label: 'Judul Hero' },
                    { key: 'hero_subtitle', value: 'Solusi cerdas kelola limbah rumah tangga. Dapatkan penghasilan tambahan dan menangkan reward eksklusif untuk setiap kontribusi hijau Anda.', type: 'textarea', section: 'hero', label: 'Sub-judul Hero' },
                    { key: 'hero_image_1', value: 'images/home.png', type: 'image_url', section: 'hero', label: 'Tampilan Utama' },
                    { key: 'hero_image_2', value: 'images/beli.png', type: 'image_url', section: 'hero', label: 'Tampilan Jual' },
                    { key: 'hero_image_3', value: 'images/layanan.png', type: 'image_url', section: 'hero', label: 'Tampilan Layanan' },
                    { key: 'hero_image_4', value: 'images/profile.png', type: 'image_url', section: 'hero', label: 'Tampilan Profil' },
                    { key: 'hero_image_5', value: 'images/maps.png', type: 'image_url', section: 'hero', label: 'Tampilan Peta' },
                    { key: 'layanan_title', value: 'Layanan Kelola Sampah Cerdas', type: 'text', section: 'layanan', label: 'Judul Utama Section' },
                    { key: 'layanan_desc', value: 'Solusi lengkap dari penjemputan hingga penjualan daur ulang yang dirancang khusus untuk kenyamanan ekosistem Anda.', type: 'textarea', section: 'layanan', label: 'Deskripsi Utama Section' },
                    { key: 'service_1_title', value: 'Penjemputan Langsung', type: 'text', section: 'layanan', label: 'Layanan 1: Judul' },
                    { key: 'service_1_desc', value: 'Pesan jadwal penjemputan dari rumah. Tim kurir tangkas kami akan mengambil sampah daur ulang Anda dengan timbangan transparan.', type: 'textarea', section: 'layanan', label: 'Layanan 1: Deskripsi' },
                    { key: 'service_2_title', value: 'Drop-off Terdekat', type: 'text', section: 'layanan', label: 'Layanan 2: Judul' },
                    { key: 'service_2_desc', value: 'Setorkan langsung komoditas Anda ke mitra pengepul terverifikasi dalam jaringan terdekat untuk proses penjualan instan dan mandiri.', type: 'textarea', section: 'layanan', label: 'Layanan 2: Deskripsi' },
                    { key: 'service_3_title', value: 'Aksi Ekosistem & CSR', type: 'text', section: 'layanan', label: 'Layanan 3: Judul' },
                    { key: 'service_3_desc', value: 'Terlibatlah dalam misi donasi, tukar poin dengan hadiah, pelatihan daur ulang mandiri, dan bangun gaya hidup ramah lingkungan sesungguhnya.', type: 'textarea', section: 'layanan', label: 'Layanan 3: Deskripsi' },
                    { key: 'fitur_title', value: 'Fitur Premium untuk Gaya Hidup Hijau.', type: 'text', section: 'fitur', label: 'Judul Utama Section' },
                    { key: 'fitur_subtitle', value: 'Kami menyediakan ekosistem terpadu dari penjemputan hingga penjualan daur ulang.', type: 'textarea', section: 'fitur', label: 'Deskripsi Utama Section' },
                    
                    { key: 'feature_1_title', value: 'Titik Jemput Akurat', type: 'text', section: 'fitur', label: 'Fitur 1: Judul' },
                    { key: 'feature_1_desc', value: 'Layanan pick-up langsung ke depan pintu Anda dengan penentuan lokasi yang presisi menggunakan integrasi maps.', type: 'textarea', section: 'fitur', label: 'Fitur 1: Deskripsi' },
                    { key: 'feature_1_icon', value: 'local_shipping', type: 'text', section: 'fitur', label: 'Fitur 1: Ikon' },
                    
                    { key: 'feature_2_title', value: 'Katalog Harga Real-time', type: 'text', section: 'fitur', label: 'Fitur 2: Judul' },
                    { key: 'feature_2_desc', value: 'Pantau harga botol PET, kardus, dan logam agar Anda tahu pasti nilai sampah Anda setiap saat.', type: 'textarea', section: 'fitur', label: 'Fitur 2: Deskripsi' },
                    { key: 'feature_2_icon', value: 'sell', type: 'text', section: 'fitur', label: 'Fitur 2: Ikon' },
                    
                    { key: 'feature_3_title', value: 'Aksi Komunitas', type: 'text', section: 'fitur', label: 'Fitur 3: Judul' },
                    { key: 'feature_3_desc', value: 'Pelatihan daur ulang & ekonomi sirkular bersama ahli.', type: 'textarea', section: 'fitur', label: 'Fitur 3: Deskripsi' },
                    { key: 'feature_3_icon', value: 'diversity_1', type: 'text', section: 'fitur', label: 'Fitur 3: Ikon' },
                    
                    { key: 'feature_4_title', value: 'Member Tiering', type: 'text', section: 'fitur', label: 'Fitur 4: Judul' },
                    { key: 'feature_4_desc', value: 'Tingkatkan rank dari Bronze hingga Prioritas untuk bonus spesial.', type: 'textarea', section: 'fitur', label: 'Fitur 4: Deskripsi' },
                    { key: 'feature_4_icon', value: 'workspace_premium', type: 'text', section: 'fitur', label: 'Fitur 4: Ikon' },
                    { key: 'cta_title', value: 'Mulai Perjalanan Hijau Anda', type: 'text', section: 'cta', label: 'Judul CTA' },
                    { key: 'cta_subtitle', value: 'Bergabung dengan komunitas pejuang lingkungan kami dan ubah kebiasaan menjadi pundi-pundi rupiah yang bernilai konstan.', type: 'textarea', section: 'cta', label: 'Sub-judul CTA' },
                    
                    { key: 'footer_about', value: 'YARI (Setor Sampah Indonesia) adalah pelopor ekosistem ekonomi sirkular digital yang memberdayakan masyarakat untuk mengelola limbah menjadi aset bernilai.', type: 'textarea', section: 'footer', label: 'Tentang Perusahaan' },
                    { key: 'footer_fb', value: '#', type: 'text', section: 'footer', label: 'Link Facebook' },
                    { key: 'footer_ig', value: '#', type: 'text', section: 'footer', label: 'Link Instagram' },
                    { key: 'footer_tiktok', value: '#', type: 'text', section: 'footer', label: 'Link TikTok' }
                ];

                try {
                    const { error } = await supabase
                        .from('yari_onboarding_content')
                        .upsert(defaults, { onConflict: 'key' });

                    if (error) throw error;
                    location.reload();
                } catch (err) {
                    console.error("Init failed", err);
                    yariAlert('Gagal', "Gagal inisialisasi: Pastikan tabel 'yari_onboarding_content' sudah dibuat di Supabase.\n\nError: " + err.message, 'error');
                    initBtn.innerHTML = originalContent;
                    initBtn.disabled = false;
                }
            });
        }

        // Upload Trigger
        let activeUploadKey = null;
        window.triggerUpload = (key) => {
            activeUploadKey = key;
            document.getElementById('global-uploader').click();
        };

        const uploader = document.getElementById('global-uploader');
        uploader.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || !activeUploadKey) return;

            const originalBtn = document.querySelector(`button[onclick*="${activeUploadKey}"]`);
            const originalContent = originalBtn.innerHTML;
            originalBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">autorenew</span>`;
            originalBtn.disabled = true;

            try {
                // Upload to Supabase Storage
                const fileName = `onboarding/${activeUploadKey}_${Date.now()}.${file.name.split('.').pop()}`;
                const { data, error } = await supabase.storage
                    .from('yari-assets')
                    .upload(fileName, file, { upsert: true });

                if (error) throw error;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('yari-assets')
                    .getPublicUrl(fileName);

                // Update UI
                const input = document.getElementById(`input-${activeUploadKey}`);
                const preview = document.getElementById(`preview-${activeUploadKey}`);
                
                input.value = publicUrl;
                if (preview) {
                    preview.src = publicUrl;
                    preview.classList.remove('hidden');
                }

                originalBtn.innerHTML = `<span class="material-symbols-outlined text-sm">done</span>`;
                setTimeout(() => {
                    originalBtn.innerHTML = originalContent;
                    originalBtn.disabled = false;
                }, 1500);

            } catch (err) {
                console.error("Upload failed", err);
                yariAlert('Gagal', "Upload gagal: " + err.message, 'error');
                originalBtn.innerHTML = originalContent;
                originalBtn.disabled = false;
            } finally {
                uploader.value = ''; // Reset uploader
                activeUploadKey = null;
            }
        });

        // Save All Functionality
        const saveAllBtn = document.getElementById('save-all-btn');
        saveAllBtn.addEventListener('click', async () => {
            const originalContent = saveAllBtn.innerHTML;
            saveAllBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px]">autorenew</span> <span>MENYIMPAN...</span>`;
            saveAllBtn.disabled = true;
            saveAllBtn.classList.add('opacity-50');

            const fieldGroups = document.querySelectorAll('.field-group');
            const updates = [];

            fieldGroups.forEach(group => {
                const key = group.getAttribute('data-key');
                const value = document.getElementById(`input-${key}`).value;
                updates.push({ key, value });
            });

            try {
                // Batch update (Supabase handles multiple upserts if you pass array)
                // However, we want to update existing keys.
                for (const update of updates) {
                    const { error } = await supabase
                        .from('yari_onboarding_content')
                        .update({ value: update.value })
                        .eq('key', update.key);
                    
                    if (error) throw error;
                }

                saveAllBtn.classList.replace('bg-primary', 'bg-green-600');
                saveAllBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">done_all</span> <span>BERHASIL DISIMPAN</span>`;
                
                setTimeout(() => {
                    saveAllBtn.classList.replace('bg-green-600', 'bg-primary');
                    saveAllBtn.innerHTML = originalContent;
                    saveAllBtn.disabled = false;
                    saveAllBtn.classList.remove('opacity-50');
                }, 2000);

            } catch (err) {
                console.error("Save failed", err);
                yariAlert('Gagal', "Gagal menyimpan perubahan: " + err.message, 'error');
                saveAllBtn.innerHTML = originalContent;
                saveAllBtn.disabled = false;
                saveAllBtn.classList.remove('opacity-50');
            }
        });
    }

    await loadView();
}
