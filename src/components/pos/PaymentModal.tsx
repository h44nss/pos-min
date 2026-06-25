import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { QrCode, Banknote, X, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  method: 'QRIS' | 'CASH' | null;
  onSuccess: (receivedAmount?: number) => Promise<void>;
}

export default function PaymentModal({ isOpen, onClose, totalAmount, method, onSuccess }: PaymentModalProps) {
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReceivedAmount('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumpadClick = (val: string) => {
    if (val === 'C') {
      setReceivedAmount('');
    } else if (val === '000') {
      if (receivedAmount === '') return;
      setReceivedAmount(prev => prev + '000');
    } else {
      setReceivedAmount(prev => prev + val);
    }
  };

  const handleQuickAmount = (amount: number | 'PAS') => {
    if (amount === 'PAS') {
      setReceivedAmount(totalAmount.toString());
    } else {
      setReceivedAmount(amount.toString());
    }
  };

  const numericReceived = parseInt(receivedAmount || '0', 10);
  const change = numericReceived - totalAmount;
  const isCashValid = numericReceived >= totalAmount;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onSuccess(method === 'CASH' ? numericReceived : undefined);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center flex flex-col items-center animate-in zoom-in duration-200">
          <CheckCircle2 className="w-24 h-24 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 mb-6">Transaksi telah disimpan ke sistem.</p>
          {method === 'CASH' && change > 0 && (
            <div className="bg-green-50 p-4 rounded-xl w-full border border-green-100">
              <span className="block text-sm text-green-700 mb-1">Kembalian</span>
              <span className="block text-3xl font-bold text-green-800">{formatCurrency(change)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-[#FAF9F7]">
          <h2 className="text-xl font-bold flex items-center gap-2 text-[#2A1B10]">
            {method === 'QRIS' ? <QrCode className="w-6 h-6 text-[#1D4ED8]" /> : <Banknote className="w-6 h-6 text-[#15803D]" />}
            Pembayaran {method}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
          <div className="text-center w-full mb-6">
            <p className="text-gray-500 text-sm mb-1">Total Tagihan</p>
            <p className="text-4xl sm:text-5xl font-bold text-[#8B5E3C]">{formatCurrency(totalAmount)}</p>
          </div>

          {method === 'QRIS' ? (
            <div className="flex flex-col items-center w-full">
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200 mb-6 flex flex-col items-center justify-center">
                {/* Placeholder for real QR Code */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-gray-300" />
                </div>
                <p className="mt-4 text-sm text-gray-500 font-medium">Scan QRIS ini menggunakan aplikasi M-Banking atau E-Wallet.</p>
              </div>
              
              <button 
                onClick={handleConfirm}
                disabled={isProcessing}
                className="w-full bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xl h-16 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isProcessing ? 'Memproses...' : <><CheckCircle2 className="w-6 h-6" /> Sudah Dibayar</>}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Uang Diterima & Kembalian */}
              <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Uang Diterima</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(numericReceived)}</p>
                </div>
                <div className={`p-4 rounded-xl border ${change >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm mb-1 ${change >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {change >= 0 ? 'Kembalian' : 'Kurang'}
                  </p>
                  <p className={`text-xl sm:text-2xl font-bold ${change >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    {formatCurrency(Math.abs(change))}
                  </p>
                </div>
              </div>

              {/* Numpad */}
              <div className="w-full">
                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <button onClick={() => handleQuickAmount('PAS')} className="bg-[#FFFBEB] text-[#B45309] border border-[#F2B544] font-semibold py-2 rounded-lg text-sm hover:bg-[#FEF3C7] transition-colors">Uang Pas</button>
                  <button onClick={() => handleQuickAmount(50000)} className="bg-gray-50 border border-gray-200 font-medium py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">50k</button>
                  <button onClick={() => handleQuickAmount(100000)} className="bg-gray-50 border border-gray-200 font-medium py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors">100k</button>
                  <button onClick={() => handleNumpadClick('C')} className="bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-lg text-sm hover:bg-red-100 transition-colors">Hapus</button>
                </div>

                {/* Main Numpad */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumpadClick(num)}
                      className={`bg-white border border-gray-200 shadow-sm py-3 sm:py-4 rounded-xl text-xl font-mono font-bold text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-colors ${num === '0' ? 'col-span-2' : ''}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full mt-6">
                <button 
                  onClick={handleConfirm}
                  disabled={!isCashValid || isProcessing}
                  className="w-full bg-[#15803D] hover:bg-green-800 text-white font-bold text-xl h-16 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Memproses...' : <><CheckCircle2 className="w-6 h-6" /> Selesai & Cetak</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
