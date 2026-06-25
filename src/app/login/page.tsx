"use client";

import { useState } from 'react';
import { signIn } from '@/lib/auth';
import PasswordInput from '@/components/ui/PasswordInput';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn(email, password);
      // Hard redirect agar cookie Supabase terbaca oleh proxy server
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal';
      if (message.includes('Invalid login credentials')) {
        setError('Email atau password salah. Coba lagi.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-40 h-40 mx-auto mb-2 flex items-center justify-center">
            <img 
              src="https://a.top4top.io/p_3828j8ave1.png" 
              alt="SarePOS Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-500 mt-4">Masuk untuk memulai shift Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none transition-all"
              placeholder="admin@coffee.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <a href="/forgot-password" className="text-sm text-[#E29C2E] hover:underline">Lupa password?</a>
            </div>
            <PasswordInput
              label=""
              name="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="••••••••"
              showLockIcon={false}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white font-bold text-lg py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            ) : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
