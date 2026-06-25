"use client";

import { useState, useEffect } from 'react';
import { Product, CartItem, Category } from '@/types';
import { formatCurrency } from '@/utils/format';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, X, Loader2 } from 'lucide-react';
import PaymentModal from '@/components/pos/PaymentModal';
import { getProducts, getCategories } from '@/lib/productService';
import { createTransaction } from '@/lib/transactionService';

export default function TransaksiPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'CASH' | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (error: any) {
        console.error("Failed to fetch data for POS", error);
        alert(`Gagal memuat menu: ${error.message || JSON.stringify(error)}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === activeCategory);

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Limit to stock
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= item.product.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
      if (updated.length === 0) setIsMobileCartOpen(false);
      return updated;
    });
  };

  const handleCheckoutSuccess = async (receivedAmount?: number) => {
    if (!paymentMethod || cart.length === 0) return;
    
    // Save to Supabase
    await createTransaction(cart, paymentMethod, receivedAmount);

    // After success, clear cart and close modal
    setCart([]);
    setPaymentMethod(null);
    setIsMobileCartOpen(false);
    
    // Refetch products to get updated stock
    const prods = await getProducts();
    setProducts(prods);
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat menu POS...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      
      {/* KIRI: Grid Produk */}
      <div className="flex-1 flex flex-col min-h-0 pb-16 lg:pb-0">
        {/* Filter Kategori */}
        <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar border-b border-gray-200 mb-4 shrink-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeCategory === 'all' 
                ? 'bg-[#3E2723] text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                activeCategory === cat.id 
                  ? 'bg-[#3E2723] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* List Produk */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
                className="bg-white rounded-xl shadow-sm overflow-hidden text-left hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed group flex flex-col h-full border border-transparent hover:border-[#FFB300]"
              >
                <div className="relative w-full aspect-square bg-gray-100">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">Habis</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Sisa: {product.stock}</p>
                  </div>
                  <div className="font-bold text-[#8B5E3C] mt-2">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500">
                Tidak ada produk di kategori ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Mobile Only) */}
      {cart.length > 0 && !isMobileCartOpen && (
        <button 
          onClick={() => setIsMobileCartOpen(true)}
          className="lg:hidden fixed bottom-20 left-4 right-4 bg-[#8B5E3C] text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-30 transition-transform hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center">
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold mr-3">{totalItems}</div>
            <span className="font-medium text-sm sm:text-base">Lihat Keranjang</span>
          </div>
          <span className="font-bold text-lg sm:text-xl">{formatCurrency(total)}</span>
        </button>
      )}

      {/* KANAN: Keranjang & Pembayaran (Responsive Drawer/Sidebar) */}
      <div className={`${isMobileCartOpen ? 'fixed inset-0 z-50 flex flex-col bg-white' : 'hidden'} lg:flex lg:static lg:w-96 flex-col bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 h-full overflow-hidden shrink-0`}>
        
        {/* Header Mobile Cart */}
        {isMobileCartOpen ? (
          <div className="flex items-center justify-between p-4 bg-[#8B5E3C] text-white lg:hidden shadow-md">
            <h2 className="text-lg font-bold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Keranjang ({totalItems})
            </h2>
            <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 bg-[#FAF9F7] hidden lg:block">
            <h2 className="text-lg font-bold flex items-center text-[#2A1B10]">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Pesanan Saat Ini
            </h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4 text-gray-200" />
              <p>Belum ada pesanan</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="flex justify-between items-start gap-3 border-b border-gray-100 pb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <div className="text-sm text-gray-500 mb-2">{formatCurrency(item.product.price)}</div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-medium min-w-[2.5rem] text-center font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-gray-900">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Bawah Keranjang */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-[#FAF9F7] shrink-0 pb-safe">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500">Total ({totalItems} item)</span>
              <span className="text-2xl font-bold text-[#8B5E3C]">{formatCurrency(total)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setPaymentMethod('CASH'); setIsPaymentModalOpen(true); }}
                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-[#15803D] hover:bg-green-50 hover:text-[#15803D] transition-all group"
              >
                <Banknote className="w-6 h-6 text-gray-400 group-hover:text-[#15803D] mb-2" />
                <span className="font-semibold text-sm">Tunai</span>
              </button>
              <button
                onClick={() => { setPaymentMethod('QRIS'); setIsPaymentModalOpen(true); }}
                className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-[#1D4ED8] hover:bg-blue-50 hover:text-[#1D4ED8] transition-all group"
              >
                <QrCode className="w-6 h-6 text-gray-400 group-hover:text-[#1D4ED8] mb-2" />
                <span className="font-semibold text-sm">QRIS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={total}
        method={paymentMethod}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
