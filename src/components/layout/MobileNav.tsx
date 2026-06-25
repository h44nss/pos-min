"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { Profile } from "@/types";
import { LayoutDashboard, ShoppingCart, Package, User, History } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProf = async () => {
      const p = await getCurrentProfile();
      setProfile(p);
    };
    fetchProf();
  }, []);

  const navItems = [
    { name: "Home", href: "/dashboard", icon: LayoutDashboard, restrictKasir: true },
    { name: "Kasir", href: "/transaksi", icon: ShoppingCart, restrictKasir: false },
    { name: "Riwayat", href: "/transaksi/riwayat", icon: History, restrictKasir: false },
    { name: "Produk", href: "/produk", icon: Package, restrictKasir: true },
    { name: "Profil", href: "/profil", icon: User, restrictKasir: false },
  ];

  // Filter items based on role
  const visibleItems = navItems.filter(item => {
    if (profile?.role === 'KASIR' && item.restrictKasir) return false;
    return true;
  });

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 px-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/transaksi' 
          ? pathname === '/transaksi' 
          : (pathname === item.href || pathname.startsWith(item.href + '/'));

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive ? 'text-[#8B5E3C]' : 'text-gray-500 hover:text-[#8B5E3C]'}`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
