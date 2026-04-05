/**
 * YARI Elegant Modal System
 * Provides beautiful, non-blocking replacements for alert() and confirm().
 */

export const initModals = () => {
    if (document.getElementById('yari-modal-container')) return;
    
    const container = document.createElement('div');
    container.id = 'yari-modal-container';
    container.className = 'fixed inset-0 z-[10000] pointer-events-none flex items-center justify-center p-6';
    document.body.appendChild(container);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes yari-modal-in {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes yari-modal-out {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to { opacity: 0; transform: scale(0.95) translateY(10px); }
        }
        @keyframes yari-progress {
            from { width: 100%; }
            to { width: 0%; }
        }
        .yari-modal-animate-in { animation: yari-modal-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .yari-modal-animate-out { animation: yari-modal-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `;
    document.head.appendChild(style);
};

export const yariAlert = (title, message, type = 'success', timeout = 3500) => {
    initModals();
    const container = document.getElementById('yari-modal-container');
    container.classList.remove('pointer-events-none');

    const modalId = `modal-${Date.now()}`;
    const themes = {
        success: { icon: 'check_circle', color: 'text-emerald-500', bgIcon: 'bg-emerald-50', btn: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' },
        error: { icon: 'error', color: 'text-rose-500', bgIcon: 'bg-rose-50', btn: 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' },
        warning: { icon: 'warning', color: 'text-orange-500', bgIcon: 'bg-orange-50', btn: 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' },
        info: { icon: 'info', color: 'text-blue-500', bgIcon: 'bg-blue-50', btn: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' }
    };

    const theme = themes[type] || themes.info;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto';
    
    modal.innerHTML = `
        <div class="bg-white/90 backdrop-blur-xl dark:bg-slate-900/90 w-full max-w-[340px] rounded-[1.75rem] p-6 shadow-2xl yari-modal-animate-in border border-white/40 dark:border-slate-800 relative overflow-hidden">
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 ${theme.bgIcon} rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined ${theme.color} text-2xl">${theme.icon}</span>
                </div>
                <div class="flex-1 pt-0.5">
                    <h3 class="text-lg font-black text-slate-800 dark:text-slate-100 mb-1 uppercase tracking-tight leading-tight">${title}</h3>
                    <p class="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">${message}</p>
                </div>
            </div>
            
            <div class="mt-6 flex justify-end">
                <button id="${modalId}-btn" class="px-6 py-2.5 ${theme.btn} text-white font-black rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest text-[10px] cursor-pointer">
                    OK
                </button>
            </div>

            ${timeout ? `
                <div class="absolute bottom-0 left-0 h-1 ${theme.bgIcon} opacity-30 w-full">
                    <div class="h-full ${theme.color.replace('text-', 'bg-')}" style="animation: yari-progress ${timeout}ms linear forwards;"></div>
                </div>
            ` : ''}
        </div>
    `;

    container.appendChild(modal);
    requestAnimationFrame(() => modal.classList.remove('opacity-0'));

    const closeModal = () => {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.replace('yari-modal-animate-in', 'yari-modal-animate-out');
        setTimeout(() => {
            modal.remove();
            if (container.children.length === 0) container.classList.add('pointer-events-none');
        }, 300);
    };

    document.getElementById(`${modalId}-btn`).onclick = closeModal;
    if (timeout) setTimeout(closeModal, timeout);
};

export const yariConfirm = (title, message) => {
    return new Promise((resolve) => {
        initModals();
        const container = document.getElementById('yari-modal-container');
        container.classList.remove('pointer-events-none');

        const modalId = `confirm-${Date.now()}`;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-md opacity-0 transition-opacity duration-300 pointer-events-auto';
        
        modal.innerHTML = `
            <div class="bg-white/95 backdrop-blur-2xl dark:bg-slate-900/95 w-full max-w-[360px] rounded-[2rem] p-7 shadow-2xl yari-modal-animate-in border border-white/20 dark:border-slate-800">
                <div class="flex items-start gap-5">
                    <div class="w-12 h-12 bg-orange-50 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm">
                        <span class="material-symbols-outlined text-orange-500 text-3xl">help</span>
                    </div>
                    <div class="flex-1 pt-1">
                        <h3 class="text-xl font-black text-slate-800 dark:text-slate-100 mb-1.5 uppercase tracking-tight leading-tight">${title}</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">${message}</p>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 mt-8">
                    <button id="${modalId}-cancel" class="px-5 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all uppercase tracking-widest text-[9px] cursor-pointer">
                        Batal
                    </button>
                    <button id="${modalId}-confirm" class="px-7 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 hover:-translate-y-1 transition-all active:translate-y-0 uppercase tracking-widest text-[9px] cursor-pointer">
                        Lanjutkan
                    </button>
                </div>
            </div>
        `;

        container.appendChild(modal);
        requestAnimationFrame(() => modal.classList.remove('opacity-0'));

        const handleAction = (result) => {
            modal.classList.add('opacity-0');
            modal.firstElementChild.classList.replace('yari-modal-animate-in', 'yari-modal-animate-out');
            setTimeout(() => {
                modal.remove();
                if (container.children.length === 0) {
                    container.classList.add('pointer-events-none');
                }
                resolve(result);
            }, 300);
        };

        document.getElementById(`${modalId}-confirm`).onclick = () => handleAction(true);
        document.getElementById(`${modalId}-cancel`).onclick = () => handleAction(false);
        modal.onclick = (e) => { if(e.target === modal) handleAction(false); };
    });
};

export const yariPrompt = (title, message, placeholder = '...', isPassword = false) => {
    return new Promise((resolve) => {
        initModals();
        const container = document.getElementById('yari-modal-container');
        container.classList.remove('pointer-events-none');

        const modalId = `prompt-${Date.now()}`;
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-md opacity-0 transition-opacity duration-300 pointer-events-auto';
        
        modal.innerHTML = `
            <div class="bg-white/95 backdrop-blur-2xl dark:bg-slate-900/95 w-full max-w-[360px] rounded-[2rem] p-7 shadow-2xl yari-modal-animate-in border border-white/20 dark:border-slate-800">
                <div class="flex items-start gap-5 mb-6">
                    <div class="w-12 h-12 bg-primary/10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm">
                        <span class="material-symbols-outlined text-primary text-3xl">key</span>
                    </div>
                    <div class="flex-1 pt-1">
                        <h3 class="text-xl font-black text-slate-800 dark:text-slate-100 mb-1.5 uppercase tracking-tight leading-tight">${title}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">${message}</p>
                    </div>
                </div>
                
                <div class="mb-8">
                    <input id="${modalId}-input" 
                           type="${isPassword ? 'password' : 'text'}" 
                           placeholder="${placeholder}"
                           class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-800 dark:text-white"
                    />
                </div>
                
                <div class="flex justify-end gap-3">
                    <button id="${modalId}-cancel" class="px-5 py-3 text-slate-400 hover:text-slate-600 font-bold transition-all uppercase tracking-widest text-[9px] cursor-pointer">
                        Batal
                    </button>
                    <button id="${modalId}-confirm" class="px-8 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 hover:-translate-y-1 transition-all active:translate-y-0 uppercase tracking-widest text-[10px] cursor-pointer">
                        Konfirmasi
                    </button>
                </div>
            </div>
        `;

        container.appendChild(modal);
        requestAnimationFrame(() => modal.classList.remove('opacity-0'));

        const input = document.getElementById(`${modalId}-input`);
        setTimeout(() => input.focus(), 100);

        const handleAction = (result) => {
            const value = result ? input.value : null;
            modal.classList.add('opacity-0');
            if (modal.firstElementChild) {
                modal.firstElementChild.classList.replace('yari-modal-animate-in', 'yari-modal-animate-out');
            }
            setTimeout(() => {
                modal.remove();
                if (container.children.length === 0) {
                    container.classList.add('pointer-events-none');
                }
                resolve(value);
            }, 300);
        };

        document.getElementById(`${modalId}-confirm`).onclick = () => handleAction(true);
        document.getElementById(`${modalId}-cancel`).onclick = () => handleAction(false);
        input.onkeydown = (e) => { if(e.key === 'Enter') handleAction(true); if(e.key === 'Escape') handleAction(false); };
        modal.onclick = (e) => { if(e.target === modal) handleAction(false); };
    });
};

// Global Exposure for simpler integration
window.yariAlert = yariAlert;
window.yariConfirm = yariConfirm;
window.yariPrompt = yariPrompt;
