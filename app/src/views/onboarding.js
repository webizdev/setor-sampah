import { supabase } from '../supabase.js';

export function renderOnboarding(container) {
    const html = `
        <div class="bg-surface font-body text-on-surface selection:bg-secondary-container min-h-screen">
            <style>
                .nav-link {
                    position: relative;
                    transition: all 0.3s ease;
                }
                nav .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 3px;
                    background-color: #f9b17a; /* tertiary/orange */
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 99px;
                    opacity: 0;
                }
                nav .nav-link:hover::after, nav .nav-link.active::after {
                    width: 100%;
                    opacity: 1;
                }
                nav .nav-link:hover, nav .nav-link.active {
                    color: var(--md-sys-color-primary, #0f5238) !important;
                }

                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 50s linear infinite;
                    display: flex;
                    width: max-content;
                }
                .pause-on-hover:hover .animate-marquee {
                    animation-play-state: paused;
                }
            </style>
            <!-- TopNavBar -->
            <nav class="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-surface-variant">
                <div class="flex justify-between items-center px-6 lg:px-12 py-4 lg:py-6 max-w-screen-2xl mx-auto">
                    <div class="text-2xl font-black text-primary tracking-tighter font-headline flex items-center gap-2">
                        <span class="material-symbols-outlined text-3xl">recycling</span>
                        YARI
                    </div>
                    <div class="hidden md:flex items-center gap-10">
                        <a class="nav-link font-headline uppercase tracking-widest text-sm font-bold" href="#home">Beranda</a>
                        <a class="nav-link font-headline uppercase tracking-widest text-sm font-bold text-on-surface-variant hover:text-primary transition-all duration-300" href="#layanan-section">Layanan</a>
                        <a class="nav-link font-headline uppercase tracking-widest text-sm font-bold text-on-surface-variant hover:text-primary transition-all duration-300" href="#katalog-section">Katalog</a>
                        <a class="nav-link font-headline uppercase tracking-widest text-sm font-bold text-on-surface-variant hover:text-primary transition-all duration-300" href="#footer-section">Tentang Kami</a>
                    </div>
                    <a href="#/home" class="bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold text-sm tracking-wide hover:brightness-110 transition-all active:scale-95 flex items-center gap-2">
                        <span>Masuk Aplikasi</span>
                        <span class="material-symbols-outlined text-sm">login</span>
                    </a>
                </div>
            </nav>

            <main id="home" class="pt-0">
                <!-- Hero Section - Full Width Background -->
                <section class="relative w-full bg-gradient-to-br from-primary-fixed to-surface-container-low overflow-hidden pt-28 lg:pt-48 pb-16 lg:pb-40">
                    <div class="px-6 lg:px-12 max-w-screen-2xl mx-auto grid md:grid-cols-12 gap-12 items-center">
                    <div class="md:col-span-7 z-10">
                        <span class="inline-block py-1.5 px-4 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-headline tracking-widest uppercase mb-6 shadow-sm">Waste to Wealth Ecosystem</span>
                        <h1 class="text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold text-primary leading-[1] tracking-tighter mb-8">Ubah Sampah Jadi Berkah.</h1>
                        <p class="text-lg lg:text-xl text-on-surface-variant max-w-xl mb-10 leading-relaxed font-medium">
                            Solusi cerdas kelola limbah rumah tangga. Dapatkan penghasilan tambahan dan menangkan reward eksklusif untuk setiap kontribusi hijau Anda.
                        </p>
                        <div class="flex flex-wrap gap-4">
                            <a href="#/home" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-headline font-bold text-base shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center gap-2">
                                <span>Mulai Sekarang</span>
                                <span class="material-symbols-outlined">arrow_forward</span>
                            </a>
                            <a href="#layanan-section" class="border-2 border-primary text-primary px-8 py-4 rounded-xl font-headline font-bold text-base hover:bg-primary/5 transition-all">
                                Pelajari Sistem
                            </a>
                        </div>
                    </div>
                    <div class="md:col-span-5 relative flex justify-center lg:justify-end">
                        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 lg:w-96 lg:h-96 bg-secondary-fixed opacity-30 rounded-full blur-3xl"></div>
                        <div class="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(15,82,56,0.2)] border-8 border-white max-w-[280px] md:max-w-[320px] aspect-[9/19] w-full mx-auto lg:ml-auto perspective-[1000px]">
                            <!-- Slides: jcSlider Carousel -->
                            <img alt="Slide 1" class="hero-slide absolute top-0 left-0 w-full h-full object-contain bg-white transition-all duration-1000 ease-in-out z-10 opacity-100 scale-100" src="images/home.png" />
                            <img alt="Slide 2" class="hero-slide absolute top-0 left-0 w-full h-full object-contain bg-white transition-all duration-1000 ease-in-out z-0 opacity-0 scale-100" src="images/beli.png" />
                            <img alt="Slide 3" class="hero-slide absolute top-0 left-0 w-full h-full object-contain bg-white transition-all duration-1000 ease-in-out z-0 opacity-0 scale-100" src="images/layanan.png" />
                            <img alt="Slide 4" class="hero-slide absolute top-0 left-0 w-full h-full object-contain bg-white transition-all duration-1000 ease-in-out z-0 opacity-0 scale-100" src="images/profile.png" />
                            <img alt="Slide 5" class="hero-slide absolute top-0 left-0 w-full h-full object-contain bg-white transition-all duration-1000 ease-in-out z-0 opacity-0 scale-100" src="images/maps.png" />
                        </div>
                    </div>
                </div>
            </section>

                <!-- Layanan / Services Section -->
                <section id="layanan-section" class="py-16 md:py-24 px-6 lg:px-12 max-w-7xl mx-auto">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-6">Layanan Kelola Sampah Cerdas</h2>
                        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
                            Solusi lengkap dari penjemputan hingga penjualan daur ulang yang dirancang khusus untuk kenyamanan ekosistem Anda.
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Service 1: Penjemputan -->
                        <div class="bg-surface-container rounded-[2rem] p-8 lg:p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl group">
                            <div class="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-3xl text-on-primary-fixed">local_shipping</span>
                            </div>
                            <h3 class="text-2xl font-headline font-bold text-primary mb-4">Penjemputan Langsung</h3>
                            <p class="text-on-surface-variant leading-relaxed">
                                Pesan jadwal penjemputan dari rumah. Tim kurir tangkas kami akan mengambil sampah daur ulang Anda dengan timbangan transparan.
                            </p>
                        </div>
                        
                        <!-- Service 2: Drop-off -->
                        <div class="bg-surface-variant rounded-[2rem] p-8 lg:p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl group">
                            <div class="w-16 h-16 bg-secondary-fixed rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-3xl text-on-secondary-fixed">storefront</span>
                            </div>
                            <h3 class="text-2xl font-headline font-bold text-primary mb-4">Drop-off Terdekat</h3>
                            <p class="text-on-surface-variant leading-relaxed">
                                Setorkan langsung komoditas Anda ke mitra pengepul terverifikasi dalam jaringan terdekat untuk proses penjualan instan dan mandiri.
                            </p>
                        </div>

                        <!-- Service 3: Komunitas -->
                        <div class="bg-surface-container rounded-[2rem] p-8 lg:p-10 hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl group">
                            <div class="w-16 h-16 bg-tertiary-fixed rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-3xl text-on-tertiary-fixed">volunteer_activism</span>
                            </div>
                            <h3 class="text-2xl font-headline font-bold text-primary mb-4">Aksi Ekosistem & CSR</h3>
                            <p class="text-on-surface-variant leading-relaxed">
                                Terlibatlah dalam misi donasi, tukar poin dengan hadiah, pelatihan daur ulang mandiri, dan bangun gaya hidup ramah lingkungan sesungguhnya.
                            </p>
                        </div>
                    </div>
                </section>

                <style>
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                </style>

                <!-- Katalog Section -->
                <section id="katalog-section" class="py-16 md:py-24 px-0 max-w-7xl mx-auto overflow-hidden pause-on-hover">
                    <div class="px-6 lg:px-12 text-center mb-12">
                        <h2 class="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-6">Katalog Harga Real-time</h2>
                        <p class="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
                            Pantau harga komoditas daur ulang terbaru yang langsung terhubung dengan dasbor pusat secara transparan.
                        </p>
                    </div>
                    
                    <div id="katalog-slider" class="flex h-80 items-center no-scrollbar">
                        <!-- Dynamic Catalog Items -->
                    </div>
                </section>

                <!-- Value Proposition - Bento Grid -->
                <section id="fitur-section" class="py-16 md:py-24 px-6 lg:px-12 max-w-screen-2xl mx-auto">
                    <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div class="max-w-2xl">
                            <h2 class="text-4xl lg:text-5xl font-headline font-extrabold text-primary tracking-tighter mb-4">Fitur Premium untuk Gaya Hidup Hijau.</h2>
                            <p class="text-on-surface-variant text-lg font-medium">Kami menyediakan ekosistem terpadu dari penjemputan hingga penjualan daur ulang.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <!-- Large Card - Maps/Pick-up -->
                        <div class="md:col-span-2 md:row-span-2 bg-primary text-on-primary p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between min-h-[300px] md:min-h-[400px] group transition-all duration-500 hover:shadow-2xl">
                            <div class="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-bl-[100%] opacity-50 transition-transform group-hover:scale-110 duration-500"></div>
                            
                            <!-- Large decorative icon background -->
                            <span class="material-symbols-outlined absolute -bottom-10 -right-10 text-[250px] text-primary-fixed opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none select-none" style="font-variation-settings: 'FILL' 1;">location_on</span>
                            
                            <div class="relative z-10">
                                <div class="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center text-on-primary-fixed mb-8 shadow-lg">
                                    <span class="material-symbols-outlined text-3xl">local_shipping</span>
                                </div>
                                <h3 class="text-4xl font-headline font-extrabold mb-4">Titik Jemput Akurat</h3>
                                <p class="text-on-primary-container text-lg max-w-sm leading-relaxed">
                                    Layanan pick-up langsung ke depan pintu Anda dengan penentuan lokasi yang presisi menggunakan integrasi maps.
                                </p>
                            </div>
                        </div>

                        <!-- Medium Card 1 - Beli / Catalog -->
                        <div class="md:col-span-2 bg-secondary-container p-10 rounded-[2.5rem] flex flex-col justify-between overflow-hidden relative group transition-all duration-500 hover:shadow-xl">
                            <!-- Large decorative icon background -->
                            <span class="material-symbols-outlined absolute -bottom-8 -right-8 text-[200px] text-primary opacity-5 group-hover:-translate-y-4 transition-transform duration-700 pointer-events-none select-none" style="font-variation-settings: 'FILL' 1;">shopping_bag</span>
                            
                            <div class="relative z-10">
                                <div class="flex justify-between items-start mb-6">
                                    <h3 class="text-3xl font-headline font-extrabold text-on-secondary-container relative z-10">Katalog<br/>Harga Real-time</h3>
                                    <div class="bg-white/50 p-3 rounded-2xl relative z-10">
                                        <span class="material-symbols-outlined text-3xl text-on-secondary-container">sell</span>
                                    </div>
                                </div>
                                <p class="text-on-secondary-container/80 text-lg font-medium max-w-[70%] relative z-10">
                                    Pantau harga botol PET, kardus, dan logam agar Anda tahu pasti nilai sampah Anda setiap saat.
                                </p>
                            </div>
                        </div>

                        <!-- Small Card 1 - Layanan -->
                        <div class="bg-surface-container p-8 rounded-[2rem] flex flex-col gap-6 group hover:bg-primary-fixed/50 transition-all border border-transparent hover:border-primary-fixed relative overflow-hidden">
                            <!-- Large decorative icon background -->
                            <span class="material-symbols-outlined absolute -bottom-6 -right-6 text-[150px] text-primary opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none select-none" style="font-variation-settings: 'FILL' 1;">volunteer_activism</span>
                            
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm relative z-10">
                                <span class="material-symbols-outlined text-primary">diversity_1</span>
                            </div>
                            <div class="relative z-10">
                                <h4 class="font-headline font-bold text-xl text-primary">Aksi Komunitas</h4>
                                <p class="text-on-surface-variant mt-2 text-sm font-medium">Pelatihan daur ulang & ekonomi sirkular bersama ahli.</p>
                            </div>
                        </div>

                        <!-- Small Card 2 - Profile Tiering -->
                        <div class="bg-surface-container p-8 rounded-[2rem] flex flex-col gap-6 group hover:bg-tertiary-fixed/50 transition-all border border-transparent hover:border-tertiary-fixed relative overflow-hidden">
                            <!-- Large decorative icon background -->
                            <span class="material-symbols-outlined absolute -bottom-6 -right-6 text-[150px] text-tertiary opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none select-none" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                            
                            <div class="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm relative z-10">
                                <span class="material-symbols-outlined text-tertiary">workspace_premium</span>
                            </div>
                            <div class="relative z-10">
                                <h4 class="font-headline font-bold text-xl text-primary">Member Tiering</h4>
                                <p class="text-on-surface-variant mt-2 text-sm font-medium">Tingkatkan rank dari Bronze hingga Prioritas untuk bonus spesial.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Final CTA -->
                <section class="py-16 md:py-32 px-6 lg:px-12 max-w-screen-2xl mx-auto">
                    <div class="bg-primary p-12 md:p-24 lg:p-32 rounded-[3rem] lg:rounded-[4rem] text-center relative overflow-hidden shadow-2xl">
                        <div class="absolute top-0 right-0 w-96 h-96 bg-primary-fixed opacity-10 rounded-full blur-3xl"></div>
                        <div class="absolute bottom-0 left-0 w-96 h-96 bg-secondary-fixed opacity-10 rounded-full blur-3xl"></div>
                        
                        <div class="relative z-10">
                            <h2 class="text-4xl md:text-6xl font-headline font-extrabold text-white tracking-tighter mb-8 shadow-sm">Mulai Perjalanan Hijau Anda</h2>
                            <p class="text-primary-fixed text-lg md:text-xl max-w-2xl mx-auto mb-12 opacity-90 font-medium">
                                Bergabung dengan komunitas pejuang lingkungan kami dan ubah kebiasaan menjadi pundi-pundi rupiah yang bernilai konstan.
                            </p>
                            <div class="flex flex-wrap justify-center gap-6">
                                <a href="#/home" class="bg-secondary-fixed text-on-secondary-fixed px-10 py-5 rounded-2xl font-headline font-extrabold text-lg shadow-xl shadow-secondary-fixed/30 hover:scale-105 transition-all flex items-center gap-2">
                                    <span>Masuk Aplikasi</span>
                                    <span class="material-symbols-outlined">exit_to_app</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Footer Section (About Us) -->
            <footer id="footer-section" class="bg-surface-container-high pt-24 pb-12 border-t border-surface-variant">
                <div class="max-w-screen-2xl mx-auto px-6 lg:px-12">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <!-- Column 1: About / Identity -->
                        <div class="lg:col-span-1">
                            <div class="text-2xl font-black text-primary tracking-tighter font-headline mb-8 flex items-center gap-2">
                                <span class="material-symbols-outlined text-4xl">recycling</span>
                                YARI
                            </div>
                            <p class="text-on-surface-variant leading-relaxed mb-8 font-medium opacity-80">
                                YARI (Setor Sampah Indonesia) adalah pelopor ekosistem ekonomi sirkular digital yang memberdayakan masyarakat untuk mengelola limbah menjadi aset bernilai.
                            </p>
                            <div class="flex gap-4">
                                <!-- Facebook -->
                                <a href="#" class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-[#1877F2] hover:text-white transition-all duration-300 group shadow-sm">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                                </a>
                                <!-- Instagram -->
                                <a href="#" class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:text-white transition-all duration-300 group shadow-sm">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </a>
                                <!-- TikTok -->
                                <a href="#" class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-[#000000] hover:text-white transition-all duration-300 group shadow-sm">
                                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.73 8.73 0 0 1-3.53-3.41v11.41c0 5.48-5.32 8.78-10.13 6.47C1.49 21.6 1.44 14.83 6.37 13.06c.86-.31 1.78-.4 2.69-.34v4c-1.33-.31-2.92.1-3.63 1.25-.8 1.3-.08 3.52 1.45 3.91 1.4.35 3.1-.38 3.52-1.77.16-.5.18-1.03.18-1.55l.02-18.53z"/></svg>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Column 2: Navigation -->
                        <div>
                            <h4 class="font-headline font-bold text-primary mb-8 uppercase tracking-[0.2em] text-xs">Jelajahi</h4>
                            <ul class="space-y-5">
                                <li><a href="#home" class="nav-link text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Beranda
                                </a></li>
                                <li><a href="#layanan-section" class="nav-link text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Layanan Kami
                                </a></li>
                                <li><a href="#katalog-section" class="nav-link text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Katalog Harga
                                </a></li>
                                <li><a href="#fitur-section" class="nav-link text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Fitur Premium
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Column 3: Corporate -->
                        <div>
                            <h4 class="font-headline font-bold text-primary mb-8 uppercase tracking-[0.2em] text-xs">Korporasi</h4>
                            <ul class="space-y-5">
                                <li><a href="#" class="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Kebijakan Privasi
                                </a></li>
                                <li><a href="#" class="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Syarat & Ketentuan
                                </a></li>
                                <li><a href="#" class="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Hubungan Investor
                                </a></li>
                                <li><a href="#" class="text-on-surface-variant hover:text-primary transition-all font-semibold flex items-center gap-2 group">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-150 transition-all"></span>
                                    Program CSR
                                </a></li>
                            </ul>
                        </div>
                        
                        <!-- Column 4: Contact -->
                        <div>
                            <h4 class="font-headline font-bold text-primary mb-8 uppercase tracking-[0.2em] text-xs">Hubungi Kami</h4>
                            <ul class="space-y-6">
                                <li class="flex items-start gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-primary-fixed flex-none flex items-center justify-center text-on-primary-fixed">
                                        <span class="material-symbols-outlined text-xl">location_on</span>
                                    </div>
                                    <span class="text-on-surface-variant font-medium text-sm leading-relaxed opacity-90" id="footer-address">Sedang memuat alamat...</span>
                                </li>
                                <li class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-secondary-fixed flex-none flex items-center justify-center text-on-secondary-fixed">
                                        <span class="material-symbols-outlined text-xl">call</span>
                                    </div>
                                    <a href="#" id="footer-whatsapp" class="text-on-surface-variant hover:text-primary transition-all font-bold text-sm">Sedang memuat nomor...</a>
                                </li>
                                <li class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-tertiary-fixed flex-none flex items-center justify-center text-on-tertiary-fixed">
                                        <span class="material-symbols-outlined text-xl">mail</span>
                                    </div>
                                    <a href="mailto:support@yari.id" class="text-on-surface-variant hover:text-primary transition-all font-bold text-sm">support@yari.id</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Bottom Branding -->
                    <div class="pt-10 border-t border-surface-variant border-opacity-30 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p class="text-on-surface-variant text-[11px] font-black uppercase tracking-[0.3em] opacity-50">
                            © ${new Date().getFullYear()} SETOR SAMPAH INDONESIA • MADE WITH PASSION FOR PLANET
                        </p>
                        <div class="flex items-center gap-2 text-primary font-headline font-black text-xs tracking-tighter">
                            <span>POWERED BY</span>
                            <span class="bg-primary text-on-primary px-2 py-1 rounded text-[10px]">WEBIZ.DEV</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;

    container.innerHTML = html;

    // jcSlider Initialization (Cross-fade & subtle scale)
    setTimeout(() => {
        const slides = container.querySelectorAll('.hero-slide');
        if (!slides || slides.length === 0) return;

        let currentIndex = 0;
        setInterval(() => {
            // Fade out current slide
            slides[currentIndex].classList.remove('z-10', 'opacity-100');
            slides[currentIndex].classList.add('z-0', 'opacity-0');

            currentIndex = (currentIndex + 1) % slides.length;

            // Fade in next slide
            slides[currentIndex].classList.remove('z-0', 'opacity-0');
            slides[currentIndex].classList.add('z-10', 'opacity-100');
        }, 3500);
    }, 100);

    // Fetch and render Dynamic Catalog Slider
    const fetchCatalog = async () => {
        const slider = container.querySelector('#katalog-slider');
        if(!slider) return;

        try {
            const { data, error } = await supabase
                .from('yari_waste_catalog')
                .select('*, yari_waste_categories(name)')
                .order('name');
            
            if (error) throw error;

            if (data && data.length > 0) {
                const cardHTML = data.map(item => `
                    <div class="flex-none w-64 md:w-72 bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group mx-3">
                        <div class="h-40 overflow-hidden relative bg-slate-100">
                            <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" />
                            ${item.is_popular ? `<div class="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-widest">Populer</div>` : ''}
                        </div>
                        <div class="p-6 flex flex-col h-40">
                            <div class="mb-2 uppercase text-[10px] tracking-[0.2em] font-black text-slate-400 truncate">${item.yari_waste_categories?.name || 'Kategori'}</div>
                            <h3 class="font-bold font-headline text-lg text-slate-800 mb-2 line-clamp-2" title="${item.name}">${item.name}</h3>
                            <p class="text-primary font-black text-xl mt-auto">Rp ${item.price_per_kg.toLocaleString('id-ID')} <span class="text-xs font-bold text-slate-400">/Kg</span></p>
                        </div>
                    </div>
                `).join('');
                
                // Simplified block for CSS marquee
                const blockHTML = `<div class="flex">${cardHTML}</div>`;
                
                slider.innerHTML = `
                    <div class="animate-marquee flex">
                        ${blockHTML}
                        ${blockHTML}
                    </div>
                `;
                
            } else {
                slider.innerHTML = `<div class="w-full text-center py-10 text-slate-400 font-medium h-80 flex items-center justify-center">Belum ada item rincian daur ulang.</div>`;
            }
        } catch (err) {
            console.error("Gagal memuat katalog", err);
            slider.innerHTML = `<div class="w-full text-center py-10 text-red-400 font-medium whitespace-normal">Gagal memuat katalog: ${err.message}</div>`;
        }
    };
    
    fetchCatalog();

    // Fetch Company Profile for Footer
    const fetchFooterData = async () => {
        try {
            const { data, error } = await supabase
                .from('yari_company_profile')
                .select('*')
                .maybeSingle();

            if (error) throw error;
            if (data) {
                const addr = container.querySelector('#footer-address');
                const wa = container.querySelector('#footer-whatsapp');
                
                if (addr) addr.textContent = data.alamat;
                if (wa) {
                    wa.textContent = `+${data.whatsapp}`;
                    wa.href = `https://wa.me/${data.whatsapp}`;
                }
            }
        } catch (err) {
            console.error("Gagal memuat profil footer", err);
        }
    };

    fetchFooterData();

    // ScrollSpy & Smooth Scroll Implementation
    const setupNavigation = () => {
        const navLinks = container.querySelectorAll('.nav-link');
        const sections = Array.from(navLinks).map(link => {
            const id = link.getAttribute('href');
            if (id.startsWith('#') && !id.includes('/')) {
                return container.querySelector(id);
            }
            return null;
        }).filter(Boolean);

        const handleScrollSpy = () => {
            let current = '';
            const navHeight = container.querySelector('nav').offsetHeight || 80;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - 100;
                if (window.pageYOffset >= sectionTop) {
                    current = '#' + section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === current) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', handleScrollSpy);
        handleScrollSpy(); // Initial check

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                
                if (targetId.startsWith('#') && !targetId.includes('/')) {
                    e.preventDefault();
                    const targetElement = container.querySelector(targetId);
                    
                    if (targetElement) {
                        const navHeight = container.querySelector('nav').offsetHeight || 80;
                        const targetPosition = targetElement.offsetTop - navHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    };

    setupNavigation();
}
