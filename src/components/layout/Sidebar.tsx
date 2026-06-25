"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentProfile } from '@/lib/auth';
import { Profile } from '@/types';
import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingCart,
  History,
  BarChart3,
  Users,
  FileText,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchProf = async () => {
      const p = await getCurrentProfile();
      setProfile(p);
    };
    fetchProf();
  }, []);
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Kategori', href: '/kategori', icon: Tags },
    { name: 'Produk', href: '/produk', icon: Package },
    { name: 'Buat Transaksi', href: '/transaksi', icon: ShoppingCart },
    { name: 'Riwayat Transaksi', href: '/transaksi/riwayat', icon: History },
    { name: 'Laporan', href: '/laporan', icon: BarChart3 },
    { name: 'Pengguna', href: '/users', icon: Users },
    { name: 'Audit Log', href: '/audit-log', icon: FileText },
    { name: 'Profil', href: '/profil', icon: User },
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#3E2723] text-white flex-col transition-all duration-300 ease-in-out relative ${className}`}>
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
        {!isCollapsed && <h1 className="text-xl font-bold text-[#FFB300] whitespace-nowrap overflow-hidden transition-all duration-300">SarePOS</h1>}
        {isCollapsed && <h1 className="text-xl font-bold text-[#FFB300] mx-auto">S</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition-colors ${isCollapsed ? 'absolute -right-3 top-5 bg-[#3E2723] border border-white/10 rounded-full' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // Hide restricted items for KASIR
            if (profile?.role === 'KASIR' && ['/dashboard', '/kategori', '/produk', '/laporan', '/users', '/audit-log'].includes(item.href)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = item.href === '/transaksi' 
              ? pathname === '/transaksi' 
              : (pathname === item.href || pathname.startsWith(item.href + '/'));

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-3 transition-colors ${isActive ? 'bg-white/10 border-l-4 border-[#FFB300]' : 'hover:bg-white/5 border-l-4 border-transparent'}`}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} ${isActive ? 'text-[#FFB300]' : 'text-gray-400'}`} />
                  {!isCollapsed && (
                    <span className={`whitespace-nowrap transition-all duration-300 ${isActive ? 'font-medium text-white' : 'text-gray-300'}`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className={`p-4 border-t border-white/10 text-center transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
        <p className="text-[10px] text-gray-400 font-medium">
          &copy; 2026 SarePOS by Burhan.<br />All Rights Reserved.
        </p>
      </div>
    </aside>
  );
}
