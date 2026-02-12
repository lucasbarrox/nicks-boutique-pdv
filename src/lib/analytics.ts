import { Sale, Product } from '@/types';

// Tipos auxiliares para os relatórios
export type DateRange = { from: Date; to: Date };
export interface TopSellingItem {
  product: Product;
  quantity: number;
  revenue: number;
}

// Filtro auxiliar de data
const filterSalesByDate = (sales: Sale[], range?: DateRange): Sale[] => {
  const completedSales = sales.filter(s => s.status === 'Concluída');
  if (!range) return completedSales;

  return completedSales.filter(sale => {
    const saleDate = new Date(sale.date); // 'date' em vez de 'timestamp'
    return saleDate >= range.from && saleDate <= range.to;
  });
};

// 1. Métricas Gerais
export const calculateSalesMetrics = (sales: Sale[], range?: DateRange) => {
  const filteredSales = filterSalesByDate(sales, range);
  
  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = filteredSales.length;
  const averageTicket = salesCount > 0 ? totalSalesValue / salesCount : 0;

  return { totalSalesValue, salesCount, averageTicket };
};

// 2. Cálculo de Lucro
export const calculateTotalProfit = (sales: Sale[], products: Product[], range?: DateRange): number => {
  const filteredSales = filterSalesByDate(sales, range);
  let totalCost = 0;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      // Tenta achar o produto pelo SKU ou Nome para pegar o custo
      // Nota: O ideal seria salvar o custo histórico no item da venda (snapshot),
      // mas aqui buscaremos no produto atual como fallback.
      const product = products.find(p => p.variants.some(v => v.sku === item.sku));
      
      // Assumindo que você adicionará 'costPrice' ao tipo Product futuramente. 
      // Por enquanto, simulamos que se não tiver, o custo é 60% do preço base (margem estimada)
      // Se você tiver o campo costPrice no Product, troque para: (product.costPrice || 0)
      const cost = product ? (product.basePrice * 0.6) : 0; 
      
      totalCost += cost * item.quantity;
    });
  });

  return totalRevenue - totalCost;
};

// 3. Produtos Mais Vendidos (Refatorado para o teste)
export function getTopSellingProducts(
  sales: Sale[], 
  products: Product[], 
  dateRange?: DateRange,
  limit: number = 5
): TopSellingItem[] {
  
  const filteredSales = filterSalesByDate(sales, dateRange);
  const productStats = new Map<string, { quantity: number; revenue: number }>();

  filteredSales.forEach(sale => {
    if (Array.isArray(sale.items)) {
      sale.items.forEach((item) => {
        const current = productStats.get(item.sku) || { quantity: 0, revenue: 0 };
        productStats.set(item.sku, {
          quantity: current.quantity + (Number(item.quantity) || 0),
          revenue: current.revenue + ((Number(item.price) || 0) * (Number(item.quantity) || 0))
        });
      });
    }
  });

  const result: TopSellingItem[] = [];

  productStats.forEach((stats, sku) => {
    const product = products.find(p => p.variants.some(v => v.sku === sku));
    
    if (product) {
        const existingEntry = result.find(r => r.product.id === product.id);
        if (existingEntry) {
            existingEntry.quantity += stats.quantity;
            existingEntry.revenue += stats.revenue;
        } else {
            result.push({
                product,
                quantity: stats.quantity,
                revenue: stats.revenue
            });
        }
    }
  });

  return result.sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}