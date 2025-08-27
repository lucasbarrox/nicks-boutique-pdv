import { create } from 'zustand';
import { CartItem, Product, ProductVariant, Customer, DeliveryFee, Seller } from '@/types';
import { toast } from 'sonner';

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  deliveryFee: DeliveryFee | null;
  seller: Seller | null;
  addItem: (product: Product, variant: ProductVariant) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, newQuantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setDeliveryFee: (fee: DeliveryFee | null) => void;
  setSeller: (seller: Seller | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  deliveryFee: null,
  seller: null,
  
  addItem: (product, variant) => {
    const { items } = get();
    const existingItem = items.find(item => item.sku === variant.sku);

    if (variant.stock <= 0) {
      toast.error("Produto sem estoque.");
      return;
    }
    
    if (existingItem) {
      if (existingItem.quantity < variant.stock) {
        set({ items: items.map(item => item.sku === variant.sku ? { ...item, quantity: item.quantity + 1 } : item) });
        toast.success(`${product.name} adicionado ao carrinho.`);
      } else {
        toast.warning(`Estoque máximo atingido para ${product.name}.`);
      }
    } else {
      set({ items: [ ...items, {
            productId: product.id, productName: product.name, sku: variant.sku, variantInfo: `${variant.size} / ${variant.color}`,
            quantity: 1, unitPrice: product.basePrice, stock: variant.stock,
      }]});
      toast.success(`${product.name} adicionado ao carrinho.`);
    }
  },
  
  removeItem: (sku) => {
    set({ items: get().items.filter(item => item.sku !== sku) });
    toast.info("Item removido do carrinho.");
  },
  
  updateQuantity: (sku, newQuantity) => {
    const itemToUpdate = get().items.find(item => item.sku === sku);
    if (!itemToUpdate) return;
    
    if (newQuantity <= 0) {
        get().removeItem(sku);
    } else if (newQuantity <= itemToUpdate.stock) {
        set({ items: get().items.map(item => item.sku === sku ? { ...item, quantity: newQuantity } : item) });
    } else {
        toast.warning(`Estoque máximo: ${itemToUpdate.stock} unidades.`);
    }
  },

  setCustomer: (customer) => set({ customer }),
  
  setDeliveryFee: (fee) => set({ deliveryFee: fee }),

  setSeller: (seller) => set({ seller }),
  
  getSubtotal: () => get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
  
  getTotal: () => {
    const subtotal = get().getSubtotal();
    const fee = get().deliveryFee?.fee || 0;
    return subtotal + fee;
  },

  clearCart: () => set({ items: [], customer: null, deliveryFee: null, seller: get().seller }),
}));