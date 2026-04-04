# Setor Sampah - Dokumentasi Sistem & Logika Aplikasi

Aplikasi "Setor Sampah" adalah antarmuka web modern Single Page Application (SPA) yang dibangun untuk menjembatani pengguna awam dengan layanan penyetoran sampah daur ulang, sekaligus menyediakan Portal Admin tersendiri untuk mengelola katalog harga, verifikasi data, dan melacak transaksi.

Aplikasi ini menggunakan perpaduan **Vite + Vanilla JavaScript + Tailwind CSS** di sisi *frontend*, dan **Supabase (PostgreSQL)** di sisi *backend* sebagai Database as a Service (DBaaS).

---

## 1. Arsitektur Proyek (Struktur File)
Agar lebih terorganisir dan dapat ditangkap dengan tepat oleh sistem _hosting_ (Vercel), struktur utama kode dibungkus dalam folder `app/`:

```text
YARI/
└── app/
    ├── admin.html           # Entri point HTML khusus Dasbor Admin
    ├── index.html           # Entri point HTML utama untuk Pelanggan (Customer)
    ├── package.json         # Konfigurasi dependensi npm (Vite, Tailwind, Supabase)
    ├── src/                 # Folder Logic utama
    │   ├── admin.js         # Router & Logic Utama untuk Dasbor Admin
    │   ├── main.js          # Router & Logic Utama untuk Sisi Customer
    │   ├── supabase.js      # Inisialisasi koneksi ke Database Supabase
    │   └── views/           # Kumpulan Modul Antarmuka (Logika per-Halaman)
    │       ├── admin_*.js   # File-file view khusus dasbor admin
    │       ├── beli.js      # Halaman Jual Sampah (Daftar Harga & Input)
    │       ├── home.js      # Halaman Beranda utama
    │       ├── layanan.js   # Halaman Info Layanan antar jemput
    │       └── profile.js   # Halaman Profil User & Poin
    ├── tailwind.config.js   # Aturan Gaya bawaan desain sistem Setor Sampah
    └── vite.config.js       # Konfigurasi _builder_ untuk Multi-page (index & admin)
```

---

## 2. Alur Pengguna & Logika Pertukaran Halaman (Routing)

Karena menggunakan rancangan Vanilla JS SPA, tidak ada fungsi pergerakan halaman memuat-ulang (_reload_). Semua perpindahan diatur dengan teknik **Hash Routing** (menangkap perubahan URL di belakang tanda `#`).

### A. Sisi Pelanggan (Client / Customer) -> `main.js`
- **Tampilan Awal**: Memuat komponen Top Bar dan Bottom Navigation.
- **`#/` (Beranda)**: Memanggil `renderHome()`. Menampilkan total poin, saldo, dan tombol pintas (Jual, Layanan).
- **`#/jual` (Katalog)**: Memanggil `renderBeli()`. Aplikasi me-*fetch* (menarik) seluruh data katalog sampah dari Supabase (`yari_waste_catalog`) dan merendernya berbentuk _Grid_ atau Card.
- **`#/layanan` (Mitra/Pickup)**: Memanggil `renderLayanan()`. Belum terhubung penuh namun difungsikan untuk edukasi jenis jemputan.
- **`#/profile` (Akun)**: Memanggil `renderProfile()`. Menampilkan riwayat transaksi pengguna dari tabel `yari_transactions`.

### B. Sisi Dasbor Admin -> `admin.js`
Berbeda dengan Client, admin tidak memiliki _Bottom Nav_, tetapi memiliki **Top Navigation Bar**.
- **Autentikasi**: Menyandarkan Sesi (_Session_) pada Local Storage atau fungsi Auth buatan. Jika belum _login_, rute akan dialihkan paksa ke layar khusus Admin Login. (Akun *default*: `admin@webiz.my.id`).
- **`#/dashboard`**: Mengambil ringkasan hari ini (Total Transaksi hari ini, Saldo beredar) dan menampilkannya sebagai Statistik.
- **`#/catalog`**: Layar penuh CRUD (Create, Read, Update, Delete). Bisa menambahkan katalog sampah baru ke `yari_waste_catalog`, edit harga, dan hapus harga.
- **`#/transactions`**: Daftar tabel yang me-_retrieve_ semua antrean jual beli dari pelanggan untuk divalidasi dan diubah statusnya (Pending -> Sukses).

---

## 3. Logika & Skema Database (Supabase)

Agar aplikasi beroperasi tanpa tumpang tindih dengan data lain (karena berjalan di Supabase kolektif milik _user_), seluruh tabel diprefiks dengan kata `yari_`.

### Tabel Utama:
1. **`yari_users`**
   Menyimpan pelanggan.
   - Kolom: `id` (UUID), `full_name`, `email`, `phone`, `total_points`, `balance`.
2. **`yari_waste_catalog`** (Data Master / Referensi)
   Dikelola oleh `admin_catalog.js`. Menentukan harga per "kg" atau per "pcs".
   - Kolom: `id`, `name`, `unit` (kg/pcs), `points_per_unit`, `icon_svg`.
3. **`yari_transactions`** (Logika Pemasukan)
   Alur saat user di layar `#/jual` melakukan aksi Setor.
   - Kolom: `id`, `user_id` (FK), `waste_id` (FK), `weight` (Jumlah), `points_earned` (Hasil kalkulasi `weight` * `points_per_unit` bawaan), `status` (PENDING / COMPLETED), `created_at`.
4. **`yari_admins`** (Data Rahasia)
   Daftar pengurus web yang diperbolehkan masuk ke `admin.html`.
   - Kolom: `id`, `email`, `password_hash`, `role` (SUPERADMIN).

> **PENTING (KEAMANAN)**: Saat ini, aturan pengaman Row Level Security (RLS) di dalam database Supabase berada di luar pembatasan, ini sengaja diprogram agar prototipe bisa membaca & menulis secara bebas (khususnya untuk modul Admin Manual Auth). Untuk naik ke tahapan Produksi skala massal yang terbuka untuk publik, RLS di Supabase harus diaktifkan untuk melindungi data dari eksekusi eksternal via Browser devtools.

---

## 4. Logika Perhitungan (_Business Logic_)

### Aksi: User Menjual Sampah:
1. User mengklik item (misal "Kardus", id: 2, points: 500/kg).
2. Tampil _modal_/isian, User meng-input 5 kg.
3. *Javascript frontend* mengkalkulasi sementara: `5 kg x 500 poin = 2500 poin`.
4. Frontend mengirimkan data tersebut (_insert_) ke dalam tabel `yari_transactions` dengan status **PENDING**. Saldo pengguna di fungsi `yari_users` belum bertambah (_logic asinkron_).

### Aksi: Admin Menerima Transaksi:
1. Admin membuka dasbor, melihat pesanan tadi berstatus "PENDING".
2. Admin mengecek barang fisik. Jika sesuai (5 kg kardus), maka admin menekan tombol "Setujui" / "Terima".
3. Skrip Dasbor menembak *Update* ke baris `yari_transactions` menjadi **COMPLETED**.
4. (Optional via Trigger Supabase atau Eksekusi bersama): Saldo `total_points` dan `balance` di catatan profil `yari_users` si User akan ditambahkan sebesar 2500.

---

## 5. Deployment Lifecycle (Siklus Peluncuran)

- **Platform:** Vercel
- **Root Directory:** `./app`
- **Build Command:** `vite build` (dijalankan otomatis oleh Vercel via npm run build).
- **Environment:** Variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` harus terisi di dasbor Vercel Settings sebelum proses "Build" terjadi.
- **Fail Safe:** Skrip buatan di `src/supabase.js` dibuat untuk mendeteksi `Import.meta.env` yang kosong; jika kosong dia akan menahan "Crash Fatal" agar layar tetap dirender secara visual (*UI Rendered*) lalu mengeluarkan peringatan Alert kepada System Admin.

## Kesimpulan

Aplikasi **Setor Sampah** mendemonstrasikan antarmuka mulus yang terasa seperti *Native Mobile App*, namun berjalan seratus persen menggunakan teknologi fundamental web (tanpa *overhead framework* seberat React/Next.js) dengan sinkronisasi ke serverless _backend_ modern (Supabase).
