import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

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
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-6xl mx-auto relative">
                    <header class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline text-slate-800 tracking-tight">Manajemen Layanan</h2>
                            <p class="text-slate-500 mt-1">Kelola kartu layanan yang tampil di aplikasi user</p>
                        </div>
                        <button onclick="window.openServiceModal()" class="bg-primary hover:bg-[#0f5238] transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full md:w-auto cursor-pointer">
                            <span class="material-symbols-outlined">add_circle</span> Layanan Baru
                        </button>
                    </header>

                    <!-- Items Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${(services || []).map(item => `
                            <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group transition-all hover:shadow-xl">
                                <div class="p-8 flex flex-col h-full relative overflow-hidden">
                                    <div class="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                                        <span class="material-symbols-outlined text-3xl">${item.icon || 'star'}</span>
                                    </div>
                                    <h3 class="headline text-xl font-bold text-slate-800 mb-3">${item.judul}</h3>
                                    <p class="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">${item.deskripsi || '-'}</p>
                                    
                                    <div class="space-y-3 pt-4 border-t border-slate-50">
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="text-slate-400 font-bold uppercase tracking-widest">Urutan</span>
                                            <span class="bg-slate-100 px-2.5 py-1 rounded-lg font-black text-slate-600">${item.urutan}</span>
                                        </div>
                                        <div class="flex items-center justify-between text-xs">
                                            <span class="text-slate-400 font-bold uppercase tracking-widest">Tombol CTA</span>
                                            <span class="text-primary font-black">${item.text_cta}</span>
                                        </div>
                                    </div>

                                    <!-- Action Overlay on Hover or simple buttons below -->
                                </div>
                                <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                                    <button onclick="window.editServiceItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary text-slate-700 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer">Edit</button>
                                    <button onclick="window.deleteServiceItem('${item.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm transition-colors material-symbols-outlined shadow-sm cursor-pointer">delete</button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${(services && services.length === 0) ? `
                            <div class="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span class="material-symbols-outlined text-5xl text-slate-300">category</span>
                                </div>
                                <p class="text-slate-500 font-bold text-lg">Belum ada layanan.</p>
                                <p class="text-slate-400 text-sm">Klik 'Layanan Baru' untuk mulai menambahkan.</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Modal Backdrop & Window -->
                    <div id="service-modal" class="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 md:p-10 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onclick="window.closeServiceModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer bg-slate-100 p-2 rounded-full transition-colors">close</button>
                            <h3 id="modal-title" class="text-3xl font-black headline mb-8 tracking-tight">Tambah Layanan</h3>
                            
                            <form id="service-form" class="space-y-6">
                                <input type="hidden" id="form-id">
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div class="md:col-span-2">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Judul Layanan</label>
                                        <input id="form-judul" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="e.g. Pick-up Service">
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Deskripsi Singkat</label>
                                        <textarea id="form-desc" rows="3" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="Jelaskan secara singkat apa layanan ini..."></textarea>
                                    </div>

                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Icon (Material Symbols)</label>
                                        <input id="form-icon" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="e.g. local_shipping, school, eco">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Urutan Tampil</label>
                                        <input type="number" id="form-urutan" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" value="0">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Text Tombol (CTA)</label>
                                        <input id="form-cta-text" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="e.g. Jadwalkan Sekarang">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Link Tujuan (CTA)</label>
                                        <input id="form-cta-link" required class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="e.g. #/jual, https://wa.me/...">
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">URL Gambar (Opsional)</label>
                                        <input id="form-image" class="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-slate-700 outline-none ring-2 ring-transparent focus:ring-primary/20 transition-all" placeholder="https://...">
                                    </div>
                                </div>
                                
                                <div class="pt-6">
                                    <button type="submit" class="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] hover:bg-[#0f5238] transition-all shadow-xl shadow-primary/20 active:scale-95 cursor-pointer text-lg">Simpan Layanan</button>
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
            document.getElementById('service-form').reset();
            document.getElementById('form-id').value = '';
            document.getElementById('form-urutan').value = '0';
            document.getElementById('form-icon').value = 'local_shipping';
            document.getElementById('form-cta-text').value = 'Jadwalkan Sekarang';
            document.getElementById('modal-title').innerText = 'Tambah Layanan';
            document.getElementById('service-modal').classList.remove('hidden');
            document.getElementById('service-modal').classList.add('flex');
        };

        window.closeServiceModal = () => {
            document.getElementById('service-modal').classList.remove('flex');
            document.getElementById('service-modal').classList.add('hidden');
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
            
            document.getElementById('modal-title').innerText = 'Edit Layanan';
            document.getElementById('service-modal').classList.remove('hidden');
            document.getElementById('service-modal').classList.add('flex');
        };

        window.deleteServiceItem = async (id) => {
            if(!confirm("Yakin ingin menghapus layanan ini?")) return;
            try {
                await supabase.from('yari_services').delete().eq('id', id);
                loadView(); 
            } catch (err) {
                alert('Gagal menghapus:' + err.message);
            }
        };

        const form = document.getElementById('service-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerText = 'Menyimpan...';
            btn.disabled = true;

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
                    await supabase.from('yari_services').update(payload).eq('id', id);
                } else {
                    await supabase.from('yari_services').insert(payload);
                }
                window.closeServiceModal();
                loadView();
            } catch (err) {
                alert("Gagal: " + err.message);
                btn.innerText = 'Simpan Layanan';
                btn.disabled = false;
            }
        });
    }

    await loadView();
}
