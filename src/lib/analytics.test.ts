import { describe, it, expect } from 'vitest';
import { calculateSalesMetrics, calculateTotalProfit, getTopSellingProducts } from './analytics';
import {  Product } from '@/types';

// Mocks de dados
const mockDate = new Date('2024-02-10T12:00:00Z');

// Simulamos 'costPrice' estendendo o tipo manualmente para o teste
const mockProducts = [
  {
    id: 'prod1',
    name: 'Camiseta',
    basePrice: 50,
    // custo simulado na lógica: 30 (60%)
    variants: [{ sku: 'CAM-P', size: 'P', color: 'Azul', stock: 10 }]
  },
  {
    id: 'prod2',
    name: 'Calça',
    basePrice: 100,
    // custo simulado na lógica: 60 (60%)
    variants: [{ sku: 'CAL-38', size: '38', color: 'Jeans', stock: 5 }]
  }
] as Product[];

const mockSales: any[] = [
  {
    id: 'sale1',
    status: 'Concluída',
    total: 150, // Campo correto agora é 'total'
    date: mockDate.toISOString(),
    items: [
      { sku: 'CAM-P', quantity: 1, price: 50 },
      { sku: 'CAL-38', quantity: 1, price: 100 }
    ]
  },
  {
    id: 'sale2',
    status: 'Cancelada',
    total: 50,
    date: mockDate.toISOString(),
    items: [{ sku: 'CAM-P', quantity: 1, price: 50 }]
  }
];

describe('Analytics Logic', () => {
  
  it('deve calcular métricas de vendas corretamente (ignorando canceladas)', () => {
    const metrics = calculateSalesMetrics(mockSales);
    
    expect(metrics.totalSalesValue).toBe(150);
    expect(metrics.salesCount).toBe(1);
    expect(metrics.averageTicket).toBe(150);
  });

  it('deve calcular o lucro corretamente', () => {
    // Venda 1: 150 receita
    // Custos estimados (60%): 30 (Camiseta) + 60 (Calça) = 90
    // Lucro: 150 - 90 = 60
    
    const profit = calculateTotalProfit(mockSales, mockProducts);
    expect(profit).toBe(60);
  });

  it('deve identificar os produtos mais vendidos', () => {
    const extraSales = [
        ...mockSales, 
        {
            id: 'sale3', 
            status: 'Concluída', 
            total: 100, 
            date: mockDate.toISOString(),
            items: [{ sku: 'CAM-P', quantity: 2, price: 50 }] 
        }
    ];

    const top = getTopSellingProducts(extraSales, mockProducts);
    
    expect(top[0].product.name).toBe('Camiseta');
    // Agora usamos 'quantity' em vez de 'totalSold'
    expect(top[0].quantity).toBe(3); 
    expect(top[1].product.name).toBe('Calça');
  });
});