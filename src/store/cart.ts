import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, Customer, Seller, Sale } from '@/types';

interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  customer: Customer | null;
  seller: Seller | null;
  lastSale: Sale | null;
  
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  setSeller: (seller: Seller | null) => void;
  setLastSale: (sale: Sale | null) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      seller: null,
      lastSale: null,

      addItem: (product, variant) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) => item.variant.sku === variant.sku
        );

        if (existingItemIndex > -1) {
          // Se já existe, aumenta a quantidade
          const newItems = [...currentItems];
          newItems[existingItemIndex].quantity += 1;
          set({ items: newItems });
        } else {
          // Se não existe, adiciona novo
          set({ items: [...currentItems, { product, variant, quantity: 1 }] });
        }
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant.sku !== sku),
        }));
      },

      updateQuantity: (sku, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.variant.sku === sku ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], customer: null, lastSale: null }), // Mantemos o vendedor para facilitar
      
      setCustomer: (customer) => set({ customer }),
      setSeller: (seller) => set({ seller }),
      setLastSale: (sale) => set({ lastSale: sale }),
    }),
    {
      name: 'nicks-boutique-cart-storage', // Nome para salvar no navegador
    }
  )
);