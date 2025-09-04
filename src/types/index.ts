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

// AQUI ESTÁ A MUDANÇA PRINCIPAL
export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  // Os campos city, state e zipCode foram removidos
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  notes?: string;
  addresses: Address[];
}

export interface Seller {
  id: string;
  name: string;
  phone?: string;
  emergencyPhone?: string;
  birthDate?: string;
  address?: Address;
}

export interface DeliveryFee {
  id: string;
  neighborhood: string;
  city: string; // Manteremos city aqui para o cadastro da taxa
  fee: number;
}

export interface SaleItem {
  sku: string;
  quantity: number;
  price: number;
}

export interface Payment {
  method: 'Crédito' | 'Débito' | 'Dinheiro' | 'Pix';
  amount: number;
}

export interface Sale {
  id: string;
  displayId: string;
  customerId: string | null;
  customerName?: string;
  sellerId: string | null;
  sellerName?: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  deliveryFee: number;
  deliveryAddress: Address | null;
  deliveryNotes?: string; // Garantindo que este campo exista
  finalAmount: number;
  payments: Payment[];
  amountPaid: number;
  changeDue: number;
  timestamp: string;
  status: 'Concluída' | 'Cancelada' | 'Em Troca';
}