import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminDashboard(container, currentPath) {
    // Fetch stats
    const { count: usersCount } = await supabase.from('yari_users').select('*', { count: 'exact', head: true });
    const { count: pickupsCount } = await supabase.from('yari_pickups').select('*', { count: 'exact', head: true });
    
    // Sum transactions totals
    const { data: tx } = await supabase.from('yari_transactions').select('total_price, qty_kg');
    const totalRev = tx?.reduce((sum, item) => sum + (item.total_price || 0), 0) || 0;
    const totalKg = tx?.reduce((sum, item) => sum + (item.qty_kg || 0), 0) || 0;

    // Fetch recent 5 transactions
    const { data: recentTx } = await supabase
        .from('yari_transactions')
        .select('*, yari_waste_catalog(name), yari_users(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

    const html = `
        <div class="min-h-screen bg-slate-50 pb-12">
            ${getAdminTopNav(currentPath)}

            <main class="pt-8 px-6 max-w-6xl mx-auto">
                <header class="mb-8">
                    <h2 class="text-3xl font-black headline text-slate-800 tracking-tight">Overview</h2>
                    <p class="text-slate-500 mt-1">Platform performance metrics</p>
                </header>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                    <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">payments</span>
                        </div>
                        <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Transaksi</p>
                        <h3 class="text-xl md:text-2xl font-black text-slate-800">Rp ${totalRev.toLocaleString('id-ID')}</h3>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">scale</span>
                        </div>
                        <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sampah</p>
                        <h3 class="text-xl md:text-2xl font-black text-slate-800">${totalKg.toLocaleString('id-ID')} Kg</h3>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">local_shipping</span>
                        </div>
                        <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pickups</p>
                        <h3 class="text-xl md:text-2xl font-black text-slate-800">${pickupsCount || 0}</h3>
                    </div>
                    <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined">group</span>
                        </div>
                        <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pengguna Actif</p>
                        <h3 class="text-xl md:text-2xl font-black text-slate-800">${usersCount || 0}</h3>
                    </div>
                </div>

                <!-- Recent Transactions -->
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 class="font-bold text-slate-800">Transaksi Terkini</h3>
                        <a href="#/transactions" class="text-primary text-sm font-bold hover:underline">Lihat Semua</a>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-sm min-w-[600px]">
                            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th class="p-4">Tanggal</th>
                                    <th class="p-4">Pelanggan</th>
                                    <th class="p-4">Sampah</th>
                                    <th class="p-4">Jumlah (Kg)</th>
                                    <th class="p-4">Total Harga</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${recentTx.map(t => `
                                    <tr class="hover:bg-slate-50 transition-colors">
                                        <td class="p-4 text-slate-500">${new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                                        <td class="p-4 font-bold text-slate-800">${t.yari_users?.full_name || 'Hamba Allah'}</td>
                                        <td class="p-4 text-slate-600">${t.yari_waste_catalog?.name || 'Item Dihapus'}</td>
                                        <td class="p-4 text-slate-800 font-medium">${t.qty_kg} kg</td>
                                        <td class="p-4 text-primary font-bold">Rp ${t.total_price.toLocaleString('id-ID')}</td>
                                    </tr>
                                `).join('') || `<tr><td colspan="5" class="p-8 text-center text-slate-400">Belum ada transaksi.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `;

    container.innerHTML = html;
}
