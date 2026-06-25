export type UserRole = 'OWNER' | 'KASIR';
export type PaymentMethod = 'CASH' | 'QRIS';
export type TransactionStatus = 'PENDING' | 'LUNAS' | 'VOID';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  price: number;
  hpp: number;      // hanya Owner yang boleh lihat
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  // Joined
  categories?: Category;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  cashier_id: string;
  total_amount: number;
  received_amount: number | null;
  change_amount: number | null;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  created_at: string;
  // Joined
  profiles?: Profile;
  transaction_items?: TransactionItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  hpp: number;
  quantity: number;
  subtotal: number;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

// Cart (UI only - tidak ada di DB)
export interface CartItem {
  product: Product;
  quantity: number;
}
