import { Sale, Product } from '@/types';

interface TopSellingItem {
  product: Product;
  quantity: number;
  revenue: number;
}

export function getTopSellingProducts(
  sales: Sale[], 
  products: Product[], 
  dateRange?: { start: Date; end: Date },
  limit: number = 5
): TopSellingItem[] {
  
  const filteredSales = dateRange 
    ? sales.filter(s => {
        const saleDate = new Date(s.date);
        return saleDate >= dateRange.start && saleDate <= dateRange.end;
      })
    : sales;

  const productStats = new Map<string, { quantity: number; revenue: number }>();

  // Agrega as vendas
  filteredSales.forEach(sale => {
    if (Array.isArray(sale.items)) {
      sale.items.forEach((item: any) => {
        const current = productStats.get(item.sku) || { quantity: 0, revenue: 0 };
        
        productStats.set(item.sku, {
          quantity: current.quantity + (Number(item.quantity) || 0),
          revenue: current.revenue + ((Number(item.price) || 0) * (Number(item.quantity) || 0))
        });
      });
    }
  });

  // Mapeia de volta para os produtos completos
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

  // Ordena por receita (revenue) decrescente
  return result
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}