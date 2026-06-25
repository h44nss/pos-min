-- Jalankan di Supabase SQL Editor SETELAH schema.sql
-- Fungsi ini dipanggil lewat supabase.rpc() dari Next.js

-- Decrement stok saat transaksi berhasil
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
     SET stock = GREATEST(stock - p_qty, 0),
         updated_at = NOW()
   WHERE id = p_product_id;
END;
$$;

-- Restore stok saat transaksi di-void (BR-04)
CREATE OR REPLACE FUNCTION public.restore_stock(p_product_id UUID, p_qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
     SET stock = stock + p_qty,
         updated_at = NOW()
   WHERE id = p_product_id;
END;
$$;
