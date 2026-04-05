import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

export async function renderAdminLayanan(container, currentPath) {
    async function loadView() {
        const { data: services, error } = await supabase
            .from('yari_services')
            .select('*')
            .order('urutan', { ascending: true });

        if (error) {
            console.error("Error loading services", error);
        }

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 max-w-7xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Manajemen <span class="text-primary">Layanan</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Konfigurasi kartu layanan dan alur kerja aplikasi user.</p>
                        </div>
                        <button onclick="window.openServiceModal()" class="bg-primary hover:bg-[#0f5238] transition-all text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-primary/20 w-full md:w-auto cursor-pointer uppercase tracking-widest text-xs hover:-translate-y-1">
                            <span class="material-symbols-outlined text-lg">add_circle</span> Tambah Layanan
                        </button>
                    </header>

                    <!-- Items Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        ${(services || []).map(item => `
                            <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col group transition-all hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2">
                                <div class="p-10 flex flex-col h-full relative">
                                    <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary shadow-inner">
                                        <span class="material-symbols-outlined text-3xl font-bold">${item.icon || 'star'}</span>
                                    </div>
                                    <h3 class="headline text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight">${item.judul}</h3>
                                    <p class="text-slate-500 text-sm leading-relaxed mb-8 flex-grow font-medium opacity-80">${item.deskripsi || '-'}</p>
                                    
                                    <div class="space-y-4 pt-6 border-t border-slate-50">
                                        <div class="flex items-center justify-between">
                                            <span class="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Prioritas Tampil</span>
                                            <span class="bg-slate-100 px-3 py-1 rounded-lg font-black text-slate-600 text-xs shadow-sm">#${item.urutan}</span>
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <span class="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">Label Tombol</span>
                                            <span class="text-primary font-black text-xs uppercase tracking-wider">${item.text_cta}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3">
                                    <button onclick="window.editServiceItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 py-3 rounded-2xl text-[10px] font-black transition-all shadow-sm cursor-pointer uppercase tracking-widest">Edit Data</button>
                                    <button onclick="window.deleteServiceItem('${item.id}')" class="bg-red-50 hover:bg-red-500 hover:text-white text-red-400 w-12 h-12 flex items-center justify-center rounded-2xl transition-all material-symbols-outlined shadow-sm cursor-pointer">delete</button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${(services && services.length === 0) ? `
                            <div class="col-span-full py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[3rem] max-w-2xl mx-auto w-full">
                                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 scale-150 opacity-20">
                                    <span class="material-symbols-outlined text-6xl text-slate-400">category</span>
                                </div>
                                <h4 class="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">Belum Ada Layanan</h4>
                                <p class="text-slate-400 text-sm font-medium">Klik tombol 'Tambah Layanan' untuk menginisialisasi.</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Modal Backdrop & Window -->
                    <div id="service-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-10 md:p-12 relative max-h-[90vh] overflow-y-auto hide-scrollbar border border-white/20">
                            <button onclick="window.closeServiceModal()" class="absolute top-10 right-10 text-slate-300 hover:text-slate-800 material-symbols-outlined cursor-pointer bg-slate-50 p-2.5 rounded-full transition-all hover:rotate-90">close</button>
                            
                            <div class="mb-10">
                                <h3 id="modal-title" class="text-3xl font-black headline tracking-tight uppercase">Tambah <span class="text-primary">Layanan</span></h3>
                                <p class="text-slate-400 text-sm font-medium mt-1">Lengkapi detail layanan untuk dipublikasikan.</p>
                            </div>
                            
                            <form id="service-form" class="space-y-8">
                                <input type="hidden" id="form-id">
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="md:col-span-2 group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Nama Layanan Utama</label>
                                        <input id="form-judul" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg placeholder:text-slate-300" placeholder="e.g. Kurir Sampah Express">
                                    </div>
                                    
                                    <div class="md:col-span-2 group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Deskripsi Marketing</label>
                                        <textarea id="form-desc" rows="3" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-sm leading-relaxed placeholder:text-slate-300" placeholder="Berikan penjelasan yang menarik minat user..."></textarea>
                                    </div>

                                    <div class="group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Icon (Material Sym)</label>
                                        <div class="relative">
                                            <input id="form-icon" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all pl-14" placeholder="e.g. local_shipping">
                                            <span class="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-50">category</span>
                                        </div>
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Indeks Urutan</label>
                                        <input type="number" id="form-urutan" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all" value="0">
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Label Call-to-Action</label>
                                        <input id="form-cta-text" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all" placeholder="e.g. Mulai Setoran">
                                    </div>
                                    
                                    <div class="group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Endpoint / URL</label>
                                        <input id="form-cta-link" required class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all" placeholder="e.g. #/jual">
                                    </div>
                                    
                                    <div class="md:col-span-2 group">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 ml-2 group-focus-within:text-primary transition-colors">Thumbnail URL (HD)</label>
                                        <input id="form-image" class="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4.5 font-bold text-slate-800 outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-xs" placeholder="https://source.unsplash.com/...">
                                    </div>
                                </div>
                                
                                <div class="pt-8">
                                    <button type="submit" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-slate-900/20 active:scale-95 cursor-pointer text-base uppercase tracking-[0.3em] hover:-translate-y-1">Simpan Data Layanan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;

        // Script bindings
        window.openServiceModal = () => {
            const form = document.getElementById('service-form');
            if(form) form.reset();
            document.getElementById('form-id').value = '';
            document.getElementById('form-urutan').value = '0';
            document.getElementById('form-icon').value = 'stars';
            document.getElementById('form-cta-text').value = 'MULAI SEKARANG';
            document.getElementById('modal-title').innerHTML = 'Tambah <span class="text-primary">Layanan</span>';
            const modal = document.getElementById('service-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.closeServiceModal = () => {
            const modal = document.getElementById('service-modal');
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        };

        window.editServiceItem = (id) => {
            const item = services.find(s => s.id === id);
            if(!item) return;
            document.getElementById('form-id').value = item.id;
            document.getElementById('form-judul').value = item.judul;
            document.getElementById('form-desc').value = item.deskripsi || '';
            document.getElementById('form-urutan').value = item.urutan || 0;
            document.getElementById('form-icon').value = item.icon || '';
            document.getElementById('form-cta-text').value = item.text_cta || '';
            document.getElementById('form-cta-link').value = item.link_cta || '';
            document.getElementById('form-image').value = item.url_gambar || '';
            
            document.getElementById('modal-title').innerHTML = 'Edit <span class="text-primary">Layanan</span>';
            const modal = document.getElementById('service-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        window.deleteServiceItem = async (id) => {
            if(!(await yariConfirm("Hapus Layanan?", "Hapus layanan ini secara permanen dari basis data? Tindakan ini tidak dapat dibatalkan."))) return;
            try {
                const { error } = await supabase.from('yari_services').delete().eq('id', id);
                if(error) throw error;
                loadView(); 
            } catch (err) {
                console.error(err);
                yariAlert('Gagal', 'Gagal menghapus layanan: ' + err.message, 'error');
            }
        };

        const form = document.getElementById('service-form');
        if(form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);

            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.innerText;
                btn.innerText = 'MENYIMPAN...';
                btn.disabled = true;
                btn.classList.add('opacity-50');

                const id = document.getElementById('form-id').value;
                const payload = {
                    judul: document.getElementById('form-judul').value,
                    deskripsi: document.getElementById('form-desc').value,
                    urutan: parseInt(document.getElementById('form-urutan').value || 0, 10),
                    icon: document.getElementById('form-icon').value,
                    text_cta: document.getElementById('form-cta-text').value,
                    link_cta: document.getElementById('form-cta-link').value,
                    url_gambar: document.getElementById('form-image').value
                };

                try {
                    if (id) {
                        const { error } = await supabase.from('yari_services').update(payload).eq('id', id);
                        if(error) throw error;
                    } else {
                        const { error } = await supabase.from('yari_services').insert(payload);
                        if(error) throw error;
                    }
                    window.closeServiceModal();
                    loadView();
                } catch (err) {
                    console.error(err);
                    yariAlert('Gagal Menyimpan', "Terjadi kesalahan saat menyimpan: " + err.message, 'error');
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                }
            });
        }
    }

    await loadView();
}
