export interface ProductVariant {
  sku: string;
  color: string;
  size: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  costPrice: number;
  variants: ProductVariant[];
}

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  variantInfo: string;
  quantity: number;
  unitPrice: number;
  stock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface DeliveryFee {
  id: string;
  neighborhood: string;
  city: string;
  fee: number;
}

export interface Seller {
  id: string;
  name: string;
  commissionRate?: number;
}

export interface SaleItem {
  sku: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string; // Agora será um número sequencial, mas mantemos como string para flexibilidade
  displayId: string; // O ID formatado para exibição, ex: #00001
  customerId: string | null;
  customerName?: string;
  sellerId: string | null;
  sellerName?: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  deliveryFee: number;
  finalAmount: number;
  paymentMethod: 'Crédito' | 'Débito' | 'Dinheiro' | 'Pix';
  timestamp: string;
  status: 'Concluída' | 'Cancelada' | 'Em Troca'; // NOVO CAMPO
}