import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

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
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-4xl mx-auto relative">
                    <header class="mb-10 animate-fade-in">
                        <div class="flex items-center gap-3 mb-2">
                             <div class="w-1.5 h-8 bg-primary rounded-full"></div>
                             <h2 class="text-3xl font-black headline text-slate-800 tracking-tight italic uppercase">Profil Perusahaan</h2>
                        </div>
                        <p class="text-slate-500 ml-4 font-medium">Kelola identitas utama dan informasi kontak untuk aplikasi Anda</p>
                    </header>

                    <!-- Profile Form Card -->
                    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 animate-slide-up relative overflow-hidden">
                        
                        <!-- Decorative background icon -->
                        <div class="absolute right-[-30px] top-[-30px] opacity-[0.03] pointer-events-none rotate-12">
                             <span class="material-symbols-outlined text-[200px]">business</span>
                        </div>

                        <form id="company-form" class="space-y-8 relative z-10">
                            <input type="hidden" id="form-id" value="${profile?.id || ''}">
                            
                            <div class="grid grid-cols-1 gap-8">
                                <!-- Company Name -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm">label</span> Nama Perusahaan
                                    </label>
                                    <input id="form-nama" required value="${profile?.nama || ''}"
                                           class="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner" 
                                           placeholder="e.g. Setor Sampah Indonesia">
                                </div>
                                
                                <!-- Address -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm">distance</span> Alamat Kantor
                                    </label>
                                    <textarea id="form-alamat" rows="3" required
                                              class="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] px-6 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner" 
                                              placeholder="Jl. Merdeka No. 123...">${profile?.alamat || ''}</textarea>
                                </div>

                                <!-- WhatsApp Number -->
                                <div class="group">
                                    <label class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 group-focus-within:text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm">chat_bubble</span> WhatsApp CS (Gunakan format 62...)
                                    </label>
                                    <div class="relative">
                                        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">+</span>
                                        <input type="number" id="form-whatsapp" required value="${profile?.whatsapp || ''}"
                                               class="w-full bg-slate-50 border-2 border-transparent rounded-[1.2rem] pl-10 pr-6 py-4 font-bold text-slate-700 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg shadow-inner" 
                                               placeholder="628123456789">
                                    </div>
                                    <p class="mt-2 text-[10px] text-slate-400 ml-1 italic font-medium italic">* Nomor ini akan digunakan untuk semua tombol 'Hubungi Kami' otomatis di aplikasi user.</p>
                                </div>
                            </div>
                            
                            <div class="pt-4">
                                <button type="submit" id="save-btn" 
                                        class="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] hover:bg-[#0f5238] transition-all shadow-2xl shadow-primary/30 active:scale-[0.98] cursor-pointer text-xl flex items-center justify-center gap-3 group">
                                    <span class="material-symbols-outlined group-hover:rotate-12 transition-transform">check_circle</span>
                                    <span>Update Profil Perusahaan</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Additional Info Cards -->
                    <div class="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style="animation-delay: 0.1s">
                         <div class="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex gap-4">
                              <span class="material-symbols-outlined text-primary text-3xl">info</span>
                              <div>
                                   <h4 class="font-bold text-slate-800 mb-1">Informasi Sinkronisasi</h4>
                                   <p class="text-sm text-slate-600 leading-relaxed">Setiap perubahan yang disimpan akan langsung berdampak pada halaman 'Tentang Kami' dan tombol kontak di aplikasi user.</p>
                              </div>
                         </div>
                         <div class="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
                              <span class="material-symbols-outlined text-amber-500 text-3xl">warning</span>
                              <div>
                                   <h4 class="font-bold text-slate-800 mb-1">Format WhatsApp</h4>
                                   <p class="text-sm text-slate-600 leading-relaxed">Pastikan nomor diawali dengan kode negara (misal: 62) tanpa karakter '+' atau spasi untuk link CTA yang valid.</p>
                              </div>
                         </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;

        // Form Submit Handler
        const form = document.getElementById('company-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('save-btn');
            const originalContent = btn.innerHTML;
            
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin">autorenew</span> <span>Menyimpan...</span>`;
            btn.disabled = true;

            const id = document.getElementById('form-id').value;
            const payload = {
                nama: document.getElementById('form-nama').value,
                alamat: document.getElementById('form-alamat').value,
                whatsapp: document.getElementById('form-whatsapp').value
            };

            try {
                if (id) {
                    await supabase.from('yari_company_profile').update(payload).eq('id', id);
                } else {
                    await supabase.from('yari_company_profile').insert(payload);
                }
                
                // Show success state
                btn.classList.replace('bg-primary', 'bg-green-600');
                btn.innerHTML = `<span class="material-symbols-outlined">done_all</span> <span>Profil Berhasil Diperbarui</span>`;
                
                setTimeout(() => {
                    btn.classList.replace('bg-green-600', 'bg-primary');
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    loadView(); // Refresh to catch ID if new
                }, 2000);

            } catch (err) {
                alert("Gagal memperbarui profil: " + err.message);
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        });
    }

    await loadView();
}
