import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cart';
import { Product, ProductVariant } from '@/types';

// Mock básico
const mockVariant: ProductVariant = {
  sku: 'TEST-SKU',
  size: 'M',
  color: 'Preto',
  stock: 5,
  product_id: 'p1'
};

const mockProduct: Product = {
  id: 'p1',
  name: 'Teste Produto',
  basePrice: 100,
  variants: [mockVariant] // Importante ter a variante aqui
} as Product;

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('deve adicionar um item ao carrinho', () => {
    // Nova assinatura: addItem recebe apenas o produto
    useCartStore.getState().addItem(mockProduct);
    
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
    expect(items[0].sku).toBe('TEST-SKU');
  });

  it('deve incrementar quantidade se item já existe', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);
    
    const items = useCartStore.getState().items;
    expect(items[0].quantity).toBe(2);
  });

  it('deve calcular o total corretamente com desconto em %', () => {
    useCartStore.getState().addItem(mockProduct); // 100 reais
    
    // Novo formato: Objeto { value, type }
    useCartStore.getState().setDiscount({ value: 10, type: 'percentage' });
    
    // Novo nome: total()
    const total = useCartStore.getState().total();
    expect(total).toBe(90); // 100 - 10%
  });

  it('deve calcular o total corretamente com desconto fixo (R$)', () => {
    useCartStore.getState().addItem(mockProduct); // 100 reais
    
    useCartStore.getState().setDiscount({ value: 25, type: 'fixed' });
    
    const total = useCartStore.getState().total();
    expect(total).toBe(75); // 100 - 25
  });

  it('deve somar taxa de entrega ao total', () => {
    useCartStore.getState().addItem(mockProduct); // 100 reais
    
    // Novo nome: setDeliveryFee(valor, id?)
    useCartStore.getState().setDeliveryFee(20);
    
    const total = useCartStore.getState().total();
    expect(total).toBe(120); // 100 + 20
  });

  it('deve limpar o carrinho completamente', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().setDiscount({ value: 10, type: 'fixed' });
    
    useCartStore.getState().clearCart();
    
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.discount).toBeNull();
  });
});