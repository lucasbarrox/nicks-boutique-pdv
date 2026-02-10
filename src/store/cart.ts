import { create } from 'zustand';
import { Product, Customer, Seller, CartItem } from '@/types';

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
}

interface CartStore {
  items: CartItem[];
  customer: Customer | null;
  seller: Seller | null;
  deliveryFee: number;
  deliveryFeeId?: string;
  discount: Discount | null;
  
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setSeller: (seller: Seller | null) => void;
  setDeliveryFee: (fee: number, id?: string) => void;
  setDiscount: (discount: Discount | null) => void;
  clearCart: () => void;
  
  subtotal: () => number;
  total: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  customer: null,
  seller: null,
  deliveryFee: 0,
  deliveryFeeId: undefined,
  discount: null,

  addItem: (product) => {
    const { items } = get();
    // Procura por ID do produto
    const existingItem = items.find((i) => i.id === product.id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      // Cria o item garantindo que temos a primeira variante como padrão
      const defaultVariant = product.variants?.[0];
      const newItem: CartItem = {
        ...product,
        quantity: 1,
        sku: defaultVariant?.sku || 'DEFAULT',
        selectedVariant: defaultVariant
      };
      
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      ),
    });
  },

  setCustomer: (customer) => set({ customer }),
  setSeller: (seller) => set({ seller }),
  setDeliveryFee: (fee, id) => set({ deliveryFee: fee, deliveryFeeId: id }),
  setDiscount: (discount) => set({ discount }),

  clearCart: () => set({ 
    items: [], 
    customer: null, 
    seller: null, 
    deliveryFee: 0, 
    deliveryFeeId: undefined,
    discount: null 
  }),

  // CORREÇÃO DE SEGURANÇA: Filtra itens inválidos antes de somar
  subtotal: () => {
    const { items } = get();
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((acc, item) => {
      // Se o item for inválido ou não tiver preço, ignora
      if (!item || typeof item.basePrice !== 'number') return acc;
      return acc + (item.basePrice * item.quantity);
    }, 0);
  },

  total: () => {
    const subtotal = get().subtotal();
    const { deliveryFee, discount } = get();
    
    let discountAmount = 0;
    if (discount) {
      if (discount.type === 'fixed') {
        discountAmount = discount.value;
      } else {
        discountAmount = subtotal * (discount.value / 100);
      }
    }

    return Math.max(0, subtotal + deliveryFee - discountAmount);
  },
}));