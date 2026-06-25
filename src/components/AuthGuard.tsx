"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Cek session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));

      if (!session && !isPublic) {
        router.replace('/login');
      } else if (session && pathname === '/login') {
        router.replace('/dashboard');
      } else {
        setChecked(true);
      }
    });

    // Dengarkan perubahan auth state (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
      if (!session && !isPublic) {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Jangan render apa pun sampai pengecekan auth selesai
  // (mencegah flash konten halaman protected)
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (!isPublic && !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#8B5E3C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <span className="text-sm text-gray-500 font-medium">Memeriksa sesi...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
