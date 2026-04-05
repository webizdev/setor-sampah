import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

let inventoryState = {
    period: 'daily',
    viewType: 'summary', // 'summary' or 'history'
    wasteId: 'all',
    records: [],
    catalog: [],
    stats: {
        totalIn: 0,
        totalOut: 0,
        netStock: 0
    }
};

export async function renderAdminInventory(container, path) {
    container.innerHTML = `
        <div class="flex min-h-screen bg-slate-50/50">
            ${getAdminSidebar(path)}
            <main class="flex-1 p-6 lg:p-10">
                <div id="inventory-content" class="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
                    <!-- Header Section -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <span class="material-symbols-outlined font-fill text-2xl">shelves</span>
                                </div>
                                <h1 class="headline font-black text-3xl text-slate-800 tracking-tight">Manajemen <span class="text-primary text-glow">Inventory</span></h1>
                            </div>
                            <p class="text-slate-500 font-medium ml-1">Lacak masuk dan keluar barang secara real-time.</p>
                        </div>
                        
                        <div class="flex items-center gap-3">
                            <button onclick="window.showInventoryModal('in')" class="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm active:scale-95">
                                <span class="material-symbols-outlined text-emerald-500">add_circle</span>
                                Tambah Supply
                            </button>
                            <button onclick="window.showInventoryModal('out')" class="flex items-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/30 transition-all shadow-lg active:scale-95">
                                <span class="material-symbols-outlined">shopping_cart</span>
                                Catat Penjualan
                            </button>
                        </div>
                    </div>

                    <!-- Stats Section -->
                    <div id="inventory-stats" class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
                            <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <span class="material-symbols-outlined font-fill text-3xl">download</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Barang Masuk</p>
                                <h3 id="stat-total-in" class="text-2xl font-black text-slate-800 tabular-nums">0 <span class="text-sm font-bold text-slate-400">kg</span></h3>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1">
                            <div class="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                <span class="material-symbols-outlined font-fill text-3xl">upload</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Barang Keluar</p>
                                <h3 id="stat-total-out" class="text-2xl font-black text-slate-800 tabular-nums">0 <span class="text-sm font-bold text-slate-400">kg</span></h3>
                            </div>
                        </div>
                        <div class="bg-primary p-6 rounded-[2.5rem] shadow-xl shadow-primary/20 flex items-center gap-5 transition-transform hover:-translate-y-1 border-b-4 border-primary-dark">
                            <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                                <span class="material-symbols-outlined font-fill text-3xl">inventory</span>
                            </div>
                            <div>
                                <p class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">Stok Saat Ini</p>
                                <h3 id="stat-net-stock" class="text-2xl font-black text-white tabular-nums">0 <span class="text-sm font-bold text-white/60">kg</span></h3>
                            </div>
                        </div>
                    </div>

                    <!-- Filter Section -->
                    <div class="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                                <button onclick="window.setInventoryPeriod('daily')" class="period-btn px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all" data-period="daily">Harian</button>
                                <button onclick="window.setInventoryPeriod('weekly')" class="period-btn px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all" data-period="weekly">Mingguan</button>
                                <button onclick="window.setInventoryPeriod('monthly')" class="period-btn px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all" data-period="monthly">Bulanan</button>
                            </div>

                            <div class="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

                            <div class="relative flex-grow md:flex-grow-0">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">category</span>
                                <select id="waste-type-filter" onchange="window.setInventoryWasteFilter(this.value)" class="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-full md:w-[240px]">
                                    <option value="all">Semua Jenis Barang</option>
                                </select>
                                <span class="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <!-- View Toggle -->
                        <div class="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl box-content border border-slate-100">
                            <button onclick="window.setInventoryViewType('summary')" id="view-summary-btn" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                                <span class="material-symbols-outlined text-[18px]">grid_view</span>
                                Ringkasan
                            </button>
                            <button onclick="window.setInventoryViewType('history')" id="view-history-btn" class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all">
                                <span class="material-symbols-outlined text-[18px]">history</span>
                                Riwayat
                            </button>
                        </div>
                    </div>

                    <!-- Table Section -->
                    <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
                        <div class="overflow-x-auto no-scrollbar">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50">
                                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Tanggal & Waktu</th>
                                        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Item Sampah</th>
                                        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Tipe Mutasi</th>
                                        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Kuantitas</th>
                                        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Partner (Suply/Jual)</th>
                                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-table-body" class="divide-y divide-slate-50 font-medium">
                                    <!-- Dynamic content -->
                                </tbody>
                            </table>
                        </div>
                        <div id="inventory-empty-state" class="hidden flex flex-col items-center justify-center py-20 text-slate-400">
                             <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <span class="material-symbols-outlined text-4xl text-slate-200">inventory_2</span>
                             </div>
                             <p class="font-bold text-slate-500">Belum ada catatan inventaris</p>
                             <p class="text-sm">Cobalah ubah filter atau tambahkan catatan baru.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        <!-- Inventory Modal -->
        <div id="inventory-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] hidden items-center justify-center p-6">
            <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 id="modal-title" class="headline font-black text-2xl text-slate-800">Catat Inventory</h2>
                        <p id="modal-subtitle" class="text-slate-500 text-sm font-medium mt-1">Lengkapi data stok barang.</p>
                    </div>
                    <button onclick="window.closeInventoryModal()" class="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form id="inventory-form" onsubmit="window.handleInventorySubmit(event)" class="p-8 pt-4 space-y-6">
                    <input type="hidden" id="inv-type" name="type">
                    
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Sampah / Item</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">category</span>
                            <select id="inv-waste-id" required class="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                                <option value="" disabled selected>Pilih item...</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Berat (Kg)</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">weight</span>
                                <input type="number" step="0.01" id="inv-qty" required placeholder="0.00" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Partner</label>
                            <div class="relative">
                                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-xl">person_pin_circle</span>
                                <input type="text" id="inv-partner" required placeholder="Nama PT / Pengepul" class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Tambahan</label>
                        <div class="relative">
                            <span class="absolute left-4 top-4 material-symbols-outlined text-slate-400 text-xl">notes</span>
                            <textarea id="inv-notes" rows="3" placeholder="Keterangan tambahan (opsional)..." class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"></textarea>
                        </div>
                    </div>

                    <button type="submit" id="inv-submit-btn" class="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-xl hover:shadow-primary/30 transition-all shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-3">
                        Simpan Catatan
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </form>
            </div>
        </div>
    `;

    // Initialize View
    initView();
}

async function initView() {
    updatePeriodButtons();
    await loadCatalog();
    await loadAllData();
}

function updatePeriodButtons() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        if (btn.dataset.period === inventoryState.period) {
            btn.classList.add('bg-white', 'text-primary', 'shadow-sm', 'font-black');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-white', 'text-primary', 'shadow-sm', 'font-black');
            btn.classList.add('text-slate-400');
        }
    });
}

async function loadCatalog() {
    const { data, error } = await supabase.from('yari_waste_catalog').select('id, name');
    if (!error) {
        inventoryState.catalog = data;
        const selectFilter = document.getElementById('waste-type-filter');
        const modalSelect = document.getElementById('inv-waste-id');
        
        data.forEach(item => {
            selectFilter.innerHTML += `<option value="${item.id}">${item.name}</option>`;
            modalSelect.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });
    }
}

async function loadAllData() {
    const periodStart = getPeriodStartDate();
    
    // 1. Fetch transactions (IN from community)
    let transQuery = supabase
        .from('yari_transactions')
        .select(`
            id, 
            created_at, 
            qty_kg, 
            status, 
            waste_id, 
            yari_waste_catalog(name),
            yari_users(full_name)
        `)
        .eq('status', 'completed')
        .gte('created_at', periodStart);
    
    if (inventoryState.wasteId !== 'all') {
        transQuery = transQuery.eq('waste_id', inventoryState.wasteId);
    }

    const { data: transData, error: transError } = await transQuery;

    // 2. Fetch manual inventory logs
    let logQuery = supabase
        .from('yari_inventory_log')
        .select(`
            id, 
            created_at, 
            qty_kg, 
            type, 
            partner_name, 
            notes, 
            waste_id, 
            yari_waste_catalog(name)
        `)
        .gte('created_at', periodStart);

    if (inventoryState.wasteId !== 'all') {
        logQuery = logQuery.eq('waste_id', inventoryState.wasteId);
    }

    const { data: logData, error: logError } = await logQuery;

    if (transError || logError) {
        console.error("Data fetch error", { transError, logError });
        return;
    }

    // Process and Combine
    const records = [
        ...(transData || []).map(t => ({
            id: t.id,
            date: t.created_at,
            waste_id: t.waste_id,
            itemName: t.yari_waste_catalog?.name || 'Unknown',
            type: 'in', // Community deposit is always IN
            typeLabel: 'IN (MEMBER)',
            qty: t.qty_kg,
            partner: t.yari_users?.full_name || 'Anonymous',
            source: 'transaction'
        })),
        ...(logData || []).map(l => ({
            id: l.id,
            date: l.created_at,
            waste_id: l.waste_id,
            itemName: l.yari_waste_catalog?.name || 'Unknown',
            type: l.type,
            typeLabel: l.type === 'in' ? 'IN (SUPPLY)' : 'OUT (SALE)',
            qty: l.qty_kg,
            partner: l.partner_name,
            source: 'log',
            notes: l.notes
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    inventoryState.records = records;
    calculateStats();
    renderTable();
}

function calculateStats() {
    let totalIn = 0;
    let totalOut = 0;
    
    inventoryState.records.forEach(r => {
        if (r.type === 'in') totalIn += Number(r.qty);
        else totalOut += Number(r.qty);
    });

    inventoryState.stats = {
        totalIn,
        totalOut,
        netStock: totalIn - totalOut
    };

    document.getElementById('stat-total-in').innerHTML = `${inventoryState.stats.totalIn.toFixed(2)} <span class="text-sm font-bold text-slate-400">kg</span>`;
    document.getElementById('stat-total-out').innerHTML = `${inventoryState.stats.totalOut.toFixed(2)} <span class="text-sm font-bold text-slate-400">kg</span>`;
    document.getElementById('stat-net-stock').innerHTML = `${inventoryState.stats.netStock.toFixed(2)} <span class="text-sm font-bold text-white/60">kg</span>`;
}

function renderTable() {
    updateViewButtons();
    const thead = document.querySelector('table thead tr');
    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('inventory-empty-state');
    
    tbody.innerHTML = '';

    if (inventoryState.records.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    if (inventoryState.viewType === 'summary') {
        renderSummaryTable(thead, tbody);
    } else {
        renderHistoryTable(thead, tbody);
    }
}

function updateViewButtons() {
    const summaryBtn = document.getElementById('view-summary-btn');
    const historyBtn = document.getElementById('view-history-btn');
    
    if (inventoryState.viewType === 'summary') {
        summaryBtn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-white text-primary shadow-sm border border-slate-100";
        historyBtn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-all";
    } else {
        historyBtn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-white text-primary shadow-sm border border-slate-100";
        summaryBtn.className = "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-all";
    }
}

function renderSummaryTable(thead, tbody) {
    thead.innerHTML = `
        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Jenis Barang</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Total Masuk (IN)</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Total Keluar (OUT)</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Stok Akhir</th>
        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Status</th>
    `;

    // Group logs by waste_id
    const summaryMap = {};
    inventoryState.records.forEach(r => {
        if (!summaryMap[r.waste_id]) {
            summaryMap[r.waste_id] = {
                name: r.itemName,
                in: 0,
                out: 0
            };
        }
        if (r.type === 'in') summaryMap[r.waste_id].in += Number(r.qty);
        else summaryMap[r.waste_id].out += Number(r.qty);
    });

    Object.values(summaryMap).sort((a,b) => b.in - a.in).forEach(item => {
        const net = item.in - item.out;
        const statusClass = net > 50 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           net > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                           'bg-red-50 text-red-600 border-red-100';
        const statusLabel = net > 50 ? 'STOCK AMAN' : net > 0 ? 'STOCK MENIPIS' : 'HABIS';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <span class="material-symbols-outlined text-[20px]">category</span>
                        </div>
                        <span class="text-slate-800 font-black uppercase tracking-tight">${item.name}</span>
                    </div>
                </td>
                <td class="px-6 py-6 text-center">
                    <div class="flex flex-col items-center">
                        <span class="text-emerald-600 font-black tabular-nums">${item.in.toFixed(2)}</span>
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">KG (IN)</span>
                    </div>
                </td>
                <td class="px-6 py-6 text-center">
                    <div class="flex flex-col items-center">
                        <span class="text-orange-500 font-black tabular-nums">${item.out.toFixed(2)}</span>
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">KG (OUT)</span>
                    </div>
                </td>
                <td class="px-6 py-6 text-right">
                    <div class="flex flex-col items-end">
                        <span class="text-slate-800 font-extrabold text-lg tabular-nums">${net.toFixed(2)}</span>
                        <span class="text-[10px] font-black text-slate-400 tracking-widest">KILOGRAM</span>
                    </div>
                </td>
                <td class="px-8 py-6 text-right">
                    <span class="px-3 py-1.5 text-[9px] font-black rounded-lg border-2 ${statusClass} uppercase tracking-wider">
                        ${statusLabel}
                    </span>
                </td>
            </tr>
        `;
    });
}

function renderHistoryTable(thead, tbody) {
    thead.innerHTML = `
        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Tanggal & Waktu</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Item Sampah</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Tipe Mutasi</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Kuantitas</th>
        <th class="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Partner (Suply/Jual)</th>
        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Aksi</th>
    `;

    inventoryState.records.forEach(record => {
        const date = new Date(record.date);
        const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const isOut = record.type === 'out';
        const typeClass = isOut 
            ? 'bg-orange-50 text-orange-600 border-orange-100' 
            : 'bg-emerald-50 text-emerald-600 border-emerald-100';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-5">
                    <div class="flex flex-col">
                        <span class="text-slate-800 font-bold">${dateStr}</span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${timeStr}</span>
                    </div>
                </td>
                <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-primary/40 animate-pulse"></div>
                        <span class="text-slate-700 font-extrabold uppercase text-xs">${record.itemName}</span>
                    </div>
                </td>
                <td class="px-6 py-5 text-center">
                    <span class="px-3 py-1 text-[10px] font-black rounded-lg border-2 ${typeClass} uppercase tracking-tighter">
                        ${record.typeLabel}
                    </span>
                </td>
                <td class="px-6 py-5">
                    <span class="text-slate-800 font-black tabular-nums">${Number(record.qty).toFixed(2)}</span>
                    <span class="text-[10px] font-black text-slate-400 ml-0.5">KG</span>
                </td>
                <td class="px-6 py-5">
                    <div class="flex flex-col">
                        <span class="text-slate-700 font-bold truncate max-w-[150px]">${record.partner}</span>
                        ${record.notes ? `<span class="text-[10px] text-slate-400 italic italic truncate max-w-[150px]">"${record.notes}"</span>` : ''}
                    </div>
                </td>
                <td class="px-8 py-5">
                    <div class="flex items-center gap-2">
                        ${record.source === 'log' ? `
                            <button onclick="window.deleteInventoryRecord('${record.id}')" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <span class="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        ` : `
                            <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Read Only</span>
                        `}
                    </div>
                </td>
            </tr>
        `;
    });
}

function getPeriodStartDate() {
    const now = new Date();
    if (inventoryState.period === 'daily') {
        const start = new Date(now);
        start.setHours(0,0,0,0);
        return start.toISOString();
    }
    if (inventoryState.period === 'weekly') {
        const start = new Date(now);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
        start.setDate(diff);
        start.setHours(0,0,0,0);
        return start.toISOString();
    }
    if (inventoryState.period === 'monthly') {
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
    return new Date(0).toISOString();
}

// Global Window Hooks for Interactivity
window.setInventoryViewType = (vt) => {
    inventoryState.viewType = vt;
    renderTable();
};

window.setInventoryPeriod = (p) => {
    inventoryState.period = p;
    updatePeriodButtons();
    loadAllData();
};

window.setInventoryWasteFilter = (vid) => {
    inventoryState.wasteId = vid;
    loadAllData();
};

window.showInventoryModal = (type) => {
    const modal = document.getElementById('inventory-modal');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const typeInput = document.getElementById('inv-type');
    
    typeInput.value = type;
    if (type === 'in') {
        title.innerHTML = 'Catat <span class="text-emerald-500">Barang Masuk</span>';
        subtitle.innerText = 'Gunakan untuk mencatat supply barang non-member.';
    } else {
        title.innerHTML = 'Catat <span class="text-orange-500">Penjualan</span>';
        subtitle.innerText = 'Gunakan untuk mencatat penjualan barang ke pabrik.';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeInventoryModal = () => {
    document.getElementById('inventory-modal').classList.add('hidden');
    document.getElementById('inventory-modal').classList.remove('flex');
    document.getElementById('inventory-form').reset();
};

window.handleInventorySubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('inv-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> Menyimpan...';

    const formData = new FormData(e.target);
    const payload = {
        type: formData.get('type'),
        waste_id: document.getElementById('inv-waste-id').value,
        qty_kg: Number(document.getElementById('inv-qty').value),
        partner_name: document.getElementById('inv-partner').value,
        notes: document.getElementById('inv-notes').value,
        created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('yari_inventory_log').insert(payload);

    if (error) {
        yariAlert('Gagal', "Gagal meminta data: " + error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = 'Simpan Catatan <span class="material-symbols-outlined">send</span>';
    } else {
        window.closeInventoryModal();
        await loadAllData();
        // Feedback Visual
        const cards = document.getElementById('inventory-stats');
        cards.classList.add('scale-105');
        setTimeout(() => cards.classList.remove('scale-105'), 500);
    }
};

window.deleteInventoryRecord = async (id) => {
    if (!(await yariConfirm("Hapus Data?", "Hapus catatan inventaris ini? Tindakan ini akan memengaruhi total stok."))) return;
    
    const { error } = await supabase.from('yari_inventory_log').delete().eq('id', id);
    if (error) {
        yariAlert('Gagal', "Gagal menghapus: " + error.message, 'error');
    } else {
        await loadAllData();
    }
};
