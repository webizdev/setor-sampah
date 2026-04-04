import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminTransactions(container, currentPath) {
    let searchTerm = '';

    async function loadView() {
        const { data: tx } = await supabase
            .from('yari_transactions')
            .select('*, yari_waste_catalog(name, price_per_kg), yari_users(full_name, whatsapp)')
            .order('created_at', { ascending: false });

        const { data: catalog } = await supabase
            .from('yari_waste_catalog')
            .select('*')
            .order('name');

        function renderTable() {
            const filteredTx = (tx || []).filter(t => 
                t.yari_users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.yari_waste_catalog?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            const tableBody = document.getElementById('tx-table-body');
            if (tableBody) {
                tableBody.innerHTML = filteredTx.map(t => `
                    <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-5 text-slate-500 whitespace-nowrap">${new Date(t.created_at).toLocaleString('id-ID')}</td>
                        <td class="p-5">
                            <div class="font-bold text-slate-800 whitespace-nowrap">${t.yari_users?.full_name || 'Hamba Allah'}</div>
                            <div class="text-[10px] text-slate-400 tracking-wider">${t.yari_users?.whatsapp || 'No WA'}</div>
                        </td>
                        <td class="p-5 text-slate-600 font-semibold">${t.yari_waste_catalog?.name || 'Item Dihapus'}</td>
                        <td class="p-5 text-slate-800 font-medium">${t.qty_kg} kg</td>
                        <td class="p-5 text-primary font-black whitespace-nowrap text-right">Rp ${t.total_price.toLocaleString('id-ID')}</td>
                        <td class="p-5 text-center flex items-center justify-center gap-1">
                            <button onclick="window.editTransaction('${t.id}')" class="text-slate-400 hover:text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors material-symbols-outlined cursor-pointer" title="Edit Transaksi">edit</button>
                            <button onclick="window.deleteTransaction('${t.id}')" class="text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors material-symbols-outlined cursor-pointer" title="Hapus Transaksi">delete</button>
                        </td>
                    </tr>
                `).join('') || `<tr><td colspan="6" class="p-12 text-center text-slate-400 block w-full">Transaksi tidak ditemukan.</td></tr>`;
            }
        }

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12 text-slate-800">
                ${getAdminTopNav(currentPath)}

                <main class="pt-8 px-6 max-w-6xl mx-auto">
                    <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight">Daftar Transaksi</h2>
                            <p class="text-slate-500 mt-1">Kelola riwayat setoran sampah dari masyarakat</p>
                        </div>
                        <div class="w-full md:w-72 relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input id="tx-search" type="text" placeholder="Cari nama pelanggan..." class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value="${searchTerm}">
                        </div>
                    </header>

                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm min-w-[700px]">
                                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th class="p-5">Tanggal</th>
                                        <th class="p-5">Pelanggan</th>
                                        <th class="p-5">Item Sampah</th>
                                        <th class="p-5">Kuantitas</th>
                                        <th class="p-5 text-right">Total</th>
                                        <th class="p-5 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="tx-table-body" class="divide-y divide-slate-100">
                                    <!-- Dynamic content -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <!-- Edit Transaction Modal -->
                <div id="tx-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 relative">
                        <button onclick="window.closeTxModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-800 material-symbols-outlined cursor-pointer">close</button>
                        <h3 class="text-2xl font-black headline mb-6">Edit Transaksi</h3>
                        
                        <form id="tx-form" class="space-y-4">
                            <input type="hidden" id="edit-tx-id">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Item Sampah</label>
                                <select id="edit-tx-waste" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                                    ${(catalog || []).map(c => `<option value="${c.id}" data-price="${c.price_per_kg}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Kuantitas (Kg)</label>
                                    <input type="number" id="edit-tx-qty" step="0.1" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Harga (Rp)</label>
                                    <input type="number" id="edit-tx-total" required class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                                </div>
                            </div>
                            <div class="pt-4">
                                <button type="submit" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-[#0f5238] transition-colors cursor-pointer">Update Transaksi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        renderTable();

        // Search Listener
        const searchInput = document.getElementById('tx-search');
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderTable();
        });

        // Logic for modal auto-calculation
        const wasteSelect = document.getElementById('edit-tx-waste');
        const qtyInput = document.getElementById('edit-tx-qty');
        const totalInput = document.getElementById('edit-tx-total');

        const calculateTotal = () => {
            const selectedOption = wasteSelect.options[wasteSelect.selectedIndex];
            const price = parseFloat(selectedOption?.dataset?.price || 0);
            const qty = parseFloat(qtyInput.value || 0);
            totalInput.value = Math.round(price * qty);
        };

        wasteSelect.addEventListener('change', calculateTotal);
        qtyInput.addEventListener('input', calculateTotal);

        window.editTransaction = (id) => {
            const t = tx.find(item => item.id === id);
            if(!t) return;
            
            document.getElementById('edit-tx-id').value = t.id;
            document.getElementById('edit-tx-waste').value = t.waste_id;
            document.getElementById('edit-tx-qty').value = t.qty_kg;
            document.getElementById('edit-tx-total').value = t.total_price;
            
            document.getElementById('tx-modal').classList.remove('hidden');
            document.getElementById('tx-modal').classList.add('flex');
        };

        window.closeTxModal = () => {
            document.getElementById('tx-modal').classList.remove('flex');
            document.getElementById('tx-modal').classList.add('hidden');
        };

        const form = document.getElementById('tx-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-tx-id').value;
            const payload = {
                waste_id: document.getElementById('edit-tx-waste').value,
                qty_kg: document.getElementById('edit-tx-qty').value,
                total_price: document.getElementById('edit-tx-total').value
            };

            try {
                const { error } = await supabase.from('yari_transactions').update(payload).eq('id', id);
                if(error) throw error;
                window.closeTxModal();
                loadView();
            } catch (err) {
                alert("Gagal update: " + err.message);
            }
        });

        window.deleteTransaction = async (id) => {
            if(!confirm("Yakin ingin menghapus jejak transaksi ini? Aksi tidak dapat dibatalkan.")) return;
            try {
                await supabase.from('yari_transactions').delete().eq('id', id);
                loadView();
            } catch (err) {
                alert("Gagal menghapus: " + err.message);
            }
        };
    }

    await loadView();
}
