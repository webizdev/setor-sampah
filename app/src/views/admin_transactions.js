import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminTransactions(container, currentPath) {
    async function loadView() {
        const { data: tx } = await supabase
            .from('yari_transactions')
            .select('*, yari_waste_catalog(name), yari_users(full_name, whatsapp)')
            .order('created_at', { ascending: false });

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12">
                ${getAdminTopNav(currentPath)}

                <main class="pt-8 px-6 max-w-6xl mx-auto">
                    <header class="mb-8">
                        <h2 class="text-3xl font-black headline text-slate-800 tracking-tight">Daftar Transaksi</h2>
                        <p class="text-slate-500 mt-1">Kelola riwayat setoran sampah dari masyarakat</p>
                    </header>

                    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm min-w-[700px]">
                                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th class="p-4">Tanggal</th>
                                        <th class="p-4">Pelanggan</th>
                                        <th class="p-4">Item Sampah</th>
                                        <th class="p-4">Kuantitas</th>
                                        <th class="p-4">Total</th>
                                        <th class="p-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${tx.map(t => `
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="p-4 text-slate-500 whitespace-nowrap">${new Date(t.created_at).toLocaleString('id-ID')}</td>
                                            <td class="p-4">
                                                <div class="font-bold text-slate-800 whitespace-nowrap">${t.yari_users?.full_name || 'Hamba Allah'}</div>
                                                <div class="text-[10px] text-slate-400 tracking-wider">${t.yari_users?.whatsapp || 'No WA'}</div>
                                            </td>
                                            <td class="p-4 text-slate-600 font-semibold">${t.yari_waste_catalog?.name || 'Item Dihapus'}</td>
                                            <td class="p-4 text-slate-800 font-medium">${t.qty_kg} kg</td>
                                            <td class="p-4 text-primary font-bold whitespace-nowrap">Rp ${t.total_price.toLocaleString('id-ID')}</td>
                                            <td class="p-4 text-center">
                                                <button onclick="window.deleteTransaction('${t.id}')" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors material-symbols-outlined cursor-pointer" title="Hapus Transaksi">delete</button>
                                            </td>
                                        </tr>
                                    `).join('') || `<tr><td colspan="6" class="p-8 text-center text-slate-400 block w-full">Belum ada transaksi.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

            </div>
        `;
        
        container.innerHTML = html;

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
