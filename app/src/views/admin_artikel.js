import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

export async function renderAdminArtikel(container, currentPath) {
    async function loadView() {
        const { data: articles, error } = await supabase
            .from('yari_articles')
            .select('*')
            .order('urutan', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading articles", error);
        }

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 max-w-6xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Artikel & <span class="text-primary">Feed</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Kelola feed Eksplorasi Lingkungan di Beranda</p>
                        </div>
                        <button onclick="window.openArticleModal()" class="bg-primary hover:bg-[#0f5238] transition-all text-white px-6 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20 w-full md:w-auto cursor-pointer uppercase tracking-widest text-xs hover:-translate-y-1">
                            <span class="material-symbols-outlined text-sm">post_add</span> Artikel Baru
                        </button>
                    </header>

                    <!-- Items Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        ${(articles || []).map(item => `
                            <div class="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                <div class="h-48 overflow-hidden relative bg-slate-100">
                                    <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                                    <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black text-primary shadow-sm uppercase tracking-widest">${item.kategori}</div>
                                </div>
                                <div class="p-6 flex-1 flex flex-col">
                                    <h3 class="font-black text-lg text-slate-800 mb-2 line-clamp-2 leading-tight uppercase" title="${item.title}">${item.title}</h3>
                                    <p class="text-xs text-slate-500 line-clamp-3 mb-4 font-medium leading-relaxed">${item.deskripsi || '-'}</p>
                                    
                                    <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                                        <div class="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span class="material-symbols-outlined text-[14px]">sort</span>
                                            <span>Posisi: <b class="text-primary">${item.urutan}</b></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 bg-slate-50/50 flex gap-2">
                                    <button onclick="window.editArticleItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-700 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm cursor-pointer uppercase tracking-widest">Edit</button>
                                    <button onclick="window.deleteArticleItem('${item.id}')" class="bg-red-50 hover:bg-red-500 hover:text-white text-red-400 px-4 py-2.5 rounded-xl transition-all material-symbols-outlined shadow-sm cursor-pointer">delete</button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${(articles && articles.length === 0) ? `
                            <div class="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                                <span class="material-symbols-outlined text-6xl text-slate-200 mb-4 scale-150 opacity-50">article</span>
                                <h4 class="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Blum Ada Konten</h4>
                                <p class="text-slate-400 mt-2 text-sm font-medium">Klik Artikel Baru untuk mulai menginspirasi.</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Modal Backdrop & Window -->
                    <div id="article-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 md:p-10 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onclick="window.closeArticleModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer transition-colors">close</button>
                            <h3 id="modal-title" class="text-3xl font-black headline mb-8 uppercase tracking-tight">Tambah <span class="text-primary">Artikel</span></h3>
                            
                            <form id="article-form" class="grid grid-cols-2 gap-5">
                                <input type="hidden" id="form-id">
                                
                                <div class="col-span-2 space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Judul Artikel</label>
                                    <input id="form-title" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Masukkan judul menarik...">
                                </div>
                                
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategori / Card</label>
                                    <input id="form-category" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="e.g. Edukasi, Agenda" value="Artikel">
                                </div>
                                
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Urutan (Sort)</label>
                                    <input type="number" id="form-urutan" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" value="0">
                                </div>
                                
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tanggal Kegiatan</label>
                                    <input id="form-tanggal" class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Opsional...">
                                </div>
                                
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Lokasi (Maps)</label>
                                    <input id="form-maps" class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Opsional...">
                                </div>
                                
                                <div class="col-span-2 space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Deskripsi Singkat</label>
                                    <textarea id="form-desc" rows="3" class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300" placeholder="Ringkasan artikel..."></textarea>
                                </div>
                                
                                <div class="col-span-2 space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">URL Gambar (Image Card)</label>
                                    <input id="form-image" type="url" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300" placeholder="https://...">
                                </div>

                                <div class="col-span-2 space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Link Website (Arahkan Target)</label>
                                    <input id="form-link" type="url" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300" placeholder="https://...">
                                </div>

                                <div class="col-span-2 mt-2 px-1 py-1">
                                    <label class="flex items-center gap-3 cursor-pointer group">
                                        <div class="relative flex items-center">
                                            <input id="form-is-notified" type="checkbox" class="peer h-6 w-6 cursor-pointer appearance-none rounded-lg bg-slate-100 border border-slate-200 checked:bg-primary checked:border-primary transition-all shadow-sm">
                                            <span class="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none text-base font-black">check</span>
                                        </div>
                                        <div class="flex flex-col">
                                            <span class="text-xs font-black text-slate-700 uppercase tracking-widest group-hover:text-primary transition-colors">Informasikan ke Member</span>
                                            <span class="text-[9px] font-medium text-slate-400">Picu notifikasi (titik merah) di aplikasi user</span>
                                        </div>
                                    </label>
                                </div>

                                <div class="col-span-2 pt-6">
                                    <button type="submit" class="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-[#0f5238] transition-all shadow-xl shadow-primary/20 cursor-pointer uppercase tracking-widest text-xs hover:-translate-y-1">Simpan Publikasi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;

        // Script bindings as global properties to be accessible via standard HTML attributes
        window.openArticleModal = () => {
            const form = document.getElementById('article-form');
            if (form) form.reset();
            document.getElementById('form-id').value = '';
            document.getElementById('form-urutan').value = '0';
            document.getElementById('form-category').value = 'Artikel';
            document.getElementById('form-is-notified').checked = false;
            document.getElementById('modal-title').innerText = 'Tambah Artikel';
            document.getElementById('article-modal').classList.remove('hidden');
            document.getElementById('article-modal').classList.add('flex');
        };

        window.closeArticleModal = () => {
            document.getElementById('article-modal').classList.remove('flex');
            document.getElementById('article-modal').classList.add('hidden');
        };

        window.editArticleItem = (id) => {
            const item = articles.find(c => c.id === id);
            if(!item) return;
            document.getElementById('form-id').value = item.id;
            document.getElementById('form-title').value = item.title;
            document.getElementById('form-category').value = item.kategori || '';
            document.getElementById('form-urutan').value = item.urutan || 0;
            document.getElementById('form-tanggal').value = item.tanggal || '';
            document.getElementById('form-maps').value = item.maps || '';
            document.getElementById('form-desc').value = item.deskripsi || '';
            document.getElementById('form-image').value = item.image_url || '';
            document.getElementById('form-link').value = item.link_website || '';
            document.getElementById('form-is-notified').checked = item.is_notified || false;
            
            document.getElementById('modal-title').innerText = 'Edit Artikel';
            document.getElementById('article-modal').classList.remove('hidden');
            document.getElementById('article-modal').classList.add('flex');
        };

        window.deleteArticleItem = async (id) => {
            if(!confirm("Yakin ingin menghapus artikel ini?")) return;
            try {
                await supabase.from('yari_articles').delete().eq('id', id);
                loadView(); 
            } catch (err) {
                alert('Gagal menghapus:' + err.message);
            }
        };

        const form = document.getElementById('article-form');
        // Prevent duplicate listener issues
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Menyimpan...';
            btn.disabled = true;

            const id = document.getElementById('form-id').value;
            const payload = {
                title: document.getElementById('form-title').value,
                kategori: document.getElementById('form-category').value,
                urutan: parseInt(document.getElementById('form-urutan').value || 0, 10),
                tanggal: document.getElementById('form-tanggal').value,
                maps: document.getElementById('form-maps').value,
                deskripsi: document.getElementById('form-desc').value,
                image_url: document.getElementById('form-image').value,
                link_website: document.getElementById('form-link').value,
                is_notified: document.getElementById('form-is-notified').checked
            };
            
            // Set notified_at if checkbox is newly checked or it's a new article being notified
            if (payload.is_notified) {
                payload.notified_at = new Date().toISOString();
            }

            try {
                let result;
                if (id) {
                    result = await supabase.from('yari_articles').update(payload).eq('id', id);
                } else {
                    result = await supabase.from('yari_articles').insert(payload);
                }

                if (result.error) {
                    // Check if error is due to missing columns (common if migration wasn't run)
                    if (result.error.message.includes('column') && (result.error.message.includes('is_notified') || result.error.message.includes('notified_at'))) {
                        console.warn("Database columns missing, attempting fallback save without notification flags...");
                        const fallbackPayload = { ...payload };
                        delete fallbackPayload.is_notified;
                        delete fallbackPayload.notified_at;
                        
                        let fallbackResult;
                        if (id) {
                            fallbackResult = await supabase.from('yari_articles').update(fallbackPayload).eq('id', id);
                        } else {
                            fallbackResult = await supabase.from('yari_articles').insert(fallbackPayload);
                        }
                        
                        if (fallbackResult.error) throw fallbackResult.error;
                        alert("Berhasil disimpan (Tanpa Notifikasi). Mohon jalankan SQL migration untuk mengaktifkan fitur notifikasi.");
                    } else {
                        throw result.error;
                    }
                }

                window.closeArticleModal();
                loadView();
            } catch (err) {
                alert("Gagal: " + err.message);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    await loadView();
}
