"use client";

import { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Plus, Search, Edit, Trash2, AlertTriangle, X, Upload, Check, Loader2 } from 'lucide-react';
import { getProducts, getCategories, createProduct, updateProduct, softDeleteProduct } from '@/lib/productService';

type FormState = {
  name: string; categoryId: string; price: string; hpp: string; stock: string; imageFile?: File;
};
const DEFAULT_FORM: FormState = { name: '', categoryId: '', price: '', hpp: '', stock: '' };

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [photoError, setPhotoError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cats, prods] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.is_active
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setPhotoError('');
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setForm({
      name: product.name,
      categoryId: product.category_id ?? '',
      price: product.price.toString(),
      hpp: product.hpp.toString(),
      stock: product.stock.toString(),
    });
    setPhotoError('');
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm(prev => ({ ...prev, imageFile: undefined }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) { setPhotoError('Ukuran foto maksimal 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setPhotoError('Format harus jpg/png/webp'); return; }
    setPhotoError('');
    setForm(prev => ({ ...prev, imageFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photoError) return;

    try {
      setIsSubmitting(true);
      if (editTarget) {
        const updated = await updateProduct(editTarget.id, {
          name: form.name,
          category_id: form.categoryId,
          price: parseInt(form.price),
          hpp: parseInt(form.hpp),
          stock: parseInt(form.stock),
        }, form.imageFile);
        
        // Perbarui list produk
        setProducts(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...updated } : p));
      } else {
        const added = await createProduct({
          name: form.name,
          category_id: form.categoryId,
          price: parseInt(form.price),
          hpp: parseInt(form.hpp),
          stock: parseInt(form.stock),
          imageFile: form.imageFile,
        });
        setProducts(prev => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await softDeleteProduct(deleteConfirm.id);
      setProducts(prev => prev.map(p => p.id === deleteConfirm.id ? { ...p, is_active: false } : p));
    } catch (err: any) {
      alert(err.message || "Gagal menghapus produk");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat produk...</div>;
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Data Produk</h1>
          <p className="text-gray-500">Kelola daftar menu dan inventaris stok toko.</p>
        </div>
        <button onClick={openAdd} className="bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Tambah Produk
        </button>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-t-xl border-b border-gray-100 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari nama produk..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 bg-white overflow-auto shadow-sm rounded-b-xl">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF9F7] text-gray-500 text-sm border-b border-gray-100">
              <th className="font-medium p-4">Nama Produk</th>
              <th className="font-medium p-4">Kategori</th>
              <th className="font-medium p-4">Harga Jual</th>
              <th className="font-medium p-4">HPP (Modal)</th>
              <th className="font-medium p-4">Stok</th>
              <th className="font-medium p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredProducts.map(product => {
              const category = categories.find(c => c.id === product.category_id);
              const isLowStock = product.stock <= 10;
              return (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-200">IMG</div>}
                      </div>
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">{category?.name || '-'}</span>
                  </td>
                  <td className="p-4 font-medium text-[#8B5E3C]">{formatCurrency(product.price)}</td>
                  <td className="p-4 text-gray-500">{formatCurrency(product.hpp)}</td>
                  <td className="p-4">
                    {isLowStock
                      ? <span className="flex items-center text-red-600 font-bold gap-1.5">{product.stock} <AlertTriangle className="w-4 h-4" /></span>
                      : <span className="font-medium">{product.stock}</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-2 text-gray-400 hover:text-[#1D4ED8] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredProducts.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Tidak ada produk yang ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAF9F7]">
              <h2 className="text-xl font-bold text-[#2A1B10]">{editTarget ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Produk <span className="text-red-500">*</span></label>
                      <input type="text" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none" placeholder="Nama produk" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                      <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none bg-white">
                        <option value="" disabled>Pilih Kategori</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stok <span className="text-red-500">*</span></label>
                      <input type="number" required min="0" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none" placeholder="0" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Harga Jual (Rp) <span className="text-red-500">*</span></label>
                      <input type="number" required min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none" placeholder="25000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Harga Modal / HPP (Rp) <span className="text-red-500">*</span></label>
                      <input type="number" required min="0" value={form.hpp} onChange={e => setForm({ ...form, hpp: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none" placeholder="15000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Foto Produk (Opsional)</label>
                      <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${photoError ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                        <Upload className={`w-7 h-7 mb-2 ${photoError ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="text-sm text-gray-500">
                          {form.imageFile ? form.imageFile.name : 'PNG, JPG, WEBP (Maks. 5MB)'}
                        </p>
                        <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
                      </label>
                      {photoError && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> {photoError}</p>}
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">Batal</button>
              <button form="productForm" type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white font-bold flex items-center gap-2 disabled:opacity-70">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                {editTarget ? 'Simpan Perubahan' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Produk?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Produk <span className="font-semibold text-gray-800">"{deleteConfirm.name}"</span> akan dinonaktifkan dan tidak muncul di kasir.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
