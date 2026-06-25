"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, Shield, ShieldAlert, Edit, Ban, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Profile } from '@/types';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import PasswordInput from '@/components/ui/PasswordInput';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // UI Modal state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });
  
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, userId: string, currentStatus: boolean}>({
    isOpen: false, title: '', message: '', userId: '', currentStatus: false
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: false }); // Owner first usually
      
      if (error) throw error;
      setUsers(data as Profile[]);
    } catch (err) {
      console.error("Gagal memuat pengguna", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddKasir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Gunakan instance terpisah agar session Owner saat ini tidak terganti
      const tempClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await tempClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'KASIR'
          }
        }
      });

      if (error) throw error;

      setAlertConfig({
        isOpen: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Berhasil mendaftarkan kasir baru! Pastikan untuk memeriksa email konfirmasi jika fitur Email Confirmation menyala di Supabase.'
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '' });
      fetchUsers(); // Refresh daftar user

    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerToggleStatus = (userId: string, currentStatus: boolean) => {
    setConfirmConfig({
      isOpen: true,
      title: currentStatus ? 'Nonaktifkan Kasir?' : 'Aktifkan Kasir?',
      message: `Yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} kasir ini? Mereka ${currentStatus ? 'tidak akan bisa login lagi' : 'akan bisa login kembali'}.`,
      userId,
      currentStatus
    });
  };

  const executeToggleStatus = async () => {
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    const { userId, currentStatus } = confirmConfig;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);
        
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal mengubah status kasir: ' + err.message
      });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Manajemen Akun Kasir</h1>
          <p className="text-gray-500">Kelola akses staf ke dalam sistem POS.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Kasir
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAF9F7] text-gray-500 text-sm">
            <tr>
              <th className="p-4 font-medium border-b border-gray-100">Nama</th>
              <th className="p-4 font-medium border-b border-gray-100">Status</th>
              <th className="p-4 font-medium border-b border-gray-100">Role</th>
              <th className="p-4 font-medium border-b border-gray-100 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{user.full_name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-[#ECFDF5] text-[#15803D] border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`flex items-center w-fit px-2.5 py-1 rounded-md text-xs font-bold ${user.role === 'OWNER' ? 'bg-[#FFB300]/20 text-[#C27F1C]' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role === 'OWNER' ? <ShieldAlert className="w-3.5 h-3.5 mr-1" /> : <Shield className="w-3.5 h-3.5 mr-1" />}
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.role !== 'OWNER' && (
                    <div className="flex items-center justify-end gap-2">
                      {/* Note: Mengganti password atau role idealnya lewat Supabase Admin SDK. Kita skip Edit untuk MVP atau bisa ditambahkan nanti. */}
                      <button 
                        onClick={() => triggerToggleStatus(user.id, user.is_active)}
                        className={`p-2 rounded-lg transition-colors ${user.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                        title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">Tidak ada pengguna.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TAMBAH KASIR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tambah Akun Kasir</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddKasir} className="p-6 space-y-4">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  placeholder="Budi Kasir"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                  placeholder="budi@example.com"
                />
              </div>

              <PasswordInput 
                label="Password Sementara"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                minLength={6}
                showLockIcon={false}
              />

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#6F4A2E] transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan
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
        title={confirmConfig.title}
        message={confirmConfig.message}
        isDestructive={confirmConfig.currentStatus}
        confirmText={confirmConfig.currentStatus ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        onConfirm={executeToggleStatus}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
