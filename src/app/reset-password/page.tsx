"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Lock } from 'lucide-react';
import PasswordInput from '@/components/ui/PasswordInput';

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }
    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
        <p className="text-gray-500 text-sm">Anda akan diarahkan ke halaman login dalam beberapa detik...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="Password Baru *"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 karakter"
        />

        <div>
          <PasswordInput
            label="Konfirmasi Password Baru *"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ulangi password baru"
            className={confirm && password !== confirm ? '!border-red-400' : ''}
          />
          {confirm && password !== confirm && (
            <p className="text-sm text-red-600 mt-1">Password tidak cocok.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || (!!confirm && password !== confirm)}
          className="w-full bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white font-bold text-base py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center mt-2"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          ) : 'Simpan Password Baru'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#8B5E3C] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md text-white">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Reset Password</h1>
          <p className="text-gray-500 mt-2 text-sm">Buat password baru untuk akun Anda.</p>
        </div>
        <Suspense fallback={<p className="text-center text-gray-500">Memuat...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
