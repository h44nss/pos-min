"use client";

import { useState, useEffect } from 'react';
import { Lock, Mail, Loader2 } from 'lucide-react';
import PasswordInput from '@/components/ui/PasswordInput';
import { getCurrentProfile, updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setEmail(user.email || '');

        const prof = await getCurrentProfile();
        setProfile(prof);
      } catch (error) {
        console.error("Gagal memuat profil", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setUpdateMsg({ type: 'error', text: 'Password minimal 6 karakter.' });
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMsg({ type: '', text: '' });
      await updatePassword(newPassword);
      setUpdateMsg({ type: 'success', text: 'Password berhasil diperbarui.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setUpdateMsg({ type: 'error', text: err.message || 'Gagal mengubah password.' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  const initials = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2A1B10]">Profil Saya</h1>
        <p className="text-gray-500">Kelola informasi akun Anda.</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="w-24 h-24 bg-[#FFB300] rounded-full flex items-center justify-center text-[#3E2723] text-4xl font-bold shadow-inner shrink-0">
            {initials}
          </div>
          <div className="min-w-0 w-full">
            <h2 className="text-2xl font-bold text-gray-900 truncate">{profile?.full_name || 'Pengguna'}</h2>
            <div className="text-gray-500 flex items-start justify-center sm:justify-start mt-1.5 break-all">
              <Mail className="w-4 h-4 mr-2 shrink-0 mt-1" /> 
              <span>{email}</span>
            </div>
            <span className="inline-block mt-4 px-3 py-1 bg-[#8B5E3C] text-white text-sm font-bold rounded-full">
              {profile?.role || 'Staff'}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-gray-400" /> Ubah Password
        </h3>

        {updateMsg.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm font-medium ${updateMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {updateMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <PasswordInput
            label="Password Saat Ini"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            showLockIcon={false}
          />
          <PasswordInput
            label="Password Baru"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            showLockIcon={false}
          />
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white px-6 py-2 rounded-lg font-medium transition-colors mt-2 disabled:opacity-70 flex items-center gap-2"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}
