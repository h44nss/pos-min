# DESIGN SYSTEM (DS)
## KasirKu – Sistem Kasir Coffee Shop Sederhana

*Point of Sale (POS) berbasis Web Responsive untuk Coffee Shop*

Versi 1.0.0 | 25 Juni 2026 | Status: DRAFT

---

| Atribut | Detail |
|--------|--------|
| **Nama Dokumen** | Design System |
| **Nama Sistem** | KasirKu *(placeholder — sesuaikan dengan nama coffee shop)* |
| **Versi** | 1.0.0 |
| **Tanggal** | 2026 |
| **Status** | Draft |
| **Framework Rekomendasi** | Tailwind CSS |

---

## Daftar Isi

1. [Design Principles](#1-design-principles)
2. [UX Principles](#2-ux-principles)
3. [Accessibility — WCAG 2.1](#3-accessibility--wcag-21)
4. [Color System](#4-color-system)
5. [Typography](#5-typography)
6. [Spacing](#6-spacing)
7. [Grid System](#7-grid-system)
8. [Layout System](#8-layout-system)
9. [Iconography](#9-iconography)
10. [Data Visualization](#10-data-visualization)
11. [Design Tokens](#11-design-tokens)
12. [Component Library](#12-component-library)
13. [Responsive Rules](#13-responsive-rules)
14. [Interaction Rules](#14-interaction-rules)
15. [Validation Rules](#15-validation-rules)
16. [Empty States](#16-empty-states)
17. [Error States](#17-error-states)
18. [Loading States](#18-loading-states)
19. [Notification Patterns](#19-notification-patterns)
20. [Dashboard Standards](#20-dashboard-standards)
21. [Framework Analysis & Rekomendasi](#21-framework-analysis--rekomendasi)

---

## 1. Design Principles

KasirKu digunakan dalam konteks yang serba cepat: Kasir melayani customer di depan kasir sambil memegang HP/tablet, sering dalam kondisi tangan sibuk (memegang gelas, uang, struk). Owner menggunakan sistem lebih santai untuk memantau bisnis. Prinsip desain diturunkan dari dua konteks penggunaan yang berbeda ini.

### 1.1 Prinsip Utama

#### Speed Over Decoration — Kecepatan di atas dekorasi
Halaman transaksi adalah halaman paling sering dibuka — setiap elemen di sana harus mempercepat penyelesaian transaksi, bukan memperindah tampilan semata.

#### One-Hand Friendly — Ramah satu tangan
Tombol aksi utama (tambah produk, bayar, konfirmasi) diletakkan di area yang mudah dijangkau jempol saat memegang tablet/HP.

#### Confidence Before Closing — Yakin sebelum menutup transaksi
Total harga, kembalian, dan status pembayaran harus terlihat jelas dan besar sebelum kasir menutup transaksi — mencegah kesalahan input nominal.

#### Progressive Disclosure — Tampilkan sesuai kebutuhan
Kasir tidak perlu melihat HPP/profit — informasi sensitif hanya muncul di tampilan Owner. Dashboard menampilkan ringkasan; detail di balik klik.

#### Consistency Builds Habit — Konsistensi membangun kebiasaan
Warna hijau selalu berarti "Lunas/Sukses", merah selalu berarti "Void/Error" di seluruh halaman, tanpa kecuali.

### 1.2 Nilai Visual

| Nilai | Manifestasi Visual |
|-------|-------------------|
| Hangat | Palet warna coffee/espresso — sesuai identitas bisnis F&B |
| Cepat Dibaca | Kontras tinggi, angka besar untuk total & kembalian |
| Terpercaya | Konsistensi warna status transaksi di semua layar |
| Efisien | Grid produk besar & mudah ditekan, minim langkah ke pembayaran |

---

## 2. UX Principles

### 2.1 Prinsip UX Operasional

| Prinsip | Deskripsi | Implementasi |
|---------|-----------|--------------|
| **Reduce Cognitive Load** | Kurangi keputusan saat transaksi | Grid produk dengan foto + harga, tanpa perlu cari di tabel |
| **Feedback Immediacy** | Setiap aksi mendapat respons visual segera | Animasi tambah ke keranjang, toast sukses transaksi |
| **Error Prevention** | Cegah kesalahan sebelum terjadi | Tombol checkout disabled jika stok tidak cukup atau uang diterima kurang |
| **Forgiveness** | Beri jalan keluar dari kesalahan | Void transaksi tanpa approval, konfirmasi sebelum void |
| **Recognition over Recall** | Tampilkan pilihan visual, bukan minta hafal | Grid produk bergambar + tab kategori, bukan dropdown teks |
| **Minimal Steps** | Kurangi langkah ke pembayaran | Maksimal 3 tap dari pilih produk hingga konfirmasi bayar |

### 2.2 Mental Model per Peran

| Peran | Mental Model | Implikasi Desain |
|-------|-------------|-----------------|
| **Owner** | "Saya pantau kesehatan bisnis dari jauh" | Dashboard analitik, akses laporan & profit, kontrol data master |
| **Kasir** | "Saya cuma butuh transaksi cepat & benar" | UI besar, minim teks, fokus tombol produk dan total harga |

---

## 3. Accessibility — WCAG 2.1

### 3.1 Target Konformitas

KasirKu menargetkan **WCAG 2.1 Level AA**.

### 3.2 Persyaratan Kontras Warna

| Konteks | Rasio Minimum |
|---------|:------------:|
| Teks normal (< 18px) | 4.5 : 1 |
| Teks besar (≥ 18px atau bold ≥ 14px) | 3 : 1 |
| Komponen UI & grafis | 3 : 1 |

### 3.3 Checklist Aksesibilitas

| Kategori | Requirement |
|----------|------------|
| **Keyboard Navigation** | Form login, produk, dan laporan dapat dioperasikan via keyboard |
| **Focus Indicator** | Visible focus ring pada semua elemen interaktif |
| **Touch Target** | Minimum 44x44px, khusus tombol produk di grid kasir minimum 64x64px |
| **Form Labels** | Setiap input punya label eksplisit |
| **Color Blindness** | Status transaksi tidak hanya dibedakan warna — selalu disertai label teks/ikon |
| **Screen Reader** | Foto produk punya alt text nama produk |
| **Zoom** | Layout tidak pecah hingga zoom 200% |
| **Language** | `lang="id"` pada html tag |

### 3.4 Status Aksesibel

Status transaksi (Menunggu Pembayaran/Lunas/Void) dan badge stok menipis wajib memiliki kombinasi **warna + ikon + label teks** — tidak pernah warna saja.

---

## 4. Color System

### 4.1 Filosofi Warna

KasirKu menggunakan **Espresso Brown** sebagai primary — mencerminkan identitas coffee shop secara langsung, hangat dan mengundang. **Caramel Amber** dipilih sebagai accent untuk CTA dan highlight, memberi energi tanpa berlebihan.

### 4.2 Primary Colors

| Token | Nama | Hex | Penggunaan |
|-------|------|-----|-----------|
| color-primary-50 | Espresso Lightest | #FBF6F2 | Background highlight, hover ringan |
| color-primary-100 | Espresso Lighter | #F0E0D4 | Background badge, selected state |
| color-primary-200 | Espresso Light | #DEC3AC | Border aktif, divider berwarna |
| color-primary-500 | Espresso Base | #8B5E3C | Tombol sekunder, link, ikon aktif |
| color-primary-600 | Espresso Medium | #6F4A2E | Tombol primer utama, sidebar header |
| color-primary-700 | Espresso Dark | #563824 | Hover tombol primer |
| color-primary-800 | Espresso Darker | #3E2818 | Active state, sidebar aktif |
| color-primary-900 | Espresso Darkest | #2A1B10 | Header sidebar, teks judul berat |

### 4.3 Accent Colors

| Token | Nama | Hex | Penggunaan |
|-------|------|-----|-----------|
| color-accent-400 | Caramel Light | #F2B544 | Highlight data viz, badge aktif |
| color-accent-500 | Caramel Base | #E29C2E | Tombol "Bayar", CTA utama transaksi |
| color-accent-600 | Caramel Dark | #C27F1C | Hover CTA |

### 4.4 Neutral Colors

| Token | Nama | Hex | Penggunaan |
|-------|------|-----|-----------|
| color-neutral-0 | White | #FFFFFF | Background card, panel keranjang |
| color-neutral-50 | Stone Lightest | #FAF9F7 | Background body |
| color-neutral-100 | Stone Lighter | #F3F1ED | Background tabel row alt |
| color-neutral-200 | Stone Light | #E5E1DA | Border default, divider |
| color-neutral-400 | Stone Medium | #A39A8E | Placeholder text, ikon disabled |
| color-neutral-600 | Stone Dark | #5C5448 | Teks sekunder, label form |
| color-neutral-700 | Stone Darker | #3D372E | Teks body utama |
| color-neutral-800 | Stone Darkest | #241F19 | Teks heading |
| color-neutral-900 | Near Black | #15110C | Heading level 1 |

### 4.5 Semantic Colors — Status Transaksi

| Status | Hex Text | Hex Background | Penggunaan |
|--------|---------|---------------|-----------|
| Menunggu Pembayaran | #B45309 | #FFFBEB | Transaksi QRIS belum dikonfirmasi |
| Lunas | #15803D | #ECFDF5 | Transaksi berhasil dibayar |
| Void | #B91C1C | #FEF2F2 | Transaksi dibatalkan |

### 4.6 Semantic Colors — Stok Produk

| Status | Hex Text | Hex Background |
|--------|---------|---------------|
| Stok Aman | #15803D | #ECFDF5 |
| Stok Menipis (≤ batas minimum) | #B45309 | #FFFBEB |
| Stok Habis | #B91C1C | #FEF2F2 |

### 4.7 Feedback Colors

| Tipe | Hex | Background |
|------|-----|-----------|
| Success | #15803D | #ECFDF5 |
| Warning | #B45309 | #FFFBEB |
| Error | #B91C1C | #FEF2F2 |
| Info | #1D4ED8 | #EFF6FF |

---

## 5. Typography

### 5.1 Typeface

- **Inter** — typeface utama untuk seluruh teks UI, terbaca jelas di ukuran kecil pada tablet/HP.
- **JetBrains Mono** — untuk nomor transaksi, kode SKU produk, dan nominal uang (memudahkan pembacaan angka cepat saat kasir bekerja).

```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 5.2 Type Scale

| Token | Size | Line Height | Weight | Penggunaan |
|-------|------|------------|--------|-----------|
| text-xs | 12px / 0.75rem | 1.5 | 400 | Caption, timestamp, label kecil |
| text-sm | 14px / 0.875rem | 1.5 | 400 | Label form, teks sekunder, badge |
| text-base | 16px / 1rem | 1.6 | 400 | Teks body utama, isi form |
| text-lg | 18px / 1.125rem | 1.5 | 500 | Sub-heading card, nama produk di grid |
| text-xl | 20px / 1.25rem | 1.4 | 600 | Judul card, harga produk |
| text-2xl | 24px / 1.5rem | 1.3 | 600 | Heading halaman level 2 |
| text-3xl | 30px / 1.875rem | 1.25 | 700 | Heading halaman level 1 |
| text-4xl | 36px / 2.25rem | 1.2 | 700 | Total harga di keranjang |
| text-5xl | 48px / 3rem | 1.1 | 800 | Total & Kembalian di panel pembayaran — wajib besar agar kasir tidak salah baca |

### 5.3 Font Weight

| Token | Weight | Penggunaan |
|-------|--------|-----------|
| font-normal | 400 | Teks body, deskripsi |
| font-medium | 500 | Label, sub-heading |
| font-semibold | 600 | Judul card, tombol, badge |
| font-bold | 700 | Heading halaman |
| font-extrabold | 800 | Total & kembalian (panel pembayaran) |

### 5.4 Aturan Typography

| Aturan | Detail |
|--------|--------|
| Angka nominal | Selalu monospace, format `Rp 25.000` (titik ribuan, tanpa desimal) |
| Alignment | Left-align teks; right-align angka di tabel & struk |
| Truncation | text-ellipsis untuk nama produk panjang di grid; tooltip untuk full text |
| Sentence case | Semua label dan tombol menggunakan sentence case, bukan ALL CAPS |

---

## 6. Spacing

### 6.1 Skala Spacing

Skala berbasis **4px** (0.25rem), konsisten dengan Tailwind CSS.

| Token | px | rem | Tailwind Class |
|-------|:--:|:---:|:--------------:|
| space-1 | 4px | 0.25rem | `p-1` / `m-1` |
| space-2 | 8px | 0.5rem | `p-2` / `m-2` |
| space-3 | 12px | 0.75rem | `p-3` / `m-3` |
| space-4 | 16px | 1rem | `p-4` / `m-4` |
| space-6 | 24px | 1.5rem | `p-6` / `m-6` |
| space-8 | 32px | 2rem | `p-8` / `m-8` |
| space-12 | 48px | 3rem | `p-12` / `m-12` |
| space-16 | 64px | 4rem | `p-16` / `m-16` |

### 6.2 Aturan Spacing

| Aturan | Detail |
|--------|--------|
| Card produk (grid) | Gap 12px antar card, padding internal 12px |
| Panel keranjang | Padding 16px, gap antar item 8px |
| Form | Gap antar field 16px |
| Touch target spacing | Minimum 8px antar tombol yang berdekatan agar tidak salah tekan |

---

## 7. Grid System

### 7.1 Grid Utama — 12 Kolom (Desktop)

Layout desktop menggunakan grid 12 kolom standar untuk halaman Owner (laporan, tabel, dashboard).

### 7.2 Grid Produk — Halaman Transaksi

| Breakpoint | Jumlah Kolom Grid Produk |
|------------|:------------------------:|
| Mobile (< 640px) | 2 kolom |
| Tablet (640–1024px) | 3 kolom |
| Desktop (> 1024px) | 4–5 kolom |

### 7.3 Max Width Container

| Konteks | Max Width |
|---------|-----------|
| Halaman Owner (laporan, tabel) | 1280px, centered |
| Halaman Transaksi | Full-width (memaksimalkan area grid produk) |

---

## 8. Layout System

### 8.1 Layout Shell (Desktop) — Owner

```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │  Header: Clock | Avatar             │
│ (240px)  ├────────────────────────────────────┤
│          │         Konten Halaman              │
└──────────┴────────────────────────────────────┘
```

### 8.2 Layout Shell (Mobile/Tablet) — Kasir

```
┌────────────────────────────────────┐
│  Header: Clock | Avatar             │
├────────────────────────────────────┤
│      Grid Produk (scrollable)       │
│                                      │
├────────────────────────────────────┤
│   Bottom Sheet: Keranjang + Total   │
├────────────────────────────────────┤
│         Bottom Navigation           │
└────────────────────────────────────┘
```

### 8.3 Layout Halaman Tabel (Produk, Audit Log, dst.)

```
[Header Halaman + Tombol Aksi Utama]
[Filter/Search Bar]
[Tabel Data]
[Pagination]
```

### 8.4 Layout Form (Modal)

```
[Judul Modal]
[Field 1] [Field 2 - jika 2 kolom]
[Field 3]
...
[Tombol Batal] [Tombol Simpan]
```

### 8.5 Layout Panel Pembayaran (Full-Screen Mobile)

```
┌────────────────────────────────────┐
│            Total Harga              │
│           (text-5xl, bold)          │
├────────────────────────────────────┤
│   [QRIS: Kode QR]  atau  [Cash: Numpad] │
├────────────────────────────────────┤
│        Tombol Konfirmasi Besar      │
└────────────────────────────────────┘
```

---

## 9. Iconography

### 9.1 Library Ikon

Menggunakan **Lucide Icons** — ringan, konsisten, open-source, kompatibel dengan React/Next.js.

### 9.2 Ukuran Ikon

| Token | px | Penggunaan |
|-------|:--:|-----------|
| icon-sm | 16px | Ikon inline di teks/badge |
| icon-base | 20px | Ikon di tombol & menu |
| icon-lg | 24px | Ikon navigasi sidebar/bottom nav |
| icon-xl | 32px | Ikon empty state |

### 9.3 Pemetaan Ikon per Fungsi

| Fungsi | Ikon (Lucide) |
|--------|--------------|
| Dashboard | `layout-dashboard` |
| Kategori | `tag` |
| Produk | `package` |
| Transaksi/Kasir | `shopping-cart` |
| Riwayat | `history` |
| Laporan | `bar-chart-3` |
| Manajemen User | `users` |
| Audit Log | `file-clock` |
| Profil | `user-circle` |
| QRIS | `qr-code` |
| Cash | `banknote` |
| Void | `x-circle` |
| Stok Menipis | `alert-triangle` |
| Export Excel | `file-spreadsheet` |

### 9.4 Aturan Ikon

| Aturan | Detail |
|--------|--------|
| Ikon dekoratif | `aria-hidden="true"` |
| Ikon fungsional (tanpa label teks) | Wajib `aria-label` |
| Konsistensi | Satu fungsi = satu ikon di seluruh sistem |

---

## 10. Data Visualization

### 10.1 Library

Menggunakan **Recharts** — ringan dan terintegrasi baik dengan React/Next.js.

### 10.2 Tipe Chart per Konteks

| Konteks | Tipe Chart |
|---------|-----------|
| Tren Penjualan Harian/Mingguan/Bulanan | Line Chart |
| Produk Terlaris | Horizontal Bar Chart |
| Perbandingan Metode Bayar (QRIS vs Cash) | Donut Chart |

### 10.3 Palet Warna Chart

| Seri | Hex |
|------|-----|
| Seri 1 (Penjualan) | #8B5E3C (primary-500) |
| Seri 2 (Profit) | #E29C2E (accent-500) |
| Seri 3 (QRIS) | #1D4ED8 |
| Seri 4 (Cash) | #15803D |

### 10.4 Standar Chart

| Aturan | Detail |
|--------|--------|
| Tooltip | Selalu tampil saat hover/tap, format `Rp 25.000` |
| Label Sumbu | Format tanggal singkat (`DD/MM`) untuk harian, nama bulan untuk bulanan |
| Empty State | Tampilkan ikon + teks "Belum ada data" jika periode tidak ada transaksi |

---

## 11. Design Tokens

### 11.1 CSS Custom Properties

```css
:root {
  /* Primary - Espresso Brown */
  --color-primary-50: #FBF6F2;
  --color-primary-100: #F0E0D4;
  --color-primary-200: #DEC3AC;
  --color-primary-500: #8B5E3C;
  --color-primary-600: #6F4A2E;
  --color-primary-700: #563824;
  --color-primary-800: #3E2818;
  --color-primary-900: #2A1B10;

  /* Accent - Caramel Amber */
  --color-accent-400: #F2B544;
  --color-accent-500: #E29C2E;
  --color-accent-600: #C27F1C;

  /* Neutral - Stone */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #FAF9F7;
  --color-neutral-100: #F3F1ED;
  --color-neutral-200: #E5E1DA;
  --color-neutral-400: #A39A8E;
  --color-neutral-600: #5C5448;
  --color-neutral-700: #3D372E;
  --color-neutral-800: #241F19;
  --color-neutral-900: #15110C;

  /* Semantic - Status Transaksi */
  --color-status-pending-text: #B45309;
  --color-status-pending-bg: #FFFBEB;
  --color-status-lunas-text: #15803D;
  --color-status-lunas-bg: #ECFDF5;
  --color-status-void-text: #B91C1C;
  --color-status-void-bg: #FEF2F2;

  /* Feedback */
  --color-success: #15803D;
  --color-warning: #B45309;
  --color-error: #B91C1C;
  --color-info: #1D4ED8;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Shadow */
  --shadow-card: 0 1px 3px rgba(21, 17, 12, 0.08), 0 1px 2px rgba(21, 17, 12, 0.06);
  --shadow-modal: 0 10px 25px rgba(21, 17, 12, 0.15);
}
```

### 11.2 Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FBF6F2', 100: '#F0E0D4', 200: '#DEC3AC',
          500: '#8B5E3C', 600: '#6F4A2E', 700: '#563824',
          800: '#3E2818', 900: '#2A1B10',
        },
        accent: {
          400: '#F2B544', 500: '#E29C2E', 600: '#C27F1C',
        },
        neutral: {
          0: '#FFFFFF', 50: '#FAF9F7', 100: '#F3F1ED', 200: '#E5E1DA',
          400: '#A39A8E', 600: '#5C5448', 700: '#3D372E',
          800: '#241F19', 900: '#15110C',
        },
        status: {
          pending: { text: '#B45309', bg: '#FFFBEB' },
          lunas: { text: '#15803D', bg: '#ECFDF5' },
          void: { text: '#B91C1C', bg: '#FEF2F2' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px',
      },
    },
  },
};
```

---

## 12. Component Library

### 12.1 Button

#### Varian

| Varian | Penggunaan | Style |
|--------|-----------|-------|
| Primary | Aksi utama (Simpan, Bayar) | bg-primary-600, text-white |
| Accent/CTA | Tombol bayar di panel transaksi | bg-accent-500, text-white |
| Secondary | Aksi sekunder (Batal) | border, bg-transparent |
| Danger | Void, Hapus, Nonaktifkan | bg-error, text-white |
| Ghost | Aksi minor (Lihat detail) | text-only, hover bg-neutral-100 |

#### Ukuran

| Ukuran | Height | Penggunaan |
|--------|--------|-----------|
| sm | 32px | Tombol di tabel |
| base | 40px | Tombol form standar |
| lg | 48px | Tombol form Owner |
| xl | 64px | Tombol "Bayar" & "Sudah Dibayar" di halaman transaksi |

#### States

| State | Style |
|-------|-------|
| Default | Warna solid sesuai varian |
| Hover | Darken 1 step |
| Disabled | Opacity 40%, cursor not-allowed (mis. tombol Bayar saat stok kurang) |
| Loading | Spinner + label "Memproses..." |

#### Contoh Implementasi

```html
<button class="bg-accent-500 hover:bg-accent-600 text-white font-bold
  text-xl h-16 px-8 rounded-lg disabled:opacity-40">
  Bayar Rp 45.000
</button>
```

### 12.2 Badge / Status Chip

#### Referensi Badge Status Transaksi

```html
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
  text-sm font-medium bg-[--color-status-lunas-bg] text-[--color-status-lunas-text]">
  ● Lunas
</span>
```

### 12.3 Form Input

#### Text Input

```html
<label class="text-sm font-medium text-neutral-700">Nama Produk</label>
<input class="w-full h-10 px-3 border border-neutral-200 rounded-md
  focus:ring-2 focus:ring-primary-500 text-base" />
```

#### Numpad Input (Cash)

Numpad custom on-screen, tombol besar 56x56px, untuk input nominal uang diterima tanpa perlu keyboard fisik.

#### File Upload (Foto Produk)

```html
<div class="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center">
  <p class="text-sm text-neutral-600">Drag foto atau klik untuk upload</p>
  <p class="text-xs text-neutral-400">JPG/PNG/WebP, maks 5MB</p>
</div>
```

### 12.4 Card

#### Card Produk (Grid Transaksi)

```html
<button class="bg-white rounded-lg shadow-card overflow-hidden text-left
  active:scale-95 transition-transform">
  <img src="..." class="w-full h-24 object-cover" />
  <div class="p-2">
    <p class="text-sm font-semibold truncate">Es Kopi Susu</p>
    <p class="text-sm font-mono text-primary-600">Rp 18.000</p>
  </div>
</button>
```

#### Stat Card (Dashboard)

```html
<div class="bg-white rounded-lg shadow-card p-4">
  <p class="text-sm text-neutral-600">Total Penjualan Hari Ini</p>
  <p class="text-3xl font-bold font-mono">Rp 1.250.000</p>
</div>
```

### 12.5 Data Table

| Aturan | Detail |
|--------|--------|
| Header | Sticky di scroll vertikal |
| Row Alt | Background `neutral-100` selang-seling |
| Angka | Right-align, font mono |
| Aksi | Ikon di kolom paling kanan |

### 12.6 Modal / Dialog

| Aturan | Detail |
|--------|--------|
| Overlay | `bg-black/50` |
| Width | 480px desktop, full-screen mobile |
| Animasi | Fade + scale-in 200ms |

### 12.7 Bottom Sheet (Keranjang — Mobile)

| Aturan | Detail |
|--------|--------|
| Posisi | Fixed bottom, dapat di-drag expand/collapse |
| Konten Collapsed | Total harga + jumlah item + tombol Bayar |
| Konten Expanded | List item lengkap dengan qty stepper |

### 12.8 Sidebar Item (Owner Desktop)

```html
<a class="flex items-center gap-3 px-4 py-2.5 rounded-md text-neutral-0/80
  hover:bg-primary-700 aria-[current=page]:bg-primary-800 aria-[current=page]:text-white">
  <icon class="w-5 h-5" /> Dashboard
</a>
```

---

## 13. Responsive Rules

### 13.1 Breakpoint Behavior

| Breakpoint | Width | Perilaku |
|------------|-------|---------|
| Mobile | < 640px | Grid produk 2 kolom, navigasi bottom nav, keranjang sebagai bottom sheet |
| Tablet | 640–1024px | Grid produk 3 kolom, keranjang sebagai panel samping (opsional) |
| Desktop | > 1024px | Sidebar tetap (Owner), grid produk 4-5 kolom, keranjang panel kanan tetap |

### 13.2 Form Responsif

| Breakpoint | Layout Form |
|------------|------------|
| Mobile | 1 kolom, full width |
| Desktop | 2 kolom untuk field terkait (mis. Harga Jual & Harga Modal sejajar) |

### 13.3 Touch Target

| Konteks | Minimum Size |
|---------|-------------|
| Card produk di grid | 64x64px |
| Tombol numpad cash | 56x56px |
| Tombol navigasi bottom nav | 48x48px |

---

## 14. Interaction Rules

### 14.1 Durasi Animasi

| Interaksi | Durasi | Easing |
|-----------|--------|--------|
| Tap produk → masuk keranjang | 150ms | ease-out, scale bounce ringan |
| Modal open/close | 200ms | ease-in-out |
| Toast notifikasi | 250ms masuk, auto-hide 3s | ease-out |
| Bottom sheet expand/collapse | 250ms | ease-in-out |

### 14.2 Hover & Focus States

| Elemen | Hover | Focus |
|--------|-------|-------|
| Tombol | Darken background 1 step | Ring 2px primary-500 |
| Card produk | Shadow naik sedikit (desktop) | Ring 2px primary-500 |
| Link sidebar | Background primary-700 | Ring 2px |

### 14.3 Confirmation Pattern

| Aksi | Butuh Konfirmasi? |
|------|-------------------|
| Void transaksi | Ya — dialog konfirmasi wajib |
| Nonaktifkan akun Kasir | Ya — dialog konfirmasi wajib |
| Klik "Sudah Dibayar" (QRIS) | Tidak — aksi langsung, dianggap kasir sudah memverifikasi |
| Hapus kategori/produk | Ya — dialog konfirmasi wajib |

---

## 15. Validation Rules

### 15.1 Prinsip Validasi

Validasi terjadi di dua lapis: **client-side** (feedback instan) dan **server-side** (keamanan, wajib di setiap API).

### 15.2 Visual State

| State | Border | Indikator |
|-------|--------|-----------|
| Default | `neutral-200` | — |
| Focus | `primary-500` | Ring 2px |
| Error | `error` (#B91C1C) | Ikon `alert-circle` + teks error di bawah field |
| Success | `success` (#15803D) | Ikon `check-circle` (opsional, untuk field async-validated seperti email unik) |

### 15.3 Pesan Error per Field

| Field | Pesan Error |
|-------|-------------|
| Email kosong/invalid | "Masukkan email yang valid" |
| Password < 8 karakter | "Password minimal 8 karakter" |
| Harga jual ≤ 0 | "Harga jual harus lebih dari 0" |
| Foto > 5MB | "Ukuran foto maksimal 5MB" |
| Uang diterima < total | "Uang diterima kurang dari total transaksi" |
| Stok tidak cukup | "Stok [nama produk] tidak cukup, sisa [n]" |

---

## 16. Empty States

### 16.1 Template Empty State

```html
<div class="flex flex-col items-center text-center py-12">
  <icon class="w-12 h-12 text-neutral-400 mb-3" />
  <p class="text-base font-medium text-neutral-700">{judul}</p>
  <p class="text-sm text-neutral-500">{deskripsi}</p>
</div>
```

### 16.2 Konten Empty State per Halaman

| Halaman | Judul | Deskripsi |
|---------|-------|-----------|
| Data Barang (belum ada produk) | "Belum ada produk" | "Tambahkan produk pertama untuk mulai berjualan" |
| Riwayat Transaksi | "Belum ada transaksi" | "Transaksi hari ini akan muncul di sini" |
| Laporan (periode kosong) | "Belum ada data" | "Tidak ada transaksi lunas pada periode ini" |
| Audit Log | "Belum ada aktivitas tercatat" | "Log akan muncul saat ada aksi seperti void transaksi" |

---

## 17. Error States

### 17.1 Tipe Error

| Tipe | Penanganan |
|------|-----------|
| Validasi Form | Inline di bawah field |
| Error Server (5xx) | Toast merah + opsi "Coba lagi" |
| Koneksi Terputus | Banner persisten di atas halaman: "Koneksi terputus, beberapa data mungkin tidak tersimpan" |
| 404 / Halaman Tidak Ditemukan | Halaman error dedicated dengan tombol "Kembali ke Dashboard" |

### 17.2 Inline Alert

```html
<div class="flex items-start gap-2 p-3 rounded-md bg-[--color-error]/10
  text-[--color-error] text-sm">
  <icon class="w-4 h-4 mt-0.5" /> Stok Es Kopi Susu tidak cukup, sisa 2
</div>
```

### 17.3 Halaman Error

| Kode | Judul | Aksi |
|------|-------|------|
| 404 | "Halaman tidak ditemukan" | Tombol kembali ke Dashboard |
| 403 | "Anda tidak punya akses ke halaman ini" | Tombol kembali ke Dashboard |
| 500 | "Terjadi kesalahan pada server" | Tombol coba lagi |

---

## 18. Loading States

### 18.1 Tipe Loading

| Konteks | Komponen |
|---------|----------|
| Memuat grid produk pertama kali | Skeleton card |
| Submit form | Spinner di dalam tombol + teks "Menyimpan..." |
| Konfirmasi pembayaran QRIS | Spinner di tombol "Sudah Dibayar" + teks "Memproses..." |
| Generate laporan/export Excel | Spinner full-panel + teks "Menyiapkan laporan..." |

### 18.2 Skeleton Screen

```html
<div class="animate-pulse bg-neutral-200 rounded-lg h-24 w-full"></div>
```

### 18.3 Loading Button

```html
<button disabled class="bg-accent-500 text-white h-16 rounded-lg opacity-70
  flex items-center justify-center gap-2">
  <spinner class="w-5 h-5 animate-spin" /> Memproses...
</button>
```

### 18.4 Threshold Loading

Spinner hanya ditampilkan jika proses > 300ms, untuk menghindari "flash" loading pada respons cepat.

---

## 19. Notification Patterns

### 19.1 Filosofi Notifikasi

KasirKu **tidak menggunakan** notifikasi eksternal (WhatsApp/email/push) untuk event operasional harian — seluruh feedback bersifat **in-app**, mengingat seluruh konfirmasi pembayaran dilakukan manual oleh kasir secara langsung.

### 19.2 Tipe Notifikasi In-App

| Tipe | Komponen | Durasi |
|------|----------|--------|
| Sukses (transaksi lunas) | Toast hijau, posisi top-center | Auto-hide 3s |
| Warning (stok menipis) | Badge persisten di Dashboard Owner | Sampai stok direstok |
| Error (validasi/server) | Toast merah | Auto-hide 4s atau sampai ditutup manual |
| Info (void berhasil) | Toast netral | Auto-hide 3s |

### 19.3 Notifikasi via Email (Eksternal — Terbatas)

| Event | Channel | Catatan |
|-------|---------|---------|
| Lupa Password | Email (Supabase Auth) | Satu-satunya notifikasi eksternal di sistem ini |

---

## 20. Dashboard Standards

### 20.1 Prinsip Dashboard

| Prinsip | Detail |
|---------|--------|
| Above the fold | Total Penjualan Hari Ini & Jumlah Transaksi wajib terlihat tanpa scroll |
| Real-time | Clock dan ringkasan transaksi update otomatis via Supabase Realtime, tanpa perlu refresh manual |
| Role-based | Dashboard Owner menampilkan profit & stok; Dashboard Kasir hanya menampilkan ringkasan transaksi sendiri |

### 20.2 Komponen Dashboard Owner

| Widget | Posisi |
|--------|--------|
| Real-time Clock | Header |
| Stat Card: Total Penjualan & Jumlah Transaksi | Baris atas |
| Low Stock Alert | Baris kedua, highlight warna warning |
| Shortcut: Buat Transaksi, Lihat Laporan | Floating action / baris bawah |

### 20.3 Komponen Dashboard Kasir

| Widget | Posisi |
|--------|--------|
| Real-time Clock | Header |
| Stat Card: Transaksi Saya Hari Ini | Baris atas |
| Tombol besar "Buat Transaksi Baru" | Area utama, paling prominent |

---

## 21. Framework Analysis & Rekomendasi

### 21.1 Perbandingan Framework

| Aspek | Tailwind CSS | Bootstrap | Material Design |
|-------|:------------:|:---------:|:----------------:|
| Kustomisasi visual (brand coffee shop) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Kecepatan development | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Kompatibilitas Next.js | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Ukuran bundle akhir | ⭐⭐⭐⭐⭐ (utility, purge unused) | ⭐⭐⭐ | ⭐⭐ |
| Kesesuaian UI custom (grid produk, numpad, bottom sheet) | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

### 21.2 Rekomendasi

**Tailwind CSS** direkomendasikan sebagai framework utama untuk KasirKu, dengan alasan:

1. **Kustomisasi penuh warna brand** — palet Espresso Brown & Caramel Amber tidak tersedia siap pakai di Bootstrap/Material, sementara Tailwind memungkinkan extend `theme.colors` langsung seperti pada token di Bab 11.
2. **Komponen non-standar** — grid produk dengan card bergambar, numpad cash custom, dan bottom sheet keranjang lebih mudah dibangun dari utility class Tailwind dibanding override komponen Bootstrap/Material yang sudah memiliki opini desain kuat.
3. **Integrasi native dengan Next.js** — Tailwind adalah pilihan default ekosistem Next.js App Router, minim konfigurasi tambahan.
4. **Performa di device kasir low-end** — Tailwind men-generate CSS yang di-purge sesuai class terpakai, menghasilkan bundle lebih kecil dibanding Bootstrap penuh, penting karena Kasir sering memakai tablet/HP kelas menengah.

Material Design dipertimbangkan namun kurang sesuai karena opininya yang kuat terhadap elevation & motion akan memerlukan banyak override untuk mencapai identitas visual coffee shop yang hangat. Bootstrap dipertimbangkan untuk kecepatan awal development, namun komponen grid produk dan panel pembayaran custom akan lebih banyak melawan style bawaan Bootstrap daripada memanfaatkannya.

---

*Dokumen ini merupakan bagian dari Source of Truth (SOT) proyek KasirKu.*
*Referensi silang wajib dengan: Information Architecture, User Flow, dan Software Requirement Specification.*