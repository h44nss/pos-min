# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## KasirKu – Sistem Kasir Coffee Shop Sederhana
*Point of Sale (POS) berbasis Web Responsive untuk Coffee Shop*

Versi 1.0.0 | 25 Juni 2026 | Status: DRAFT

---

| Atribut | Detail |
|--------|--------|
| **Nama Dokumen** | Software Requirements Specification (SRS) |
| **Nama Sistem** | KasirKu |
| **Platform** | Web (Mobile & Desktop) |
| **Teknologi Utama** | Next.js, Supabase, Tailwind CSS |
| **Tanggal** | 2026 |
| **Status** | Draft |

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Aktor dan Hak Akses](#2-aktor-dan-hak-akses)
3. [Kebutuhan Fungsional (FR)](#3-kebutuhan-fungsional-fr)
4. [Kebutuhan Non-Fungsional (NFR)](#4-kebutuhan-non-fungsional-nfr)
5. [Business Rules](#5-business-rules)
6. [Arsitektur Sistem](#6-arsitektur-sistem)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen Software Requirements Specification (SRS) ini bertujuan untuk mendefinisikan seluruh kebutuhan teknis, fungsional, dan non-fungsional dari sistem KasirKu. Dokumen ini menjadi *Source of Truth* (SOT) bagi developer dan stakeholder.

### 1.2 Deskripsi Sistem
KasirKu adalah sistem Point of Sale (POS) sederhana yang berbasis web dan dirancang khusus untuk operasional Coffee Shop. Sistem ini memfasilitasi pencatatan transaksi dengan antarmuka yang cepat (ramah layar sentuh dan satu tangan), pengelolaan stok produk, dan pemantauan laporan keuangan harian, mingguan, maupun bulanan.

### 1.3 Ruang Lingkup (In Scope)
- Autentikasi Pengguna (Login, Lupa/Reset Password).
- Manajemen Master Data (Kategori Barang & Data Barang).
- Transaksi POS dengan metode pembayaran QRIS Statis dan Tunai (Cash).
- Fitur kalkulator kembalian otomatis untuk pembayaran Cash.
- Fitur pembatalan transaksi (Void) dengan log audit.
- Dashboard ringkasan (Total Penjualan, Low Stock Alert).
- Laporan Keuangan (Harian, Mingguan, Bulanan) beserta ekspor ke Excel.
- Audit Log untuk melacak aktivitas krusial.

### 1.4 Luar Lingkup (Out of Scope)
- Integrasi Payment Gateway API (Sistem menggunakan QRIS Statis yang dikonfirmasi manual).
- Manajemen resep produk / bahan baku detail (Hanya stok barang jadi).
- Modul diskon, promo kompleks, atau poin pelanggan (Membership).
- Sistem manajemen meja (Table Management).
- Cetak struk via bluetooth printer (Sistem menyediakan *Struk Digital* yang dapat di-share/disimpan).

---

## 2. Aktor dan Hak Akses

Sistem menggunakan kontrol akses berbasis peran (Role-Based Access Control).

| Aktor | Deskripsi Peran | Akses Modul |
|-------|----------------|-------------|
| **Owner** | Pemilik Coffee Shop yang mengelola data master, memantau laporan keuangan, dan mengelola akun staf. | Akses penuh ke semua fitur, termasuk HPP (Harga Pokok Penjualan), Laporan, Manajemen User, Audit Log, Master Data, dan Transaksi. |
| **Kasir** | Staf yang melayani pesanan pelanggan sehari-hari di area kasir. | Akses ke POS Transaksi, Riwayat Transaksi Hari Ini, Profil sendiri, dan daftar produk (tanpa kolom HPP). |

---

## 3. Kebutuhan Fungsional (FR)

### Modul 1: Autentikasi & Manajemen Akun
| Kode | Nama Fitur | Deskripsi Kebutuhan | Role |
|------|------------|---------------------|------|
| FR-01.01 | Login | Pengguna (Owner/Kasir) dapat masuk menggunakan email dan password. Terintegrasi dengan Supabase Auth. | Semua |
| FR-01.02 | Lupa Password | Pengguna dapat mereset password via tautan yang dikirimkan ke email. | Semua |
| FR-01.03 | Manajemen Akun Kasir | Owner dapat menambahkan akun kasir baru dan menonaktifkan akun kasir yang sudah tidak aktif (soft delete). | Owner |
| FR-01.04 | Ubah Profil & Password | Pengguna dapat mengubah nama profil dan mengganti password-nya sendiri. | Semua |

### Modul 2: Master Data
| Kode | Nama Fitur | Deskripsi Kebutuhan | Role |
|------|------------|---------------------|------|
| FR-02.01 | Kelola Kategori | Owner dapat menambah dan mengedit nama kategori barang (mis. Kopi, Non-Kopi, Snack). Kategori tidak bisa dihapus jika ada produk terkait. | Owner |
| FR-02.02 | Kelola Produk | Owner dapat menambah, mengedit produk beserta informasi: Nama, Kategori, Harga Jual, Harga Modal (HPP), Stok, dan Foto (Maks 5MB). | Owner |
| FR-02.03 | Daftar Produk (Kasir) | Kasir dapat melihat daftar produk yang tersedia, namun Harga Modal (HPP) disembunyikan. | Kasir |

### Modul 3: Transaksi POS
| Kode | Nama Fitur | Deskripsi Kebutuhan | Role |
|------|------------|---------------------|------|
| FR-03.01 | Terminal POS | Layar transaksi dengan grid produk (dapat difilter per kategori) dan daftar keranjang belanja di sisi yang menampilkan total harga. | Semua |
| FR-03.02 | Cek Stok Otomatis | Kasir tidak dapat menambahkan item ke keranjang atau *checkout* apabila kuantitas barang melebihi sisa stok sistem. | Semua |
| FR-03.03 | Pembayaran QRIS Statis | Sistem menampilkan QRIS Statis. Setelah pelanggan transfer, kasir wajib melakukan konfirmasi dengan menekan "Sudah Dibayar". | Semua |
| FR-03.04 | Pembayaran Cash (Tunai) | Sistem menyediakan on-screen numpad besar untuk menginput nominal *Uang Diterima*, dan otomatis menghitung *Kembalian*. | Semua |
| FR-03.05 | Cetak / Share Struk | Setelah transaksi berhasil (Lunas), sistem memunculkan pop-up struk digital yang bisa dibagikan atau disimpan. | Semua |
| FR-03.06 | Riwayat Transaksi | Kasir dapat melihat riwayat transaksi *shift hari ini*, sedangkan Owner dapat memfilter semua periode. | Semua (Limit) |
| FR-03.07 | Void Transaksi | Kasir (atau Owner) dapat membatalkan (Void) transaksi yang sudah Lunas. Stok barang akan otomatis dikembalikan. | Semua |

### Modul 4: Dashboard & Pelaporan
| Kode | Nama Fitur | Deskripsi Kebutuhan | Role |
|------|------------|---------------------|------|
| FR-04.01 | Real-time Clock | Header aplikasi menampilkan jam dan tanggal secara real-time. | Semua |
| FR-04.02 | Ringkasan Dashboard | Menampilkan Total Penjualan & Jumlah Transaksi hari ini (Kasir: khusus miliknya; Owner: keseluruhan toko). | Semua |
| FR-04.03 | Low Stock Alert | Dashboard Owner menampilkan alert daftar produk yang stoknya ≤ batas minimum (misalnya 5 item). | Owner |
| FR-04.04 | Laporan Keuangan | Menampilkan rekap penjualan (Total Revenue, Margin Profit, Jumlah Transaksi) berdasarkan Harian, Mingguan, Bulanan. | Owner |
| FR-04.05 | Produk Terlaris | Bagian dari laporan yang menampilkan urutan produk terlaris. | Owner |
| FR-04.06 | Export Laporan | Owner dapat mengunduh data Laporan Keuangan dalam format file Excel (.xlsx). | Owner |

### Modul 5: Audit Log
| Kode | Nama Fitur | Deskripsi Kebutuhan | Role |
|------|------------|---------------------|------|
| FR-05.01 | Catat Audit Log | Setiap aksi kritikal (seperti Void Transaksi) otomatis dicatat dengan stempel waktu, nama pengguna, dan detail aksi. | Sistem |
| FR-05.02 | Lihat Audit Log | Owner dapat melihat, memfilter tanggal, dan mereview riwayat Audit Log. | Owner |

---

## 4. Kebutuhan Non-Fungsional (NFR)

### 4.1 UI / UX dan Responsivitas
- **Mobile/Tablet First untuk Kasir:** Halaman Transaksi POS (Kasir) dirancang khusus agar mudah digunakan dengan jari (Touch target minimal 44x44px).
- **Desktop untuk Owner:** Halaman Laporan dan Master Data menggunakan sidebar dan grid tabel luas agar memudahkan analisa.
- **Warna Identitas:** Menggunakan palet F&B Coffee Shop (Espresso Brown, Caramel Amber) berdasarkan dokumen *Design System*.
- **Aksesibilitas:** Kontras warna memadai dan penggunaan ikon berdampingan dengan warna untuk membedakan status (Lunas = Hijau + Ikon Centang, Void = Merah + Ikon X).

### 4.2 Keamanan & Autentikasi
- Passwords disimpan menggunakan hashing standar dari Supabase Auth.
- Implementasi Row Level Security (RLS) di Supabase agar `Kasir` tidak dapat melakukan query ke tabel-tabel milik `Owner` (mis. Laporan/Audit Log/HPP Produk).

### 4.3 Performa
- Halaman POS kasir harus ringan, interaksi *tambah keranjang* bebas *lag*. 
- Memanfaatkan caching data yang jarang berubah (seperti daftar kategori) untuk mempercepat load time aplikasi.

### 4.4 Ketersediaan Data
- Perubahan transaksi dan stok yang berhasil masuk ke Supabase, secara instan mengurangi ketersediaan stok di layar (memanfaatkan Supabase Realtime).

---

## 5. Business Rules

| ID Rule | Aturan Bisnis | Konsekuensi / Sistem |
|---------|---------------|----------------------|
| BR-01 | **Validasi Ketersediaan Stok** | Transaksi tidak dapat ditambahkan ke keranjang atau dicheckout jika stok barang habis atau jumlah pesanan > stok yang ada. |
| BR-02 | **Input Uang Tunai** | Untuk pembayaran Cash, jumlah *Uang Diterima* yang diinput wajib **≥ (lebih besar atau sama dengan)** Total Belanja. |
| BR-03 | **Pembayaran QRIS** | QRIS bersifat Statis. Sistem mengubah status pesanan dari "Menunggu Pembayaran" menjadi "Lunas" murni berdasarkan konfirmasi pencet tombol *Kasir*. |
| BR-04 | **Void Transaksi** | Jika transaksi di-Void (dibatalkan), maka kuantitas stok produk yang terjual pada invoice tersebut akan dikembalikan ke stok inventaris. Aksi ini WAJIB tercatat di tabel Audit Log. |
| BR-05 | **Proteksi HPP (Harga Modal)** | Kasir sama sekali tidak diizinkan untuk melihat field HPP atau informasi margin/profit toko. |
| BR-06 | **Penonaktifan Akun** | Akun Kasir hanya bisa dinonaktifkan (`is_active = false`) oleh Owner, tidak bisa dihapus permanen agar historis transaksi kasir tersebut tetap valid. |

---

## 6. Arsitektur Sistem

- **Frontend:** Next.js (App Router), React.js, Tailwind CSS.
- **Backend / BaaS:** Supabase (PostgreSQL Database, Supabase Auth, Supabase Storage untuk foto produk).
- **Libraries Tambahan:**
  - `Recharts` untuk Visualisasi Laporan Keuangan.
  - `Lucide Icons` untuk ikon antarmuka.
  - `xlsx` untuk fungsi Export Excel.
- **Deployment:** Vercel (untuk Frontend aplikasi Next.js).

---
*Dokumen ini merupakan bagian dari Source of Truth (SOT) proyek KasirKu.*
*Referensi silang wajib dengan: Information Architecture (IA), User Flow, dan Design System.*
