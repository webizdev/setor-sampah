import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

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
                <div class="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                    <div class="h-28 overflow-hidden relative bg-slate-100">
                        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                        ${item.is_popular ? `<div class="absolute top-2 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-primary shadow-sm uppercase">Populer</div>` : ''}
                    </div>
                    <div class="p-3 flex-1 flex flex-col">
                        <div class="mb-0.5 uppercase text-[8px] tracking-widest font-bold text-slate-400 truncate">${item.yari_waste_categories?.name}</div>
                        <h3 class="font-bold text-sm text-slate-800 mb-1 line-clamp-1" title="${item.name}">${item.name}</h3>
                        <p class="text-primary font-black text-sm mt-auto">Rp ${item.price_per_kg.toLocaleString('id-ID')} <span class="text-[10px] font-bold text-slate-400">/Kg</span></p>
                    </div>
                    <div class="p-2 border-t border-slate-100 bg-slate-50 flex gap-1.5">
                        <button onclick="window.editCatalogItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary text-slate-600 py-1.5 rounded-lg text-[10px] font-bold transition-colors shadow-sm cursor-pointer">Edit</button>
                        <button onclick="window.deleteCatalogItem('${item.id}')" class="bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1.5 rounded-lg transition-colors material-symbols-outlined text-sm shadow-sm cursor-pointer">delete</button>
                    </div>
                </div>
            `).join('');

            document.getElementById('catalog-grid').innerHTML = filtered.length > 0 ? gridContent : `
                <div class="col-span-full py-20 text-center">
                    <span class="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
                    <p class="text-slate-400 font-medium">Tidak ada item yang cocok dengan pencarian Anda.</p>
                </div>
            `;
        }

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-[1600px] mx-auto relative text-slate-800">
                    <header class="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight">Katalog</h2>
                            <p class="text-slate-500 mt-1">Kelola harga dan item sampah (Total: ${catalog?.length || 0})</p>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button onclick="window.openCategoryModal()" class="bg-white border border-slate-200 hover:border-primary text-slate-700 px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer">
                                <span class="material-symbols-outlined">category</span> Kategori
                            </button>
                            <button onclick="window.openCatalogModal()" class="bg-primary hover:bg-[#0f5238] transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer">
                                <span class="material-symbols-outlined">add</span> Item Baru
                            </button>
                        </div>
                    </header>

                    <!-- Search & Filter Controls -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div class="md:col-span-2 relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input id="catalog-search" type="text" placeholder="Cari nama sampah..." class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value="${searchTerm}">
                        </div>
                        <div class="relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">filter_list</span>
                            <select id="catalog-filter" class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer">
                                <option value="all">Semua Kategori</option>
                                ${categories.map(c => `<option value="${c.id}" ${selectedCat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Items Grid -->
                    <div id="catalog-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-5">
                        <!-- Content will be injected here -->
                    </div>

                    <!-- Catalog Item Modal -->
                    <div id="catalog-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onclick="window.closeCatalogModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer">close</button>
                            <h3 id="modal-title" class="text-2xl font-black headline mb-6">Tambah Item</h3>
                            
                            <form id="catalog-form" class="space-y-4">
                                <input type="hidden" id="form-id">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Sampah</label>
                                    <input id="form-name" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Harga per Kg</label>
                                        <input type="number" id="form-price" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kategori</label>
                                        <select id="form-category" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                                            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Image URL</label>
                                    <input id="form-image" type="url" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none placeholder:text-slate-300" placeholder="https://...">
                                </div>
                                <div class="flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="form-popular" class="w-5 h-5 accent-primary rounded cursor-pointer">
                                    <label for="form-popular" class="text-sm font-bold text-slate-700 cursor-pointer">Tandai Populer</label>
                                </div>
                                
                                <div class="pt-4">
                                    <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-[#0f5238] transition-colors cursor-pointer">Simpan Item</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Category Modal -->
                    <div id="category-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onclick="window.closeCategoryModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer">close</button>
                            <h3 class="text-2xl font-black headline mb-6">Kelola Kategori</h3>
                            
                            <!-- List Categories -->
                            <div class="space-y-3 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                ${categories.map(c => `
                                    <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <span class="font-bold text-slate-700">${c.name}</span>
                                        <button onclick="window.deleteCategory('${c.id}')" class="text-red-400 hover:text-red-600 material-symbols-outlined text-sm cursor-pointer">delete</button>
                                    </div>
                                `).join('')}
                            </div>

                            <form id="category-form" class="space-y-4 pt-4 border-t border-slate-100">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nama Kategori Baru</label>
                                    <input id="cat-name" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Contoh: Logam, Kertas...">
                                </div>
                                <button type="submit" class="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-2">
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
            if(!confirm("Yakin ingin menghapus item ini? Transaksi yang terhubung mungkin akan bermasalah.")) return;
            
            try {
                await supabase.from('yari_waste_catalog').delete().eq('id', id);
                loadView(); 
            } catch (err) {
                alert('Gagal menghapus:' + err.message);
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
                alert("Gagal: " + err.message);
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
                alert("Gagal: " + err.message);
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });

        window.deleteCategory = async (id) => {
            if(!confirm("Yakin ingin menghapus kategori ini? Item yang menggunakan kategori ini mungkin terpengaruh.")) return;
            try {
                await supabase.from('yari_waste_categories').delete().eq('id', id);
                loadView();
            } catch (err) {
                alert('Gagal: ' + err.message);
            }
        };
    }

    await loadView();
}
