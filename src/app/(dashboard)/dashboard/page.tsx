"use client";
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { DollarSign, ShoppingBag, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/transactionService';
import { getLowStockProducts } from '@/lib/productService';
import { Product } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({ totalSales: 0, totalTransactions: 0 });
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashboardStats, lowStockProds] = await Promise.all([
          getDashboardStats(),
          getLowStockProducts(5)
        ]);
        setStats(dashboardStats);
        setLowStock(lowStockProds);
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2A1B10]">Dashboard</h1>
        <p className="text-gray-500">Ringkasan aktivitas hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mr-4">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Penjualan</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mr-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Stok Menipis
            </h3>
            <Link href="/produk" className="text-sm text-[#1D4ED8] hover:underline flex items-center">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {lowStock.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4 text-right text-red-600 font-bold">{product.stock} tersisa</td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-gray-500">
                      Stok produk aman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/transaksi" className="flex flex-col items-center justify-center p-6 bg-[#FAF9F7] hover:bg-[#F0E0D4] border border-[#DEC3AC] rounded-xl transition-colors">
              <ShoppingBag className="w-8 h-8 text-[#8B5E3C] mb-2" />
              <span className="font-medium text-[#3E2818]">Kasir POS</span>
            </Link>
            <Link href="/laporan" className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors">
              <DollarSign className="w-8 h-8 text-gray-600 mb-2" />
              <span className="font-medium text-gray-700">Laporan</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
