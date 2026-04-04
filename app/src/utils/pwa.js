/**
 * PWA Utility for handling the install prompt.
 */

let deferredPrompt;

// 1. Listen for the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  console.log('PWA: beforeinstallprompt captured.');
});

// 2. Global function to show the promotion
window.showInstallPromotion = () => {
    // If prompt is not available, we can't show it (or user already installed)
    if (!deferredPrompt) {
        console.log('PWA: Install prompt not available.');
        return;
    }

    // Create Modal UI
    const modal = document.createElement('div');
    modal.id = 'pwa-install-modal';
    modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md opacity-0 transition-opacity duration-500';
    
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl transform scale-90 transition-transform duration-500" id="pwa-content">
            <div class="relative h-40 bg-primary flex items-center justify-center overflow-hidden">
                <!-- Decorative Circles -->
                <div class="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full"></div>
                <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                
                <div class="relative z-10 w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
                    <span class="material-symbols-outlined text-primary text-5xl font-black">install_mobile</span>
                </div>
            </div>
            
            <div class="p-8 text-center">
                <h3 class="headline text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight mb-3">Install YARI</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">Install aplikasi di layar utama HP Anda untuk akses lebih cepat dan mudah!</p>
                
                <div class="space-y-3">
                    <button id="pwa-install-btn" class="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 hover:brightness-110 transition-all active:scale-95">
                        Install Sekarang
                    </button>
                    <button onclick="window.closePwaModal()" class="w-full text-slate-400 dark:text-slate-500 py-3 text-xs font-bold uppercase tracking-widest hover:text-slate-600 transition-all">
                        Lain Kali Saja
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate In
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('pwa-content').classList.remove('scale-90');
    });

    // Handle Install Click
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
        window.closePwaModal();
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA: User choice outcome: ${outcome}`);
        deferredPrompt = null;
    });
};

window.closePwaModal = () => {
    const modal = document.getElementById('pwa-install-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        document.getElementById('pwa-content').classList.add('scale-90');
        setTimeout(() => modal.remove(), 500);
    }
};
