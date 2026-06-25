"use client";

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/utils/format';
import { Search, Filter, AlertCircle, CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { getTransactions, voidTransaction } from '@/lib/transactionService';
import { getCurrentProfile } from '@/lib/auth';
import { Transaction, Profile } from '@/types';
import AlertModal from '@/components/ui/AlertModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function RiwayatTransaksiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [isVoiding, setIsVoiding] = useState<string | null>(null);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  // UI Modal state
  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, type: 'success' | 'error' | 'info', title: string, message: string}>({
    isOpen: false, type: 'info', title: '', message: ''
  });
  
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, trxId: string, invoiceNumber: string}>({
    isOpen: false, trxId: '', invoiceNumber: ''
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const [data, profile] = await Promise.all([
          getTransactions(),
          getCurrentProfile()
        ]);
        setTransactions(data);
        setUserProfile(profile);
      } catch (error) {
        console.error("Gagal memuat riwayat", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const triggerVoid = (trx: Transaction) => {
    if (trx.status === 'VOID') return;
    setConfirmConfig({
      isOpen: true,
      trxId: trx.id,
      invoiceNumber: trx.invoice_number
    });
  };

  const executeVoid = async () => {
    const { trxId, invoiceNumber } = confirmConfig;
    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    setIsVoiding(trxId);

    try {
      await voidTransaction(trxId, userProfile?.full_name || 'Unknown User');
      
      // Update UI state
      setTransactions(prev => prev.map(t => 
        t.id === trxId ? { ...t, status: 'VOID' } : t
      ));
      setAlertConfig({
        isOpen: true,
        type: 'success',
        title: 'Berhasil',
        message: `Transaksi ${invoiceNumber} berhasil dibatalkan.`
      });
    } catch (err: any) {
      setAlertConfig({
        isOpen: true,
        type: 'error',
        title: 'Gagal',
        message: err.message || 'Gagal membatalkan transaksi'
      });
    } finally {
      setIsVoiding(null);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t as any).profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2A1B10]">Riwayat Transaksi</h1>
          <p className="text-gray-500">Daftar transaksi yang tercatat di sistem.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari ID Transaksi atau Kasir..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-[#FAF9F7] text-gray-500 text-sm">
              <tr>
                <th className="p-4 font-medium border-b border-gray-100">ID Transaksi</th>
                <th className="p-4 font-medium border-b border-gray-100">Waktu</th>
                <th className="p-4 font-medium border-b border-gray-100">Kasir</th>
                <th className="p-4 font-medium border-b border-gray-100">Metode</th>
                <th className="p-4 font-medium border-b border-gray-100">Total</th>
                <th className="p-4 font-medium border-b border-gray-100">Status</th>
                <th className="p-4 font-medium border-b border-gray-100 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map(trx => (
                <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{trx.invoice_number}</td>
                  <td className="p-4 text-gray-500">{formatDate(new Date(trx.created_at))}</td>
                  <td className="p-4 text-gray-700">{(trx as any).profiles?.full_name || 'Kasir'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${trx.payment_method === 'QRIS' ? 'bg-[#1D4ED8]/10 text-[#1D4ED8]' : 'bg-[#15803D]/10 text-[#15803D]'}`}>
                      {trx.payment_method}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{formatCurrency(trx.total_amount)}</td>
                  <td className="p-4">
                    {trx.status === 'LUNAS' ? (
                      <span className="flex items-center text-sm font-medium text-[#15803D] bg-[#ECFDF5] border border-green-200 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Lunas
                      </span>
                    ) : (
                      <span className="flex items-center text-sm font-medium text-[#B91C1C] bg-[#FEF2F2] border border-red-200 px-2.5 py-1 rounded-full w-fit">
                        <AlertCircle className="w-4 h-4 mr-1" /> Void
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedTrx(trx)}
                        className="text-sm font-medium text-[#8B5E3C] hover:underline px-2 py-1"
                      >
                        Detail
                      </button>
                      {trx.status === 'LUNAS' && (
                        <button 
                          onClick={() => triggerVoid(trx)}
                          disabled={isVoiding === trx.id}
                          className="flex items-center text-sm font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                        >
                          {isVoiding === trx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4 mr-1" />}
                          Void
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">Tidak ada riwayat transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL TRANSAKSI */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detail Transaksi</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedTrx.invoice_number}</p>
              </div>
              <button onClick={() => setSelectedTrx(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <AlertCircle className="w-6 h-6 hidden" /> {/* spacer */}
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex justify-between text-sm mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-gray-500 mb-1">Kasir</p>
                  <p className="font-medium text-gray-900">{(selectedTrx as any).profiles?.full_name || 'System'}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 mb-1">Waktu</p>
                  <p className="font-medium text-gray-900">{formatDate(new Date(selectedTrx.created_at))}</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4">Item Pesanan</h3>
              <div className="space-y-4">
                {(selectedTrx.transaction_items || []).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">{item.quantity}x @ {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
                {(!selectedTrx.transaction_items || selectedTrx.transaction_items.length === 0) && (
                  <p className="text-gray-500 text-sm">Tidak ada detail item.</p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-gray-500 text-sm">
                  <p>Metode Pembayaran</p>
                  <p className="font-medium text-gray-900">{selectedTrx.payment_method}</p>
                </div>
                {selectedTrx.payment_method === 'CASH' && selectedTrx.received_amount && (
                  <>
                    <div className="flex justify-between text-gray-500 text-sm">
                      <p>Uang Diterima</p>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedTrx.received_amount)}</p>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                      <p>Kembalian</p>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedTrx.change_amount || 0)}</p>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100 border-dashed">
                  <p className="font-bold text-gray-900">Total Akhir</p>
                  <p className="text-xl font-bold text-[#8B5E3C]">{formatCurrency(selectedTrx.total_amount)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50">
              <button 
                onClick={() => setSelectedTrx(null)}
                className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE MODALS */}
      <AlertModal 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Void Transaksi?"
        message={`Yakin ingin membatalkan (VOID) transaksi ${confirmConfig.invoiceNumber}? Stok barang yang dibeli akan dikembalikan otomatis.`}
        isDestructive={true}
        confirmText="Ya, Void Transaksi"
        onConfirm={executeVoid}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
