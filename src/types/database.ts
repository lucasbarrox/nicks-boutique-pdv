export interface DbProduct {
  id: string;
  store_id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  base_price: number;
  image_url?: string | null;
  active: boolean;
  created_at?: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
}

export interface DbSale {
  id: string;
  display_id: string;
  store_id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  seller_id?: string | null;
  seller_name?: string | null;
  total: number;
  payment_method: string;
  status: 'Concluída' | 'Pendente' | 'Cancelada';
  items: any; // JSONB no banco
  date: string;
  created_at?: string;
}

export interface DbCustomer {
  id: string;
  store_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  addresses?: any; // JSONB
  created_at?: string;
}

export interface DbSeller {
  id: string;
  store_id: string;
  name: string;
  pix_key?: string | null;
  created_at?: string;
}

export interface DbDeliveryFee {
  id: string;
  store_id: string;
  neighborhood: string;
  fee: number;
}