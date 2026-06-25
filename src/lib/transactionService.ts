import { supabase } from '@/lib/supabase';
import { Transaction, CartItem, PaymentMethod } from '@/types';
import { insertAuditLog } from '@/lib/auditService';

// -------------------------------------------------------
// GET TRANSACTIONS
// -------------------------------------------------------
export async function getTransactions(filterDate?: string): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*, profiles(full_name), transaction_items(*)')
    .order('created_at', { ascending: false });

  if (filterDate) {
    query = query
      .gte('created_at', `${filterDate}T00:00:00`)
      .lte('created_at', `${filterDate}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Transaction[];
}

// -------------------------------------------------------
// GET DASHBOARD STATS (TODAY)
// -------------------------------------------------------
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('transactions')
    .select('total_amount')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .eq('status', 'LUNAS');
  
  if (error) throw error;

  const totalSales = data.reduce((sum, trx) => sum + trx.total_amount, 0);
  const totalTransactions = data.length;

  return { totalSales, totalTransactions };
}

// -------------------------------------------------------
// CREATE TRANSACTION (Checkout)
// -------------------------------------------------------
export async function createTransaction(
  cart: CartItem[],
  method: PaymentMethod,
  receivedAmount?: number
): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Tidak terautentikasi');

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  // Generate invoice number via fungsi SQL
  const { data: invoiceData } = await supabase
    .rpc('generate_invoice_number');
  const invoiceNumber = invoiceData as string;

  // Insert transaksi kepala
  const { data: trx, error: trxError } = await supabase
    .from('transactions')
    .insert({
      invoice_number: invoiceNumber,
      cashier_id: user.id,
      total_amount: totalAmount,
      received_amount: method === 'CASH' ? receivedAmount : null,
      change_amount: method === 'CASH' ? (receivedAmount! - totalAmount) : null,
      payment_method: method,
      status: 'LUNAS',
    })
    .select()
    .single();
  if (trxError) throw trxError;

  // Insert item-item transaksi
  const items = cart.map(item => ({
    transaction_id: trx.id,
    product_id: item.product.id,
    product_name: item.product.name,
    price: item.product.price,
    hpp: item.product.hpp ?? 0,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(items);
  if (itemsError) throw itemsError;

  // Decrement stok setiap produk
  for (const item of cart) {
    await supabase.rpc('decrement_stock', {
      p_product_id: item.product.id,
      p_qty: item.quantity,
    });
  }

  return trx as Transaction;
}

// -------------------------------------------------------
// VOID TRANSACTION
// -------------------------------------------------------
export async function voidTransaction(
  transactionId: string,
  actorName: string
): Promise<void> {
  // Ambil item dari transaksi untuk restore stok
  const { data: items, error: fetchError } = await supabase
    .from('transaction_items')
    .select('product_id, quantity')
    .eq('transaction_id', transactionId);
  if (fetchError) throw fetchError;

  // Update status ke VOID
  const { error: updateError } = await supabase
    .from('transactions')
    .update({ status: 'VOID' })
    .eq('id', transactionId);
  if (updateError) throw updateError;

  // Restore stok setiap produk (BR-04)
  for (const item of items ?? []) {
    if (item.product_id) {
      await supabase.rpc('restore_stock', {
        p_product_id: item.product_id,
        p_qty: item.quantity,
      });
    }
  }

  // Catat ke Audit Log (wajib sesuai BR-04)
  await insertAuditLog({
    actorName,
    action: `Void Transaksi ${transactionId}`,
    details: { transaction_id: transactionId, items }
  });
}

// -------------------------------------------------------
// REPORT DATA
// -------------------------------------------------------
export async function getReportData(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      id, created_at, total_amount, payment_method, status,
      transaction_items (
        product_name, quantity, price, hpp, subtotal
      )
    `)
    .gte('created_at', startDate.toISOString())
    .eq('status', 'LUNAS')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return transactions || [];
}

