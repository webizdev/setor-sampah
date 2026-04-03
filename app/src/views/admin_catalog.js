import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminCatalog(container, currentPath) {
    async function loadView() {
        const { data: catalog } = await supabase
            .from('yari_waste_catalog')
            .select('*, yari_waste_categories(name)')
            .order('name');

        const { data: categories } = await supabase
            .from('yari_waste_categories')
            .select('*');

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-6xl mx-auto relative">
                    <header class="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline text-slate-800 tracking-tight">Catalog</h2>
                            <p class="text-slate-500 mt-1">Manage waste prices and items</p>
                        </div>
                        <button onclick="window.openCatalogModal()" class="bg-primary hover:bg-[#0f5238] transition-colors text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full md:w-auto">
                            <span class="material-symbols-outlined">add</span> Item Baru
                        </button>
                    </header>

                    <!-- Items Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        ${catalog.map(item => `
                            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group">
                                <div class="h-40 overflow-hidden relative bg-slate-100">
                                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                                    ${item.is_popular ? `<div class="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-primary shadow-sm">Populer</div>` : ''}
                                </div>
                                <div class="p-5 flex-1 flex flex-col">
                                    <div class="mb-2 uppercase text-[10px] tracking-widest font-bold text-slate-400">${item.yari_waste_categories?.name}</div>
                                    <h3 class="font-bold text-lg text-slate-800 mb-1">${item.name}</h3>
                                    <p class="text-primary font-black text-xl mt-auto">Rp ${item.price_per_kg.toLocaleString('id-ID')} <span class="text-xs font-bold text-slate-400">/Kg</span></p>
                                </div>
                                <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                                    <button onclick="window.editCatalogItem('${item.id}')" class="flex-1 bg-white border border-slate-200 hover:border-primary text-slate-700 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer">Edit</button>
                                    <button onclick="window.deleteCatalogItem('${item.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm transition-colors material-symbols-outlined shadow-sm cursor-pointer">delete</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Modal Backdrop & Window -->
                    <div id="catalog-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative max-h-[90vh] overflow-y-auto">
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
                </main>

            </div>
        `;
        container.innerHTML = html;

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
                loadView(); // reload local view
            } catch (err) {
                alert('Gagal menghapus:' + err.message);
            }
        };

        const form = document.getElementById('catalog-form');
        // Clear previous event listeners if any to prevent duplicated pushes
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
    }

    await loadView();
}
