import { supabase } from '../supabase.js';
import { getAdminSidebar } from '../admin.js';
import { updateAllUserTiers } from '../utils/tier_engine.js';

export async function renderAdminMember(container, currentPath) {
    let searchTerm = '';

    async function loadView() {
        // Fetch all users
        const { data: users, error: userError } = await supabase
            .from('yari_users')
            .select('*')
            .order('full_name');

        // Fetch all pending transactions
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
                                    <div class="mt-2 flex items-center">
                                        <span class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            (user.tier || '').toUpperCase() === 'PRIORITAS' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            (user.tier || '').toUpperCase() === 'GOLD' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            (user.tier || '').toUpperCase() === 'SILVER' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                            'bg-orange-50 text-orange-600 border-orange-100'
                                        }">${user.tier || 'BRONZE'} MEMBER</span>
                                    </div>
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
                                    <button onclick="window.openPayoutModal('${user.id}', ${availableSaldo})" class="bg-slate-900 hover:bg-black text-white text-[10px] font-black px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/10 transition-all cursor-pointer uppercase tracking-widest hover:-translate-y-1">
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
                        <div class="flex items-center gap-3">
                            <div class="w-full md:w-80 relative group">
                                <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                                <input id="member-search" type="text" placeholder="Cari nama atau WhatsApp..." class="w-full bg-white border border-slate-100 rounded-[1.5rem] pl-14 pr-6 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm font-bold text-sm placeholder:text-slate-300" value="${searchTerm}">
                            </div>
                            <button id="btn-refresh-tiers" class="bg-primary/5 hover:bg-primary/10 text-primary p-4 rounded-2xl transition-all material-symbols-outlined cursor-pointer group" title="Segarkan Tier Seluruh Member">
                                <span class="group-hover:rotate-180 transition-transform duration-500 inline-block">cached</span>
                            </button>
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
                        <!-- ... (Other stats as before) -->
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
                                        <!-- Dynamic rows -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            
            <!-- Payout Modal Container -->
            <div id="payout-modal" class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300 flex items-center justify-center p-6 text-slate-800">
                <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl transform scale-95 transition-transform duration-300" id="payout-modal-content">
                    <div class="px-8 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 class="headline text-2xl font-black tracking-tight text-slate-800 uppercase">Konfirmasi <span class="text-primary">Pencairan</span></h3>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Langkah Terakhir Transfer</p>
                        </div>
                        <button onclick="window.closePayoutModal()" class="w-10 h-10 rounded-full hover:bg-slate-200 flex items-center justify-center transition-all cursor-pointer">
                            <span class="material-symbols-outlined text-slate-500">close</span>
                        </button>
                    </div>

                    <div class="p-8 space-y-6">
                        <!-- Member Info Details -->
                        <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nama Member</label>
                                    <div id="modal-member-name" class="font-bold text-slate-800 dark:text-slate-100">---</div>
                                </div>
                                <div>
                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Cair</label>
                                    <div id="modal-payout-amount" class="font-black text-primary text-lg">Rp 0</div>
                                </div>
                                <div class="col-span-2">
                                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tujuan Transfer (Bank)</label>
                                    <div id="modal-bank-info" class="font-bold text-slate-700 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100">---</div>
                                </div>
                            </div>
                        </div>

                        <!-- Receipt Upload -->
                        <div>
                           <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Bukti Transfer (Resi)</label>
                           <label for="payout-receipt" class="w-full border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all group overflow-hidden relative">
                                <input type="file" id="payout-receipt" accept="image/*" class="hidden">
                                <div id="receipt-preview-container" class="absolute inset-0 bg-white hidden">
                                    <img id="receipt-preview" class="w-full h-full object-contain">
                                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <span class="text-white text-xs font-bold uppercase tracking-widest">Ganti Gambar</span>
                                    </div>
                                </div>
                                <span class="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Klik untuk unggah foto resi</p>
                           </label>
                        </div>

                        <button id="payout-submit-btn" class="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                            <span>Sudah di Transfer</span>
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
        renderTable();

        // Modal State
        let currentUserId = null;
        let currentAmount = 0;
        let selectedFile = null;

        window.openPayoutModal = (userId, amount) => {
            currentUserId = userId;
            currentAmount = amount;
            const user = users.find(u => u.id === userId);

            document.getElementById('modal-member-name').innerText = user.full_name || '---';
            document.getElementById('modal-payout-amount').innerText = `Rp ${amount.toLocaleString('id-ID')}`;
            document.getElementById('modal-bank-info').innerText = `${user.bank_name || '---'} - ${user.bank_account || '---'}`;

            const modal = document.getElementById('payout-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            document.getElementById('payout-modal-content').classList.remove('scale-95');
        };

        window.closePayoutModal = () => {
            const modal = document.getElementById('payout-modal');
            modal.classList.add('opacity-0', 'pointer-events-none');
            document.getElementById('payout-modal-content').classList.add('scale-95');
            // Clear inputs
            selectedFile = null;
            document.getElementById('receipt-preview-container').classList.add('hidden');
            document.getElementById('payout-receipt').value = '';
        };

        // File Handler
        document.getElementById('payout-receipt')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedFile = file;
                const reader = new FileReader();
                reader.onload = (re) => {
                    const preview = document.getElementById('receipt-preview');
                    preview.src = re.target.result;
                    document.getElementById('receipt-preview-container').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        // Submit Handler
        document.getElementById('payout-submit-btn')?.addEventListener('click', async () => {
            if (!selectedFile) {
                alert('Tolong unggah bukti transfer (resi) terlebih dahulu!');
                return;
            }

            const btn = document.getElementById('payout-submit-btn');
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">autorenew</span> MEMPROSES...';

            try {
                const user = users.find(u => u.id === currentUserId);
                
                // 1. Upload to Storage
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `payout_${Date.now()}.${fileExt}`;
                const filePath = `payouts/${fileName}`;

                const { data: storageData, error: storageError } = await supabase.storage
                    .from('yari_assets')
                    .upload(filePath, selectedFile);

                if (storageError) throw storageError;

                const { data: { publicUrl } } = supabase.storage
                    .from('yari_assets')
                    .getPublicUrl(filePath);

                // 2. Update User Profile
                const { error: userError } = await supabase
                    .from('yari_users')
                    .update({
                        saldo: 0,
                        total_withdrawn: (parseFloat(user.total_withdrawn) || 0) + currentAmount
                    })
                    .eq('id', currentUserId);

                if (userError) throw userError;

                // 3. Insert History
                await supabase.from('yari_payout_history').insert([{
                    user_id: currentUserId,
                    full_name: user.full_name,
                    bank_name: user.bank_name,
                    bank_account: user.bank_account,
                    amount: currentAmount,
                    receipt_url: publicUrl
                }]);

                // 4. Send Notification to Member (Targeted)
                await supabase.from('yari_articles').insert([{
                    kategori: 'Layanan',
                    title: 'Pencairan Saldo Berhasil! ✓',
                    deskripsi: `Saldo Rp ${currentAmount.toLocaleString('id-ID')} telah dikirim ke rekening ${user.bank_name}. Terima kasih telah berkontribusi menjaga bumi!`,
                    is_notified: true,
                    notified_at: new Date().toISOString(),
                    image_url: publicUrl,
                    target_user_id: currentUserId
                }]);

                // Success
                btn.innerHTML = 'SUKSES ✓';
                btn.classList.replace('bg-slate-900', 'bg-green-500');

                setTimeout(() => {
                    window.closePayoutModal();
                    loadView();
                }, 1500);

            } catch (err) {
                console.error(err);
                alert('Error: ' + err.message);
                btn.disabled = false;
                btn.innerHTML = '<span>Sudah di Transfer</span><span class="material-symbols-outlined">send</span>';
            }
        });

        // Other handlers as before
        const searchInput = document.getElementById('member-search');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderTable();
            });
        }

        const refreshBtn = document.getElementById('btn-refresh-tiers');
        if(refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.classList.add('animate-spin');
                await updateAllUserTiers();
                refreshBtn.classList.remove('animate-spin');
                alert('Tier member diperbarui!');
                loadView();
            });
        }
    }

    await loadView();
}
