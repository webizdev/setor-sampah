import { supabase } from '../supabase.js';
import { getAdminTopNav } from '../admin.js';

export async function renderAdminMember(container, currentPath) {
    let searchTerm = '';

    async function loadView() {
        // Fetch all users
        const { data: users, error: userError } = await supabase
            .from('yari_users')
            .select('*')
            .order('full_name');

        // Fetch all pending transactions to calculate total pending per user
        const { data: pendingTxs, error: txError } = await supabase
            .from('yari_transactions')
            .select('user_id, total_price')
            .eq('status', 'pending');

        if (userError || txError) {
            console.error("Error loading member data", userError || txError);
        }

        const pendingMap = (pendingTxs || []).reduce((acc, tx) => {
            acc[tx.user_id] = (acc[tx.user_id] || 0) + parseFloat(tx.total_price);
            return acc;
        }, {});

        function renderTable() {
            const filteredUsers = (users || []).filter(u => 
                u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.whatsapp?.includes(searchTerm)
            );

            const tableRows = filteredUsers.map(user => {
                const pendingSaldo = pendingMap[user.id] || 0;
                const availableSaldo = parseFloat(user.saldo || 0);
                const transferredSaldo = parseFloat(user.total_withdrawn || 0);

                return `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                                    <img src="${user.avatar_url || 'https://via.placeholder.com/100'}" class="w-full h-full object-cover">
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800">${user.full_name}</div>
                                    <div class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">${user.tier || 'BRONZE'}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                            <a href="https://wa.me/${user.whatsapp?.replace(/\D/g, '')}" target="_blank" class="hover:text-primary transition-colors flex items-center gap-1">
                                <span class="material-symbols-outlined text-[16px]">chat</span> ${user.whatsapp || '-'}
                            </a>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="text-xs font-bold text-orange-500">Rp ${pendingSaldo.toLocaleString('id-ID')}</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="text-xs font-black text-primary">Rp ${availableSaldo.toLocaleString('id-ID')}</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="text-xs font-bold text-slate-400">Rp ${transferredSaldo.toLocaleString('id-ID')}</div>
                        </td>
                        <td class="px-6 py-4 text-center">
                            ${availableSaldo > 0 ? `
                                <button id="btn-transfer-${user.id}" onclick="window.markAsTransferred('${user.id}', ${availableSaldo})" class="bg-slate-800 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm transition-all cursor-pointer">
                                    Tandai Cair
                                </button>
                            ` : (transferredSaldo > 0 ? `
                                <span class="bg-green-50 text-green-600 text-[10px] font-black px-3 py-2 rounded-lg uppercase tracking-wider">Sudah di Transfer</span>
                            ` : `
                                <span class="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Tidak ada saldo</span>
                            `)}
                        </td>
                    </tr>
                `;
            }).join('');

            document.getElementById('member-table-body').innerHTML = filteredUsers.length > 0 ? tableRows : `
                <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                        <span class="material-symbols-outlined text-4xl mb-2 opacity-20">person_search</span>
                        <p class="text-sm font-medium">Member tidak ditemukan.</p>
                    </td>
                </tr>
            `;
        }

        const html = `
            <div class="min-h-screen bg-slate-50 pb-12 text-slate-800">
                ${getAdminTopNav(currentPath)}
                
                <main class="pt-8 px-6 max-w-6xl mx-auto">
                    <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight">Manajemen Member</h2>
                            <p class="text-slate-500 mt-1">Daftar pengguna dan status keuangan mereka.</p>
                        </div>
                        <div class="w-full md:w-72 relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input id="member-search" type="text" placeholder="Cari nama member..." class="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" value="${searchTerm}">
                        </div>
                    </header>

                    <!-- Summary Cards -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Total Member</div>
                            <div class="text-3xl font-black text-slate-800">${users?.length || 0}</div>
                        </div>
                        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div class="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mb-2">Total Pending</div>
                            <div class="text-3xl font-black text-orange-500">Rp ${Object.values(pendingMap).reduce((a, b) => a + b, 0).toLocaleString('id-ID')}</div>
                        </div>
                        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <div class="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Total Siap Cair</div>
                            <div class="text-3xl font-black text-primary">Rp ${(users || []).reduce((a, b) => a + parseFloat(b.saldo || 0), 0).toLocaleString('id-ID')}</div>
                        </div>
                    </div>

                    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left border-collapse">
                                <thead>
                                    <tr class="bg-slate-50/50 border-b border-slate-100">
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Member</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">WhatsApp</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Saldo Pending</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Belum Transfer</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Sudah Transfer</th>
                                        <th class="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="member-table-body" class="divide-y divide-slate-50">
                                    <!-- Dynamic rows -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;
        renderTable();

        // Search Logic
        const searchInput = document.getElementById('member-search');
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderTable();
        });

        window.markAsTransferred = async (userId, amount) => {
            if(!confirm(`Tandai saldo Rp ${amount.toLocaleString('id-ID')} sebagai telah ditransfer (cair) ke user ini? Saldo utama user akan dikosongkan.`)) return;
            
            const btn = document.getElementById(`btn-transfer-${userId}`);
            if(btn) {
                btn.innerText = 'Memproses...';
                btn.disabled = true;
            }

            try {
                const user = users.find(u => u.id === userId);
                const currentTransferred = parseFloat(user.total_withdrawn || 0);

                const { error } = await supabase
                    .from('yari_users')
                    .update({ 
                        saldo: 0,
                        total_withdrawn: currentTransferred + parseFloat(amount)
                    })
                    .eq('id', userId);
                
                if (error) throw error;
                
                if(btn) {
                    btn.innerText = 'Cair ✓';
                    btn.classList.replace('bg-slate-800', 'bg-green-500');
                }

                alert('Berhasil menandai saldo telah cair.');
                loadView();
            } catch (err) {
                console.error(err);
                alert('Gagal: ' + err.message);
                if(btn) {
                    btn.innerText = 'Tandai Cair';
                    btn.disabled = false;
                }
            }
        };
    }

    await loadView();
}
