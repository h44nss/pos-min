"use client";
import { useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/utils/format';
import { Download, TrendingUp, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getReportData } from '@/lib/transactionService';

export default function LaporanPage() {
  const [period, setPeriod] = useState<7 | 30>(7); // 7 = Mingguan, 30 = Bulanan
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const data = await getReportData(period);
        setTransactions(data);
      } catch (error) {
        console.error("Gagal memuat laporan", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, [period]);

  const metrics = useMemo(() => {
    let totalPendapatan = 0;
    let totalHPP = 0;
    let qrisCount = 0;
    let cashCount = 0;
    
    // Untuk chart tren harian
    const trendMap: Record<string, { sales: number; profit: number }> = {};
    
    // Untuk produk terlaris
    const productMap: Record<string, number> = {};

    transactions.forEach(trx => {
      totalPendapatan += trx.total_amount;
      if (trx.payment_method === 'QRIS') qrisCount++;
      if (trx.payment_method === 'CASH') cashCount++;

      // Tanggal (YYYY-MM-DD)
      const dateStr = new Date(trx.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      if (!trendMap[dateStr]) trendMap[dateStr] = { sales: 0, profit: 0 };
      
      trendMap[dateStr].sales += trx.total_amount;

      // Hitung HPP dan Top Products
      let trxHPP = 0;
      (trx.transaction_items || []).forEach((item: any) => {
        trxHPP += (item.hpp || 0) * item.quantity;
        
        if (!productMap[item.product_name]) productMap[item.product_name] = 0;
        productMap[item.product_name] += item.quantity;
      });

      trendMap[dateStr].profit += (trx.total_amount - trxHPP);
      totalHPP += trxHPP;
    });

    const totalProfit = totalPendapatan - totalHPP;
    const totalTrx = qrisCount + cashCount;
    const qrisPerc = totalTrx ? Math.round((qrisCount / totalTrx) * 100) : 0;
    const cashPerc = totalTrx ? Math.round((cashCount / totalTrx) * 100) : 0;

    // Convert map to array untuk chart
    const trendData = Object.keys(trendMap).map(key => ({
      name: key,
      sales: trendMap[key].sales,
      profit: trendMap[key].profit,
    }));

    const topProducts = Object.keys(productMap)
      .map(name => ({ name, qty: productMap[name] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5); // Ambil Top 5

    return {
      totalPendapatan,
      totalProfit,
      qrisPerc,
      cashPerc,
      trendData,
      topProducts,
    };
  }, [transactions]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Laporan Keuangan</h1>
          <p className="text-gray-500">Analisis performa penjualan coffee shop.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5 mr-2" />
          Export Excel
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setPeriod(7)}
          className={`px-4 py-2 font-medium ${period === 7 ? 'border-b-2 border-[#8B5E3C] text-[#8B5E3C]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mingguan (7 Hari)
        </button>
        <button 
          onClick={() => setPeriod(30)}
          className={`px-4 py-2 font-medium ${period === 30 ? 'border-b-2 border-[#8B5E3C] text-[#8B5E3C]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Bulanan (30 Hari)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Pendapatan</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(metrics.totalPendapatan)}</h3>
          <span className="text-sm text-green-600 flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> Data Realtime</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 font-medium mb-1">Total Profit Bersih</p>
          <h3 className="text-3xl font-bold text-[#8B5E3C] mb-2">{formatCurrency(metrics.totalProfit)}</h3>
          <span className="text-sm text-gray-500">Pendapatan dikurangi HPP</span>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="w-full">
            <p className="text-sm text-gray-500 font-medium mb-4">Metode Pembayaran</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#1D4ED8]"/> <span className="font-medium text-gray-700">{metrics.qrisPerc}% QRIS</span></div>
              <div className="flex items-center gap-2"><Banknote className="w-4 h-4 text-[#15803D]"/> <span className="font-medium text-gray-700">{metrics.cashPerc}% Cash</span></div>
            </div>
            {/* Progress bar visual */}
            <div className="w-full h-2 bg-gray-200 rounded-full mt-3 flex overflow-hidden">
              <div style={{ width: `${metrics.qrisPerc}%` }} className="h-full bg-[#1D4ED8]"></div>
              <div style={{ width: `${metrics.cashPerc}%` }} className="h-full bg-[#15803D]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Tren Penjualan</h3>
          <div className="h-72 w-full">
            {metrics.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1DA" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
                  <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : value} />
                  <Line type="monotone" dataKey="sales" name="Penjualan" stroke="#8B5E3C" strokeWidth={3} dot={{r:4}} activeDot={{r:6}} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#15803D" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Belum ada data penjualan.</div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Top 5 Produk Terlaris</h3>
          <div className="h-72 w-full">
            {metrics.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={metrics.topProducts} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E1DA" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="qty" name="Terjual (Porsi/Cup)" fill="#E29C2E" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">Belum ada data penjualan.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
