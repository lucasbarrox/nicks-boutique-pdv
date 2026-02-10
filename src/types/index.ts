// Definições de Tipos Globais

export interface ProductVariant {
  id?: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  product_id?: string;
}

export interface Product {
  id: string;
  store_id?: string;
  name: string;
  description?: string;
  category?: string;
  basePrice: number;
  imageUrl?: string;
  variants: ProductVariant[];
  active?: boolean;
}

// CORREÇÃO: CartItem agora estende Product para ter acesso direto a 'name', 'imageUrl', etc.
// E garantimos que ele tem a propriedade 'sku' da variante selecionada.
export interface CartItem extends Product {
  quantity: number;
  sku: string; // SKU da variante específica selecionada
  selectedVariant?: ProductVariant; // Opcional, para facilitar acesso aos dados da variação
}

export interface SaleItem {
  sku: string;
  quantity: number;
  price: number;
  name: string; // Snapshot do nome
}

export interface Sale {
  id: string;
  displayId?: string;
  display_id?: string;
  store_id: string;
  customer_id?: string;
  customerName?: string;
  customer_name?: string;
  seller_id?: string;
  sellerName?: string;
  seller_name?: string;
  total: number;
  paymentMethod: string;
  payment_method?: string;
  status: 'Concluída' | 'Pendente' | 'Cancelada';
  items: SaleItem[];
  date: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  store_id?: string;
  name: string;
  email?: string;
  phone?: string;
  addresses?: Address[];
  created_at?: string;
}

export interface Address {
  street: string;
  number?: string;
  city: string;
  state?: string;
  zip?: string;
}

export interface Seller {
  id: string;
  store_id?: string;
  name: string;
  pixKey?: string;
  pix_key?: string;
}

export interface DeliveryFee {
  id: string;
  store_id?: string;
  neighborhood: string;
  fee: number;
}