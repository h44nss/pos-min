"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth';
import { Profile } from '@/types';
import { Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentProfile();
        
        if (!profile) {
          router.replace('/login');
          return;
        }

        // KASIR RBAC (Role-Based Access Control)
        if (profile.role === 'KASIR') {
          // Daftar route yang dilarang untuk kasir
          const restrictedRoutes = ['/dashboard', '/laporan', '/kategori', '/produk', '/users', '/audit-log'];
          
          if (restrictedRoutes.includes(pathname)) {
            router.replace('/transaksi');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (err) {
        console.error('Auth error:', err);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="w-10 h-10 animate-spin text-[#8B5E3C]" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
