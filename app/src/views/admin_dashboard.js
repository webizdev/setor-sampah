import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

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
        <div class="flex h-screen bg-slate-50 overflow-hidden">
            ${getAdminSidebar(currentPath)}

            <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                <header class="mb-8 max-w-6xl mx-auto">
                    <h2 class="text-3xl font-black headline text-slate-800 tracking-tight uppercase">Overview</h2>
                    <p class="text-slate-500 mt-1 font-medium opacity-70">Platform performance metrics & analytics</p>
                </header>

                <div class="max-w-6xl mx-auto">
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                <span class="material-symbols-outlined">payments</span>
                            </div>
                            <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Transaksi</p>
                            <h3 class="text-xl md:text-2xl font-black text-slate-800">Rp ${totalRev.toLocaleString('id-ID')}</h3>
                        </div>
                        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                <span class="material-symbols-outlined">scale</span>
                            </div>
                            <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Sampah</p>
                            <h3 class="text-xl md:text-2xl font-black text-slate-800">${totalKg.toLocaleString('id-ID')} Kg</h3>
                        </div>
                        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                                <span class="material-symbols-outlined">local_shipping</span>
                            </div>
                            <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pickups</p>
                            <h3 class="text-xl md:text-2xl font-black text-slate-800">${pickupsCount || 0}</h3>
                        </div>
                        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                                <span class="material-symbols-outlined">group</span>
                            </div>
                            <p class="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pengguna Actif</p>
                            <h3 class="text-xl md:text-2xl font-black text-slate-800">${usersCount || 0}</h3>
                        </div>
                    </div>

                    <!-- Recent Transactions -->
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 class="font-black text-slate-800 uppercase text-sm tracking-tight">Transaksi Terkini</h3>
                            <a href="#/transactions" class="text-primary text-xs font-black uppercase tracking-widest hover:underline">Lihat Semua</a>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-sm min-w-[600px]">
                                <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th class="p-5">Tanggal</th>
                                        <th class="p-5">Pelanggan</th>
                                        <th class="p-5">Sampah</th>
                                        <th class="p-5">Jumlah (Kg)</th>
                                        <th class="p-5">Total Harga</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    ${recentTx?.map(t => `
                                        <tr class="hover:bg-slate-50/80 transition-colors">
                                            <td class="p-5 text-slate-500">${new Date(t.created_at).toLocaleDateString('id-ID')}</td>
                                            <td class="p-5 font-bold text-slate-800">${t.yari_users?.full_name || 'Hamba Allah'}</td>
                                            <td class="p-5 text-slate-600 font-medium">${t.yari_waste_catalog?.name || 'Item Dihapus'}</td>
                                            <td class="p-5 text-slate-800 font-bold tracking-tighter">${t.qty_kg} kg</td>
                                            <td class="p-5 text-primary font-black">Rp ${t.total_price.toLocaleString('id-ID')}</td>
                                        </tr>
                                    `).join('') || `<tr><td colspan="5" class="p-12 text-center text-slate-400 font-medium">Belum ada transaksi di database.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    container.innerHTML = html;
}
