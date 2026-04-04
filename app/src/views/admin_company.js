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
                            </div>
                            
                            <div class="pt-6">
                                <button type="submit" id="save-btn" 
                                        class="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-[0.98] cursor-pointer text-base flex items-center justify-center gap-4 group uppercase tracking-[0.3em] hover:-translate-y-1">
                                    <span class="material-symbols-outlined group-hover:rotate-12 transition-transform text-2xl">verified</span>
                                    <span>Simpan Perubahan</span>
                                </button>
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
                </main>
            </div>
        `;
        container.innerHTML = html;

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
                const payload = {
                    nama: document.getElementById('form-nama').value,
                    alamat: document.getElementById('form-alamat').value,
                    whatsapp: document.getElementById('form-whatsapp').value
                };

                try {
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
                    alert("Gagal memperbarui profil: " + err.message);
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                }
            });
        }
    }

    await loadView();
}
