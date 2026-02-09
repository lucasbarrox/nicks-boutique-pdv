import { Sale, Product, SaleItem } from '@/types';

interface TopProduct {
  product: Product;
  quantity: number;
  revenue: number;
}

export function getTopSellingProducts(
  sales: Sale[], 
  products: Product[], 
  dateRange?: { start: Date; end: Date },
  limit: number = 5
): TopProduct[] {
  // Filtrar por data se necessário
  const filteredSales = dateRange 
    ? sales.filter(s => {
        const date = new Date(s.date);
        return date >= dateRange.start && date <= dateRange.end;
      })
    : sales;

  // Mapa para agregar vendas
  const productStats = new Map<string, { quantity: number; revenue: number }>();

  filteredSales.forEach(sale => {
    sale.items.forEach((item: SaleItem) => {
      // Tenta encontrar o produto pelo SKU (nosso identificador único de venda)
      // Como o SKU contém o ID do produto ou variante, precisamos associar ao Produto Pai
      // Simplificação: Vamos procurar qual produto tem essa variante
      const parentProduct = products.find(p => p.variants.some(v => v.sku === item.sku));
      
      if (parentProduct) {
        const current = productStats.get(parentProduct.id) || { quantity: 0, revenue: 0 };
        productStats.set(parentProduct.id, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + (item.quantity * item.priceAtSale)
        });
      }
    });
  });

  // Converter para array e ordenar
  const result: TopProduct[] = [];
  productStats.forEach((stats, productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      result.push({ product, ...stats });
    }
  });

  return result
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// Corrigido para exportar corretamente
export function getSalesByDate(sales: Sale[]) {
  const salesByDate = new Map<string, number>();

  sales.forEach(sale => {
    const date = new Date(sale.date).toLocaleDateString();
    const current = salesByDate.get(date) || 0;
    salesByDate.set(date, current + sale.total);
  });

  return Array.from(salesByDate.entries()).map(([date, total]) => ({
    date,
    total
  }));
}