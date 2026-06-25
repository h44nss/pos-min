"use client";

import { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { Tags, Plus, Edit, Trash2, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from '@/lib/productService';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function KategoriPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });
  
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, category: Category | null}>({
    isOpen: false, category: null
  });

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
      console.error("Failed to load categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  const productCounts: Record<string, number> = {};
  products.forEach((p) => {
    if (p.category_id) {
      productCounts[p.category_id] = (productCounts[p.category_id] || 0) + 1;
    }
  });

  const openAdd = () => {
    setEditTarget(null);
    setFormName('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setFormName(cat.name);
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (cat: Category) => {
    const hasProducts = (productCounts[cat.id] || 0) > 0;
    if (hasProducts) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Tidak Bisa Dihapus',
        message: `Kategori "${cat.name}" masih memiliki ${productCounts[cat.id]} produk terkait.`
      });
      return;
    }
    setConfirmConfig({ isOpen: true, category: cat });
  };

  const executeDelete = async () => {
    const cat = confirmConfig.category;
    if (!cat) return;
    
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    try {
      await deleteCategory(cat.id);
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.message || 'Gagal menghapus kategori'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();

    if (!trimmed) { setFormError('Nama kategori wajib diisi.'); return; }
    if (trimmed.length > 50) { setFormError('Nama kategori maksimal 50 karakter.'); return; }

    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editTarget?.id
    );
    if (isDuplicate) { setFormError('Nama kategori sudah ada.'); return; }

    try {
      setIsSubmitting(true);
      if (editTarget) {
        // Edit
        const updated = await updateCategory(editTarget.id, trimmed);
        setCategories(prev => prev.map(c => c.id === editTarget.id ? updated : c));
      } else {
        // Tambah baru
        const added = await createCategory(trimmed);
        setCategories(prev => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat kategori...</div>;
  }

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Kategori Produk</h1>
          <p className="text-gray-500">Kelola kategori untuk filter menu kasir.</p>
        </div>
        <button onClick={openAdd} className="bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors">
          <Plus className="w-5 h-5 mr-2" /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F7] text-gray-500 text-sm">
            <tr>
              <th className="p-4 font-medium border-b border-gray-100">Nama Kategori</th>
              <th className="p-4 font-medium border-b border-gray-100 text-center">Jumlah Produk</th>
              <th className="p-4 font-medium border-b border-gray-100 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900 flex items-center">
                  <Tags className="w-5 h-5 text-gray-400 mr-3" />{cat.name}
                </td>
                <td className="p-4 text-center">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                    {productCounts[cat.id] || 0} Produk
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-2 text-gray-400 hover:text-[#1D4ED8] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(cat)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">Tidak ada kategori yang ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#FAF9F7]">
              <h2 className="text-lg font-bold text-[#2A1B10]">
                {editTarget ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formName}
                  onChange={e => { setFormName(e.target.value); setFormError(''); }}
                  className={`w-full px-4 py-2.5 rounded-xl border ${formError ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none`}
                  placeholder="Contoh: Minuman Panas"
                  autoFocus
                />
                {formError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {formError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white font-bold flex items-center gap-2 disabled:opacity-70">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                  {editTarget ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REUSABLE MODALS */}
      <AlertModal 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Hapus Kategori?"
        message={`Yakin ingin menghapus kategori "${confirmConfig.category?.name}"? Aksi ini tidak dapat dibatalkan.`}
        isDestructive={true}
        confirmText="Hapus Kategori"
        onConfirm={executeDelete}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
