import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

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
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-6xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Laporan & <span class="text-primary">Konfirmasi</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Gabungan setoran sampah per user yang belum dikonfirmasi.</p>
                        </div>
                    </header>

                    <div class="max-w-6xl mx-auto">
                        <div class="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr class="bg-slate-50 text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px]">
                                            <th class="px-6 py-6">Pemasok (User)</th>
                                            <th class="px-6 py-6 text-right">Total Qty (Pending)</th>
                                            <th class="px-6 py-6 text-right">Total Nominal (Saldo)</th>
                                            <th class="px-6 py-6 text-center">Status Transaksi</th>
                                            <th class="px-6 py-6 text-center">Aksi Manager</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-50 text-sm">
                                        ${groupedReports.map(group => `
                                            <tr class="hover:bg-slate-50/50 transition-colors">
                                                <td class="px-6 py-6">
                                                    <div class="font-black text-slate-800 uppercase">${group.user_name}</div>
                                                    <div class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">${group.user_whatsapp}</div>
                                                </td>
                                                <td class="px-6 py-6 text-right font-black">
                                                    <span class="text-slate-700 text-lg">${group.total_qty.toFixed(1)}</span> <span class="text-[10px] text-slate-300 uppercase tracking-widest ml-1">Kg</span>
                                                </td>
                                                <td class="px-6 py-6 text-right">
                                                    <div class="text-lg font-black text-primary">Rp ${group.total_nominal.toLocaleString('id-ID')}</div>
                                                </td>
                                                <td class="px-6 py-6 text-center">
                                                    <span class="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest shadow-sm shadow-orange-100">Pending</span>
                                                </td>
                                                <td class="px-6 py-6 text-center">
                                                    <div class="flex items-center justify-center gap-3">
                                                        <button onclick="window.printReceipt('${group.user_id}')" class="text-slate-400 hover:text-slate-800 p-2.5 rounded-xl transition-all material-symbols-outlined cursor-pointer hover:bg-slate-100" title="Cetak Nota">print</button>
                                                        <button onclick="window.confirmGrouped('${group.user_id}')" class="bg-primary hover:bg-[#0f5238] text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-xl shadow-primary/20 transition-all cursor-pointer uppercase tracking-widest hover:-translate-y-1">
                                                            Konfirmasi
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                        
                                        ${groupedReports.length === 0 ? `
                                            <tr>
                                                <td colspan="5" class="px-6 py-24 text-center">
                                                    <span class="material-symbols-outlined text-7xl text-slate-200 mb-4 scale-150 opacity-50">task_alt</span>
                                                    <h4 class="text-lg font-black text-slate-400 uppercase tracking-widest leading-none">Semua Beres!</h4>
                                                    <p class="text-slate-400 mt-2 text-sm font-medium">Tidak ada setoran tertunda yang perlu dikonfirmasi.</p>
                                                </td>
                                            </tr>
                                        ` : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- Receipt Modal -->
                <div id="receipt-modal" class="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md hidden flex-col items-center justify-center p-4">
                    <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-0 overflow-hidden relative flex flex-col max-h-[90vh]">
                        <button onclick="window.closeReceiptModal()" class="absolute top-8 right-8 text-slate-400 hover:text-slate-800 material-symbols-outlined no-print cursor-pointer transition-colors z-10">close</button>
                        
                        <div id="receipt-content" class="p-10 md:p-12 flex-grow overflow-y-auto">
                            <!-- Receipt Content Loaded Dynamically -->
                        </div>
                        
                        <div class="bg-slate-50 py-8 px-10 flex gap-4 no-print border-t border-slate-100">
                            <button onclick="window.printContent()" class="flex-grow bg-slate-800 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest text-xs hover:-translate-y-1 shadow-xl shadow-slate-800/10">
                                <span class="material-symbols-outlined text-sm">print</span> Cetak Nota
                            </button>
                            <button onclick="window.closeReceiptModal()" class="px-8 bg-white border border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>

                <style>
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-modal, #receipt-modal #receipt-content { visibility: visible; display: block !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
                        #receipt-modal #receipt-content * { visibility: visible; }
                        .no-print { display: none !important; }
                        .rounded-[2.5rem] { border-radius: 0 !important; }
                        .shadow-2xl { shadow: none !important; }
                    }
                </style>
            </div>
        `;
        container.innerHTML = html;

        window.printReceipt = (userId) => {
            const group = groupedReports.find(g => g.user_id === userId);
            if (!group) return;

            const content = `
                <div class="text-center mb-10 border-b-2 border-slate-100 pb-8">
                    <h1 class="text-3xl font-black headline tracking-tight uppercase">YARI <span class="text-primary">SAMPAH</span></h1>
                    <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Nota Tanda Terima Setoran Resmi</p>
                </div>
                
                <div class="grid grid-cols-2 gap-8 mb-12 text-sm">
                    <div>
                        <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Pelanggan:</div>
                        <div class="font-black text-slate-800 text-lg uppercase">${group.user_name}</div>
                        <div class="text-slate-500 font-bold mt-1 uppercase tracking-wider text-xs">${group.user_whatsapp}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Ref No:</div>
                        <div class="font-bold text-slate-800">#${group.user_id.slice(0, 8).toUpperCase()}</div>
                        <div class="text-slate-400 text-xs mt-1 font-medium">${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                </div>

                <div class="space-y-6">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-slate-100">
                                <th class="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Rincian Materi</th>
                                <th class="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Massa</th>
                                <th class="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Potensi Hasil</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-50">
                            ${group.items.map(item => `
                                <tr>
                                    <td class="py-5">
                                        <div class="font-black text-slate-700 uppercase">${item.name}</div>
                                        <div class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">${item.date}</div>
                                    </td>
                                    <td class="py-5 text-right">
                                        <span class="font-black text-slate-800">${item.qty}</span> <span class="text-[10px] text-slate-400 uppercase font-black ml-1">Kg</span>
                                    </td>
                                    <td class="py-5 text-right font-black text-slate-800">
                                        Rp ${item.price.toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr class="border-t-2 border-slate-900/10">
                                <td colspan="2" class="py-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400">Total Reward Saldo</td>
                                <td class="py-8 text-right text-2xl font-black text-primary">Rp ${group.total_nominal.toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="text-center pt-10 border-t border-dashed border-slate-200 mt-4">
                    <p class="text-[12px] text-slate-400 font-medium leading-relaxed">Terima kasih telah berkontribusi nyata menjaga kelestarian lingkungan bersama kami!</p>
                    <p class="text-[9px] text-slate-300 mt-4 uppercase font-black tracking-[0.4em] opacity-50">&copy; YARI ECOSYSTEM 2026</p>
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
