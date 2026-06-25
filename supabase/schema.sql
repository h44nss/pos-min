-- =============================================================
-- KasirKu – Database Schema & Row Level Security (RLS)
-- Jalankan seluruh script ini di Supabase SQL Editor
-- =============================================================

-- -------------------------------------------------------
-- 0. ENUM TYPES
-- -------------------------------------------------------
CREATE TYPE payment_method AS ENUM ('CASH', 'QRIS');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'LUNAS', 'VOID');
CREATE TYPE user_role AS ENUM ('OWNER', 'KASIR');

-- -------------------------------------------------------
-- 1. TABEL PROFILES
-- Extends Supabase Auth (auth.users) dengan data tambahan
-- -------------------------------------------------------
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        user_role NOT NULL DEFAULT 'KASIR',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: otomatis buat profile saat user baru register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'KASIR')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -------------------------------------------------------
-- 2. TABEL CATEGORIES (Kategori Produk)
-- -------------------------------------------------------
CREATE TABLE public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 3. TABEL PRODUCTS (Data Barang)
-- -------------------------------------------------------
CREATE TABLE public.products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),
  hpp         INTEGER NOT NULL DEFAULT 0 CHECK (hpp >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 4. TABEL TRANSACTIONS (Kepala Transaksi)
-- -------------------------------------------------------
CREATE TABLE public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number  TEXT NOT NULL UNIQUE,
  cashier_id      UUID NOT NULL REFERENCES public.profiles(id),
  total_amount    INTEGER NOT NULL CHECK (total_amount > 0),
  received_amount INTEGER,                                 -- Untuk Cash
  change_amount   INTEGER,                                 -- Kembalian
  payment_method  payment_method NOT NULL,
  status          transaction_status NOT NULL DEFAULT 'LUNAS',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 5. TABEL TRANSACTION_ITEMS (Detail Barang per Transaksi)
-- -------------------------------------------------------
CREATE TABLE public.transaction_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,   -- snapshot nama saat transaksi
  price           INTEGER NOT NULL,
  hpp             INTEGER NOT NULL DEFAULT 0,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  subtotal        INTEGER NOT NULL
);

-- -------------------------------------------------------
-- 6. TABEL AUDIT_LOGS (Rekam Jejak Aksi Krusial)
-- -------------------------------------------------------
CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES public.profiles(id),
  actor_name  TEXT NOT NULL,
  action      TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------
-- 7. FUNGSI HELPER: Generate Invoice Number
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  seq_num INTEGER;
  today   TEXT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1
    INTO seq_num
    FROM public.transactions
   WHERE DATE(created_at) = CURRENT_DATE;
  RETURN 'TRX-' || today || '-' || LPAD(seq_num::TEXT, 4, '0');
END;
$$;

-- -------------------------------------------------------
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- 9. RLS POLICIES
-- -------------------------------------------------------

-- Helper: ambil role user yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- PROFILES: semua bisa lihat profil sendiri; Owner lihat semua
CREATE POLICY "users_see_own_profile"     ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "owner_see_all_profiles"    ON public.profiles FOR SELECT USING (get_my_role() = 'OWNER');
CREATE POLICY "owner_update_profiles"     ON public.profiles FOR UPDATE USING (get_my_role() = 'OWNER');
CREATE POLICY "owner_insert_profiles"     ON public.profiles FOR INSERT WITH CHECK (get_my_role() = 'OWNER');

-- CATEGORIES: semua bisa baca; Owner bisa ubah
CREATE POLICY "all_read_categories"       ON public.categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "owner_manage_categories"   ON public.categories FOR ALL USING (get_my_role() = 'OWNER');

-- PRODUCTS: semua bisa baca; Owner bisa ubah
CREATE POLICY "all_read_products"         ON public.products FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "owner_manage_products"     ON public.products FOR ALL USING (get_my_role() = 'OWNER');

-- TRANSACTIONS: kasir lihat transaksi hari ini miliknya; Owner lihat semua
CREATE POLICY "kasir_see_own_today"       ON public.transactions FOR SELECT
  USING (cashier_id = auth.uid() AND DATE(created_at) = CURRENT_DATE);
CREATE POLICY "owner_see_all_trx"         ON public.transactions FOR SELECT USING (get_my_role() = 'OWNER');
CREATE POLICY "authenticated_insert_trx"  ON public.transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_update_trx"  ON public.transactions FOR UPDATE USING (auth.role() = 'authenticated');

-- TRANSACTION_ITEMS: ikut akses transaksinya
CREATE POLICY "all_read_trx_items"        ON public.transaction_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_insert_items" ON public.transaction_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- AUDIT_LOGS: hanya Owner yang boleh lihat
CREATE POLICY "owner_see_audit_logs"      ON public.audit_logs FOR SELECT USING (get_my_role() = 'OWNER');
CREATE POLICY "system_insert_audit"       ON public.audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- -------------------------------------------------------
-- 10. SUPABASE STORAGE: Bucket untuk Foto Produk
-- -------------------------------------------------------
-- Jalankan via Dashboard Storage atau gunakan SQL di bawah:
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

CREATE POLICY "public_read_product_images"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "owner_upload_product_images"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "owner_delete_product_images"
  ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- -------------------------------------------------------
-- 11. SEED DATA AWAL (Opsional)
-- -------------------------------------------------------
INSERT INTO public.categories (name) VALUES
  ('Kopi'), ('Non-Kopi'), ('Makanan'), ('Snack');
