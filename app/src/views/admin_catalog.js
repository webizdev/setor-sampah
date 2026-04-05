import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

export async function renderAdminCatalog(container, currentPath) {
    let searchTerm = '';
    let selectedCat = 'all';

    async function loadView() {
        const { data: catalog } = await supabase
            .from('yari_waste_catalog')
            .select('*, yari_waste_categories(name)')
            .order('name');

        const { data: categories } = await supabase
            .from('yari_waste_categories')
            .select('*');

        function renderGrid() {
            const filtered = (catalog || []).filter(item => {
                const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesCat = selectedCat === 'all' || item.category_id === selectedCat;
                return matchesSearch && matchesCat;
            });

            const gridContent = filtered.map(item => `
                <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-xl transition-all duration-300">
                    <div class="h-32 overflow-hidden relative bg-slate-100">
                        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                        ${item.is_popular ? `<div class="absolute top-3 left-3 bg-primary text-white px-2 py-0.5 rounded-lg text-[9px] font-black shadow-lg uppercase tracking-tight">Populer</div>` : ''}
                    </div>
                    <div class="p-4 flex-1 flex flex-col">
                        <div class="mb-1 uppercase text-[9px] tracking-[0.2em] font-black text-slate-400 truncate">${item.yari_waste_categories?.name}</div>
                        <h3 class="font-bold text-sm text-slate-800 mb-2 line-clamp-1" title="${item.name}">${item.name}</h3>
                        <p class="text-primary font-black text-base mt-auto">Rp ${item.price_per_kg.toLocaleString('id-ID')} <span class="text-[10px] font-bold text-slate-400">/Kg</span></p>
                    </div>
                    <div class="p-3 border-t border-slate-50 bg-slate-50/50 flex gap-2">
                        <button onclick="window.editCatalogItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary text-slate-600 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:bg-primary/5 hover:text-primary">Edit</button>
                        <button onclick="window.deleteCatalogItem('${item.id}')" class="bg-red-50 hover:bg-red-500 hover:text-white text-red-500 px-2 py-2 rounded-xl transition-all material-symbols-outlined text-sm shadow-sm cursor-pointer">delete</button>
                    </div>
                </div>
            `).join('');

            const gridContainer = document.getElementById('catalog-grid');
            if (gridContainer) {
                gridContainer.innerHTML = filtered.length > 0 ? gridContent : `
                    <div class="col-span-full py-20 text-center">
                        <span class="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
                        <p class="text-slate-400 font-medium">Tidak ada item yang cocok dengan pencarian Anda.</p>
                    </div>
                `;
            }
        }

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12 relative text-slate-800">
                    <header class="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 max-w-[1600px] mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Katalog <span class="text-primary">Sampah</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Kelola harga dan item sampah (Total: ${catalog?.length || 0})</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button onclick="window.openCategoryModal()" class="bg-white border border-slate-200 hover:border-primary text-slate-700 px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md">
                                <span class="material-symbols-outlined text-[18px]">category</span> Kategori
                            </button>
                            <button onclick="window.openCatalogModal()" class="bg-primary hover:bg-[#0f5238] transition-all text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary/20 cursor-pointer hover:-translate-y-0.5">
                                <span class="material-symbols-outlined text-[18px]">add</span> Item Baru
                            </button>
                        </div>
                    </header>

                    <div class="max-w-[1600px] mx-auto">
                        <!-- Search & Filter Controls -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div class="md:col-span-2 relative group">
                                <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                <input id="catalog-search" type="text" placeholder="Cari nama sampah..." class="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-4.5 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm font-medium" value="${searchTerm}">
                            </div>
                            <div class="relative group">
                                <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">filter_list</span>
                                <select id="catalog-filter" class="w-full bg-white border border-slate-200 rounded-[1.5rem] pl-14 pr-6 py-4.5 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer font-bold text-slate-700">
                                    <option value="all">Semua Kategori</option>
                                    ${categories.map(c => `<option value="${c.id}" ${selectedCat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Items Grid -->
                        <div id="catalog-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
                            <!-- Content will be injected here -->
                        </div>
                    </div>

                    <!-- Modals ... (Rest of existing modal code) -->
                    <!-- Catalog Item Modal -->
                    <div id="catalog-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar">
                            <button onclick="window.closeCatalogModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer transition-colors">close</button>
                            <h3 id="modal-title" class="text-2xl font-black headline mb-8 uppercase tracking-tight">Tambah <span class="text-primary">Item</span></h3>
                            
                            <form id="catalog-form" class="space-y-5">
                                <input type="hidden" id="form-id">
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Sampah</label>
                                    <input id="form-name" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all">
                                </div>
                                <div class="grid grid-cols-2 gap-5">
                                    <div class="space-y-1.5">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Harga per Kg</label>
                                        <input type="number" id="form-price" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-black text-primary focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all">
                                    </div>
                                    <div class="space-y-1.5">
                                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
                                        <select id="form-category" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all">
                                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Image URL</label>
                                    <input id="form-image" type="url" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-medium focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300" placeholder="https://...">
                                </div>
                                <div class="flex items-center gap-3 pt-2 group cursor-pointer" onclick="document.getElementById('form-popular').click()">
                                    <input type="checkbox" id="form-popular" class="w-6 h-6 accent-primary rounded-lg cursor-pointer">
                                    <label for="form-popular" class="text-sm font-black text-slate-700 cursor-pointer uppercase tracking-tight">Tandai Populer</label>
                                </div>
                                
                                <div class="pt-6">
                                    <button type="submit" class="w-full bg-primary text-white font-black py-5 rounded-2xl hover:bg-[#0f5238] transition-all shadow-xl shadow-primary/20 cursor-pointer uppercase tracking-widest text-xs hover:-translate-y-1">Simpan Item Katalog</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Category Modal -->
                    <div id="category-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 md:p-10 relative max-h-[90vh] overflow-y-auto no-scrollbar">
                            <button onclick="window.closeCategoryModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer transition-colors">close</button>
                            <h3 class="text-2xl font-black headline mb-8 uppercase tracking-tight">Kelola <span class="text-primary">Kategori</span></h3>
                            
                            <!-- List Categories -->
                            <div class="space-y-3 mb-8 max-h-56 overflow-y-auto pr-2 no-scrollbar">
                                ${categories.map(c => `
                                    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:shadow-md">
                                        <span class="font-bold text-slate-700">${c.name}</span>
                                        <button onclick="window.deleteCategory('${c.id}')" class="text-red-400 hover:text-red-600 material-symbols-outlined text-sm cursor-pointer transition-colors">delete</button>
                                    </div>
                                `).join('')}
                            </div>

                            <form id="category-form" class="space-y-4 pt-6 border-t border-slate-50">
                                <div class="space-y-1.5">
                                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Kategori Baru</label>
                                    <input id="cat-name" required class="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all" placeholder="Contoh: Logam, Kertas...">
                                </div>
                                <button type="submit" class="w-full bg-slate-800 text-white font-black py-4.5 rounded-2xl hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-3 uppercase tracking-widest text-xs hover:-translate-y-1 shadow-lg">
                                    <span class="material-symbols-outlined text-[18px]">add</span> Tambah Kategori
                                </button>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;
        renderGrid(); // Initial grid render

        // Bind Search & Filter Events
        const searchInput = document.getElementById('catalog-search');
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderGrid();
        });

        const filterSelect = document.getElementById('catalog-filter');
        filterSelect.addEventListener('change', (e) => {
            selectedCat = e.target.value;
            renderGrid();
        });

        // Modal Logic Scripts
        window.openCatalogModal = () => {
            document.getElementById('catalog-form').reset();
            document.getElementById('form-id').value = '';
            document.getElementById('modal-title').innerText = 'Tambah Item';
            document.getElementById('catalog-modal').classList.remove('hidden');
            document.getElementById('catalog-modal').classList.add('flex');
        };

        window.closeCatalogModal = () => {
            document.getElementById('catalog-modal').classList.remove('flex');
            document.getElementById('catalog-modal').classList.add('hidden');
        };

        window.openCategoryModal = () => {
            document.getElementById('category-form').reset();
            document.getElementById('category-modal').classList.remove('hidden');
            document.getElementById('category-modal').classList.add('flex');
        };

        window.closeCategoryModal = () => {
            document.getElementById('category-modal').classList.remove('flex');
            document.getElementById('category-modal').classList.add('hidden');
        };

        window.editCatalogItem = (id) => {
            const item = catalog.find(c => c.id === id);
            if(!item) return;
            document.getElementById('form-id').value = item.id;
            document.getElementById('form-name').value = item.name;
            document.getElementById('form-price').value = item.price_per_kg;
            document.getElementById('form-category').value = item.category_id;
            document.getElementById('form-image').value = item.image_url;
            document.getElementById('form-popular').checked = item.is_popular;
            
            document.getElementById('modal-title').innerText = 'Edit Item';
            document.getElementById('catalog-modal').classList.remove('hidden');
            document.getElementById('catalog-modal').classList.add('flex');
        };

        window.deleteCatalogItem = async (id) => {
            if(!(await yariConfirm("Hapus Item?", "Yakin ingin menghapus item ini? Transaksi yang terhubung mungkin akan bermasalah."))) return;
            
            try {
                await supabase.from('yari_waste_catalog').delete().eq('id', id);
                loadView(); 
            } catch (err) {
                yariAlert('Gagal', 'Gagal menghapus: ' + err.message, 'error');
            }
        };

        const form = document.getElementById('catalog-form');
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerText = 'Menyimpan...';
            btn.disabled = true;

            const id = document.getElementById('form-id').value;
            const payload = {
                name: document.getElementById('form-name').value,
                price_per_kg: document.getElementById('form-price').value,
                category_id: document.getElementById('form-category').value,
                image_url: document.getElementById('form-image').value,
                is_popular: document.getElementById('form-popular').checked
            };

            try {
                if (id) {
                    await supabase.from('yari_waste_catalog').update(payload).eq('id', id);
                } else {
                    await supabase.from('yari_waste_catalog').insert(payload);
                }
                window.closeCatalogModal();
                loadView();
            } catch (err) {
                yariAlert('Gagal', "Gagal: " + err.message, 'error');
                btn.innerText = 'Simpan Item';
                btn.disabled = false;
            }
        });

        // Category Form Logic
        const catForm = document.getElementById('category-form');
        const newCatForm = catForm.cloneNode(true);
        catForm.parentNode.replaceChild(newCatForm, catForm);

        newCatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Menyimpan...';
            btn.disabled = true;

            const name = document.getElementById('cat-name').value;

            try {
                await supabase.from('yari_waste_categories').insert({ name });
                loadView();
            } catch (err) {
                yariAlert('Gagal', "Gagal: " + err.message, 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        window.deleteCategory = async (id) => {
            if(!(await yariConfirm("Hapus Kategori?", "Yakin ingin menghapus kategori ini? Item yang menggunakan kategori ini mungkin terpengaruh."))) return;
            try {
                await supabase.from('yari_waste_categories').delete().eq('id', id);
                loadView();
            } catch (err) {
                yariAlert('Gagal', 'Gagal: ' + err.message, 'error');
            }
        };
    }

    await loadView();
}
