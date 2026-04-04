import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

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
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-6xl mx-auto relative">
                    <header class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline text-slate-800 tracking-tight">Artikel & Feed</h2>
                            <p class="text-slate-500 mt-1">Kelola feed Eksplorasi Lingkungan di Beranda</p>
                        </div>
                        <button onclick="window.openArticleModal()" class="bg-primary hover:bg-[#0f5238] transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full md:w-auto cursor-pointer">
                            <span class="material-symbols-outlined">post_add</span> Artikel Baru
                        </button>
                    </header>

                    <!-- Items Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        ${(articles || []).map(item => `
                            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group">
                                <div class="h-40 overflow-hidden relative bg-slate-100">
                                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                                    <div class="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-primary shadow-sm">${item.kategori}</div>
                                </div>
                                <div class="p-5 flex-1 flex flex-col">
                                    <h3 class="font-bold text-lg text-slate-800 mb-2 line-clamp-2" title="${item.title}">${item.title}</h3>
                                    <p class="text-xs text-slate-500 line-clamp-2 mb-3">${item.deskripsi || '-'}</p>
                                    
                                    <div class="mt-auto space-y-1">
                                        <div class="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span class="material-symbols-outlined text-[14px]">sort</span>
                                            <span>Urutan: <b class="text-slate-600">${item.urutan}</b></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                                    <button onclick="window.editArticleItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary text-slate-700 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer">Edit</button>
                                    <button onclick="window.deleteArticleItem('${item.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm transition-colors material-symbols-outlined shadow-sm cursor-pointer">delete</button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${(articles && articles.length === 0) ? `
                            <div class="col-span-full py-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                                <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">article</span>
                                <p class="text-slate-500 font-medium">Belum ada artikel. Klik tombol Artikel Baru untuk menambah.</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Modal Backdrop & Window -->
                    <div id="article-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-6 md:p-8 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onclick="window.closeArticleModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer">close</button>
                            <h3 id="modal-title" class="text-2xl font-black headline mb-6">Tambah Artikel</h3>
                            
                            <form id="article-form" class="space-y-4">
                                <input type="hidden" id="form-id">
                                
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="col-span-2">
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Judul Artikel</label>
                                        <input id="form-title" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Masukkan judul menarik...">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kategori / Card</label>
                                        <input id="form-category" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Edukasi, Agenda" value="Artikel">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Urutan (Sort)</label>
                                        <input type="number" id="form-urutan" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="0">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tanggal Kegiatan</label>
                                        <input id="form-tanggal" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Opsional...">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Lokasi (Maps)</label>
                                        <input id="form-maps" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Opsional...">
                                    </div>
                                    
                                    <div class="col-span-2">
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Deskripsi Singkat</label>
                                        <textarea id="form-desc" rows="2" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-300" placeholder="Ringkasan artikel..."></textarea>
                                    </div>
                                    
                                    <div class="col-span-2">
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">URL Gambar (Image Card)</label>
                                        <input id="form-image" type="url" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-300" placeholder="https://...">
                                    </div>

                                    <div class="col-span-2">
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Link Website (Arahkan Target)</label>
                                        <input id="form-link" type="url" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-300" placeholder="https://...">
                                    </div>
                                </div>
                                
                                <div class="pt-4">
                                    <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-[#0f5238] transition-colors cursor-pointer">Simpan Artikel</button>
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
            document.getElementById('article-form').reset();
            document.getElementById('form-id').value = '';
            document.getElementById('form-urutan').value = '0';
            document.getElementById('form-category').value = 'Artikel';
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
                link_website: document.getElementById('form-link').value
            };

            try {
                if (id) {
                    await supabase.from('yari_articles').update(payload).eq('id', id);
                } else {
                    await supabase.from('yari_articles').insert(payload);
                }
                window.closeArticleModal();
                loadView();
            } catch (err) {
                alert("Gagal: " + err.message);
                btn.innerText = 'Simpan Artikel';
                btn.disabled = false;
            }
        });
    }

    await loadView();
}
