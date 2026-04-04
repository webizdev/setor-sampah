import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';

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
                (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.whatsapp || '').includes(searchTerm)
            );

            const tableRows = filteredUsers.map(user => {
                const pendingSaldo = pendingMap[user.id] || 0;
                const availableSaldo = parseFloat(user.saldo || 0);
                const transferredSaldo = parseFloat(user.total_withdrawn || 0);

                return `
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-6 py-6 border-b border-slate-50">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-2xl bg-primary/10 overflow-hidden flex-shrink-0 border border-primary/5 p-0.5">
                                    <img src="${user.avatar_url || 'https://api.dicebear.com/7.x/beta-avatars/svg?seed=' + user.id}" class="w-full h-full object-cover rounded-xl">
                                </div>
                                <div>
                                    <div class="font-black text-slate-800 uppercase leading-none">${user.full_name || 'Tanpa Nama'}</div>
                                    <div class="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">${user.tier || 'BRONZE'} MEMBER</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-sm">
                            <a href="https://wa.me/${(user.whatsapp || '').replace(/\D/g, '')}" target="_blank" class="text-slate-500 hover:text-primary transition-all flex items-center gap-2 font-bold group">
                                <span class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">chat</span>
                                <span class="tracking-tight">${user.whatsapp || '-'}</span>
                            </a>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-center">
                            <div class="text-base font-black text-slate-800">${user.total_contribution_kg || 0}<span class="text-[10px] ml-1 opacity-40 uppercase">kg</span></div>
                            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Kontribusi</div>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-right">
                            <div class="text-xs font-black text-orange-500">Rp ${pendingSaldo.toLocaleString('id-ID')}</div>
                            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Pending</div>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-right">
                            <div class="text-base font-black text-primary">Rp ${availableSaldo.toLocaleString('id-ID')}</div>
                            <div class="text-[9px] font-bold text-primary/40 uppercase tracking-widest mt-1">Siap Cair</div>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-right">
                            <div class="text-xs font-black text-slate-400">Rp ${transferredSaldo.toLocaleString('id-ID')}</div>
                            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Tercairkan</div>
                        </td>
                        <td class="px-6 py-6 border-b border-slate-50 text-center">
                            <div class="flex justify-center">
                                ${availableSaldo > 0 ? `
                                    <button id="btn-transfer-${user.id}" onclick="window.markAsTransferred('${user.id}', ${availableSaldo})" class="bg-slate-900 hover:bg-black text-white text-[10px] font-black px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/10 transition-all cursor-pointer uppercase tracking-widest hover:-translate-y-1">
                                        Tandai Cair
                                    </button>
                                ` : (transferredSaldo > 0 ? `
                                    <div class="flex flex-col items-center">
                                        <span class="px-3 py-1.5 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-[0.15em] border border-green-100/50">Completed</span>
                                    </div>
                                ` : `
                                    <span class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] opacity-50">Zero Balance</span>
                                `)}
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            const tableBody = document.getElementById('member-table-body');
            if(tableBody) {
                tableBody.innerHTML = filteredUsers.length > 0 ? tableRows : `
                    <tr>
                        <td colspan="7" class="px-6 py-24 text-center">
                            <div class="flex flex-col items-center opacity-30">
                                <span class="material-symbols-outlined text-7xl mb-4">person_search</span>
                                <h4 class="text-lg font-black text-slate-400 uppercase tracking-widest">Member Tidak Ditemukan</h4>
                                <p class="text-sm font-medium mt-2">Coba gunakan kata kunci pencarian lain.</p>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }

        const html = `
            <div class="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
                ${getAdminSidebar(currentPath)}
                
                <main class="flex-1 overflow-y-auto pt-24 lg:pt-12 px-6 pb-12">
                    <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
                        <div>
                            <h2 class="text-3xl font-black headline tracking-tight uppercase">Manajemen <span class="text-primary">Member</span></h2>
                            <p class="text-slate-500 mt-1 font-medium opacity-70">Akses data pengguna dan monitoring real-time arus kas mereka.</p>
                        </div>
                        <div class="w-full md:w-80 relative group">
                            <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            <input id="member-search" type="text" placeholder="Cari nama atau WhatsApp..." class="w-full bg-white border border-slate-100 rounded-[1.5rem] pl-14 pr-6 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-bold text-sm placeholder:text-slate-300" value="${searchTerm}">
                        </div>
                    </header>

                    <!-- Summary Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-7xl mx-auto">
                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-4 -bottom-4 bg-slate-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Total Member
                            </div>
                            <div class="text-4xl font-black text-slate-900 tracking-tighter">
                                ${users?.length || 0} <span class="text-sm font-bold text-slate-300 uppercase tracking-widest ml-1">Jiwa</span>
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-4 -bottom-4 bg-orange-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                            <div class="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Total Pending
                            </div>
                            <div class="text-4xl font-black text-orange-600 tracking-tighter">
                                <span class="text-xl mr-0.5">Rp</span>${Object.values(pendingMap).reduce((a, b) => a + b, 0).toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-4 -bottom-4 bg-primary/5 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                            <div class="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-primary/40"></span> Total Siap Cair
                            </div>
                            <div class="text-4xl font-black text-primary tracking-tighter">
                                <span class="text-xl mr-0.5">Rp</span>${(users || []).reduce((a, b) => a + parseFloat(b.saldo || 0), 0).toLocaleString('id-ID')}
                            </div>
                        </div>
                        <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div class="absolute -right-4 -bottom-4 bg-emerald-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                            <div class="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Total Kontribusi
                            </div>
                            <div class="text-4xl font-black text-emerald-700 tracking-tighter">
                                ${(users || []).reduce((a, b) => a + (parseFloat(b.total_contribution_kg) || 0), 0).toFixed(1)} <span class="text-sm font-bold text-emerald-300 uppercase tracking-widest ml-1">kg</span>
                            </div>
                        </div>
                    </div>

                    <div class="max-w-7xl mx-auto">
                        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div class="overflow-x-auto">
                                <table class="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr class="bg-slate-50 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                                            <th class="px-6 py-6">Profil Member</th>
                                            <th class="px-6 py-6">Kanal WhatsApp</th>
                                            <th class="px-6 py-6 text-center">Total Kg</th>
                                            <th class="px-6 py-6 text-right">Potensi (Pending)</th>
                                            <th class="px-6 py-6 text-right">Saldo Dompet</th>
                                            <th class="px-6 py-6 text-right">Sudah Cair</th>
                                            <th class="px-6 py-6 text-center">Aksi Manajemen</th>
                                        </tr>
                                    </thead>
                                    <tbody id="member-table-body">
                                        <!-- Dynamic rows generated by renderTable() -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
        container.innerHTML = html;
        renderTable();

        // Search Logic
        const searchInput = document.getElementById('member-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderTable();
            });
        }

        window.markAsTransferred = async (userId, amount) => {
            if(!confirm(`Konfirmasi: Tandai saldo Rp ${amount.toLocaleString('id-ID')} sebagai telah ditransfer ke user? Saldo dompet akan di-reset ke Nol.`)) return;
            
            const btn = document.getElementById(`btn-transfer-${userId}`);
            if(btn) {
                btn.innerText = 'MEMPROSES...';
                btn.disabled = true;
                btn.classList.add('opacity-50');
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
                    btn.innerText = 'SUKSES ✓';
                    btn.classList.remove('bg-slate-900', 'hover:bg-black');
                    btn.classList.add('bg-green-500');
                }

                setTimeout(() => loadView(), 1000);
            } catch (err) {
                console.error(err);
                alert('Gagal memproses pencairan: ' + err.message);
                if(btn) {
                    btn.innerText = 'TANDAI CAIR';
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                }
            }
        };
    }

    await loadView();
}
