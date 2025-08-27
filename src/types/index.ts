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

export interface Address {
  id: string;
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode?: string;
  notes?: string;
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
  city: string;
  fee: number;
}

export interface SaleItem {
  sku: string;
  quantity: number;
  price: number;
}

// NOVA INTERFACE PARA OS PAGAMENTOS
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
  deliveryNotes?: string;
  finalAmount: number;
  
  // CAMPOS DE PAGAMENTO ATUALIZADOS
  payments: Payment[]; // Substitui o paymentMethod antigo
  amountPaid: number; // O total que o cliente pagou (pode ser maior que o finalAmount)
  changeDue: number;  // O troco a ser dado

  timestamp: string;
  status: 'Concluída' | 'Cancelada' | 'Em Troca';
}