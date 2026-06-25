"use client";

import { useState } from 'react';
import Link from 'next/link';
import { resetPasswordForEmail } from '@/lib/auth';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPasswordForEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim email reset. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#8B5E3C] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1"/>
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
              <line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Lupa Password?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Masukkan email Anda dan kami akan mengirimkan tautan untuk mereset password.
          </p>
        </div>

        {/* Success State */}
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Email Terkirim!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Kami telah mengirimkan tautan reset password ke <span className="font-semibold text-gray-700">{email}</span>. Cek kotak masuk atau folder Spam Anda.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-[#8B5E3C] hover:underline"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke halaman Login
            </Link>
          </div>
        ) : (
          <>
            {/* Error */}
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none transition-all"
                    placeholder="email@coffee.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white font-bold text-base py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : 'Kirim Tautan Reset'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#8B5E3C] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
