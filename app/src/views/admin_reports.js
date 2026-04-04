import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminReports(container, currentPath) {
    let groupedReports = [];

    async function loadView() {
        const { data: transactions, error } = await supabase
            .from('yari_transactions')
            .select('*, yari_users(full_name, whatsapp), yari_waste_catalog(name, price_per_kg)')
            .eq('status', 'pending') // Focus on items that need confirmation
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error loading reports", error);
        }

        // Grouping logic by User
        const groups = (transactions || []).reduce((acc, tx) => {
            const uid = tx.user_id;
            if (!acc[uid]) {
                acc[uid] = {
                    user_id: uid,
                    user_name: tx.yari_users?.full_name || 'Hamba Allah',
                    user_whatsapp: tx.yari_users?.whatsapp || '-',
                    total_nominal: 0,
                    total_qty: 0,
                    items: [],
                    tx_ids: []
                };
            }
            acc[uid].total_nominal += parseFloat(tx.total_price || 0);
            acc[uid].total_qty += parseFloat(tx.qty_kg || 0);
            acc[uid].tx_ids.push(tx.id);
            acc[uid].items.push({
                name: tx.yari_waste_catalog?.name || 'Item Dihapus',
                qty: tx.qty_kg,
                price: tx.total_price,
                date: new Date(tx.created_at).toLocaleDateString('id-ID')
            });
            return acc;
        }, {});

        groupedReports = Object.values(groups);

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12 text-slate-800">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-6xl mx-auto">
                    <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight">Laporan & Konfirmasi</h2>
                            <p class="text-slate-500 mt-1">Gabungan setoran sampah per user yang belum dikonfirmasi.</p>
                        </div>
                    </header>

                    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50 border-b border-slate-100">
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pemasok (User)</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Qty (Pending)</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Nominal (Saldo)</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50 text-sm">
                                    ${groupedReports.map(group => `
                                        <tr class="hover:bg-slate-50/50 transition-colors">
                                            <td class="px-6 py-5">
                                                <div class="font-bold text-slate-800">${group.user_name}</div>
                                                <div class="text-[10px] text-slate-400">${group.user_whatsapp}</div>
                                            </td>
                                            <td class="px-6 py-5 text-right font-medium">
                                                <span class="text-slate-700">${group.total_qty.toFixed(1)}</span> <span class="text-[10px] text-slate-300">Kg</span>
                                            </td>
                                            <td class="px-6 py-5 text-right">
                                                <div class="text-xs font-black text-primary">Rp ${group.total_nominal.toLocaleString('id-ID')}</div>
                                            </td>
                                            <td class="px-6 py-5 text-center">
                                                <span class="px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-wider">Pending</span>
                                            </td>
                                            <td class="px-6 py-5 text-center">
                                                <div class="flex items-center justify-center gap-2">
                                                    <button onclick="window.printReceipt('${group.user_id}')" class="text-slate-400 hover:text-slate-800 p-2 rounded-lg transition-colors material-symbols-outlined cursor-pointer" title="Cetak Nota">print</button>
                                                    <button onclick="window.confirmGrouped('${group.user_id}')" class="bg-primary hover:bg-[#0f5238] text-white text-[10px] font-black px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer">
                                                        Konfirmasi
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    
                                    ${groupedReports.length === 0 ? `
                                        <tr>
                                            <td colspan="5" class="px-6 py-16 text-center">
                                                <span class="material-symbols-outlined text-5xl text-slate-200 mb-2">history_edu</span>
                                                <p class="text-slate-400 font-medium tracking-tight">Semua setoran sudah dikonfirmasi.</p>
                                            </td>
                                        </tr>
                                    ` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>

                <!-- Receipt Modal -->
                <div id="receipt-modal" class="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm hidden flex-col items-center justify-center p-4">
                    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-0 overflow-hidden relative flex flex-col max-h-[90vh]">
                        <button onclick="window.closeReceiptModal()" class="absolute top-6 right-6 text-slate-400 hover:text-slate-800 material-symbols-outlined no-print cursor-pointer">close</button>
                        
                        <div id="receipt-content" class="p-10 flex-grow overflow-y-auto">
                            <!-- Receipt Content Loaded Dynamically -->
                        </div>
                        
                        <div class="bg-slate-50 p-6 flex gap-3 no-print border-t border-slate-100">
                            <button onclick="window.printContent()" class="flex-grow bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                <span class="material-symbols-outlined">print</span> Cetak Nota
                            </button>
                            <button onclick="window.closeReceiptModal()" class="px-6 bg-white border border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>

                <style>
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-modal, #receipt-modal #receipt-content { visibility: visible; display: block !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
                        #receipt-modal #receipt-content * { visibility: visible; }
                        .no-print { display: none !important; }
                    }
                </style>
            </div>
        `;
        container.innerHTML = html;

        window.printReceipt = (userId) => {
            const group = groupedReports.find(g => g.user_id === userId);
            if (!group) return;

            const content = `
                <div class="text-center mb-8 border-b-2 border-slate-100 pb-6">
                    <h1 class="text-2xl font-black headline tracking-tight">YARI SETOR SAMPAH</h1>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nota Tanda Terima Setoran</p>
                </div>
                
                <div class="grid grid-cols-2 gap-8 mb-10 text-sm">
                    <div>
                        <div class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Diberikan Kepada:</div>
                        <div class="font-black text-slate-800">${group.user_name}</div>
                        <div class="text-slate-500 font-medium">${group.user_whatsapp}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Tanggal Cetak:</div>
                        <div class="font-bold text-slate-800">${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                <table class="w-full text-left mb-10">
                    <thead>
                        <tr class="border-b-2 border-slate-800/10">
                            <th class="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rincian Item</th>
                            <th class="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Qty</th>
                            <th class="py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Nominal</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        ${group.items.map(item => `
                            <tr>
                                <td class="py-4">
                                    <div class="font-bold text-slate-700">${item.name}</div>
                                    <div class="text-[9px] text-slate-400">${item.date}</div>
                                </td>
                                <td class="py-4 text-right">
                                    <span class="font-bold text-slate-800">${item.qty}</span> <span class="text-[10px] text-slate-400">Kg</span>
                                </td>
                                <td class="py-4 text-right font-black text-slate-800">
                                    Rp ${item.price.toLocaleString('id-ID')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="border-t-2 border-slate-800/10">
                            <td colspan="2" class="py-6 text-sm font-black uppercase tracking-widest text-slate-400">Total Saldo</td>
                            <td class="py-6 text-right text-xl font-black text-primary">Rp ${group.total_nominal.toLocaleString('id-ID')}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="text-center pt-8 border-t border-dashed border-slate-200">
                    <p class="text-[11px] text-slate-400 italic">Terima kasih telah berkontribusi menjaga lingkungan!</p>
                    <p class="text-[9px] text-slate-300 mt-1 uppercase font-bold tracking-[0.2em]">&copy; YARI Application Ecosystem</p>
                </div>
            `;
            
            document.getElementById('receipt-content').innerHTML = content;
            document.getElementById('receipt-modal').classList.remove('hidden');
            document.getElementById('receipt-modal').classList.add('flex');
        };

        window.closeReceiptModal = () => {
            document.getElementById('receipt-modal').classList.remove('flex');
            document.getElementById('receipt-modal').classList.add('hidden');
        };

        window.printContent = () => {
            window.print();
        };

        window.confirmGrouped = async (userId) => {
            const group = groupedReports.find(g => g.user_id === userId);
            if (!group) return;

            if(!confirm(`Konfirmasi gabungan ${group.tx_ids.length} transaksi untuk ${group.user_name}? Saldo user akan bertambah Rp ${group.total_nominal.toLocaleString('id-ID')}`)) return;
            
            try {
                // Bulk Update Transactions
                const { error: txError } = await supabase
                    .from('yari_transactions')
                    .update({ status: 'completed' })
                    .in('id', group.tx_ids);
                
                if (txError) throw txError;

                // Update User Balance
                const { data: userData } = await supabase.from('yari_users').select('saldo, total_contribution_kg').eq('id', userId).single();
                
                const newSaldo = parseFloat(userData.saldo || 0) + group.total_nominal;
                const newContribution = parseFloat(userData.total_contribution_kg || 0) + group.total_qty;

                const { error: userError } = await supabase
                    .from('yari_users')
                    .update({ saldo: newSaldo, total_contribution_kg: newContribution })
                    .eq('id', userId);

                if (userError) throw userError;

                alert('Berhasil! Seluruh setoran user telah dikonfirmasi dan saldo diperbarui.');
                loadView();
            } catch (err) {
                console.error(err);
                alert('Gagal konfirmasi: ' + err.message);
            }
        };
    }

    await loadView();
}
