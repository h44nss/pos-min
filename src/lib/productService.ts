import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';

// -------------------------------------------------------
// CATEGORIES
// -------------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Category[];
}

export async function createCategory(name: string) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string) {
  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// -------------------------------------------------------
// PRODUCTS
// -------------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  if (error) throw error;
  return data as Product[];
}

export async function getLowStockProducts(limit: number = 5): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock')
    .eq('is_active', true)
    .lte('stock', 10)
    .order('stock', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(payload: {
  name: string;
  category_id: string;
  price: number;
  hpp: number;
  stock: number;
  imageFile?: File;
}) {
  let image_url: string | null = null;

  // Upload foto ke Supabase Storage jika ada
  if (payload.imageFile) {
    const ext = payload.imageFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('product-images')
      .upload(path, payload.imageFile);
    if (storageError) throw storageError;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storageData.path);
    image_url = urlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: payload.name,
      category_id: payload.category_id,
      price: payload.price,
      hpp: payload.hpp,
      stock: payload.stock,
      image_url
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Product>, imageFile?: File) {
  let image_url = updates.image_url;

  if (imageFile) {
    const ext = imageFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile);
    if (storageError) throw storageError;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storageData.path);
    image_url = urlData.publicUrl;
  }

  const payload = { ...updates, updated_at: new Date().toISOString() };
  if (image_url !== undefined) payload.image_url = image_url;

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Soft delete (nonaktifkan)
export async function softDeleteProduct(id: string) {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

// Decrement stock saat transaksi
export async function decrementStock(productId: string, qty: number) {
  const { error } = await supabase.rpc('decrement_stock', {
    p_product_id: productId,
    p_qty: qty
  });
  if (error) throw error;
}

// Restore stock saat void
export async function restoreStock(productId: string, qty: number) {
  const { error } = await supabase.rpc('restore_stock', {
    p_product_id: productId,
    p_qty: qty
  });
  if (error) throw error;
}
