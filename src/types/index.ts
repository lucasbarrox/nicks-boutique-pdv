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
  category?: string; // Adicionado
  basePrice: number;
  base_price?: number; 
  imageUrl?: string;
  image_url?: string;
  variants: ProductVariant[];
  active?: boolean;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
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
  complement?: string;
  neighborhood?: string;
  city: string;
  state?: string;
  zip?: string;
}

export interface Seller {
  id: string;
  store_id?: string;
  name: string;
  pixKey?: string; // Adicionado
  pix_key?: string;
}

export interface SaleItem {
  sku: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  priceAtSale: number;
}

export interface Sale {
  id: string;
  store_id?: string;
  displayId?: string; 
  display_id?: string; 
  customer_id?: string;
  seller_id?: string;
  customerName?: string; 
  sellerName?: string;
  total: number;
  status: 'Concluída' | 'Pendente' | 'Cancelada';
  paymentMethod?: string;
  payment_method?: string; 
  items: SaleItem[];
  date: string;
  created_at?: string;
}

export interface DeliveryFee {
  id: string;
  neighborhood: string;
  fee: number;
}