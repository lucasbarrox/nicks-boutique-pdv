import { Sale, Product, Payment } from '@/types';


export type DateRange = { from: Date; to: Date };
export type TopProduct = { product: Product; totalSold: number };
export type PaymentMethodBreakdown = { [method: string]: number };
export type SalesByDay = { date: string; total: number }[];
export type SalesByHour = { hour: string; sales: number; total: number }[];


const filterSalesByDate = (sales: Sale[], range?: DateRange): Sale[] => {
  const completedSales = sales.filter(s => s.status === 'Concluída');
  if (!range) return completedSales;

  return completedSales.filter(sale => {
    const saleDate = new Date(sale.timestamp);
    return saleDate >= range.from && saleDate <= range.to;
  });
};



export const calculateSalesMetrics = (sales: Sale[], range?: DateRange) => {
  const filteredSales = filterSalesByDate(sales, range);
  
  const totalSalesValue = filteredSales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const salesCount = filteredSales.length;
  const averageTicket = salesCount > 0 ? totalSalesValue / salesCount : 0;

  return { totalSalesValue, salesCount, averageTicket };
};

export const calculateTotalProfit = (sales: Sale[], products: Product[], range?: DateRange): number => {
  const filteredSales = filterSalesByDate(sales, range);
  let totalCost = 0;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.variants.some(v => v.sku === item.sku));
      if (product) {
        totalCost += (product.costPrice || 0) * item.quantity;
      }
    });
  });

  return totalRevenue - totalCost;
};

export const getSalesByPaymentMethod = (sales: Sale[], range?: DateRange): PaymentMethodBreakdown => {
  const filteredSales = filterSalesByDate(sales, range);
  const breakdown: PaymentMethodBreakdown = {};

  filteredSales.forEach(sale => {
    if (Array.isArray(sale.payments)) {
      sale.payments.forEach(payment => {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
      });
    }
  });
  return breakdown;
};

export const getTopSellingProducts = (sales: Sale[], products: Product[], range?: DateRange, limit: number = 5): TopProduct[] => {
  const filteredSales = filterSalesByDate(sales, range);
  const productSales: { [productId: string]: number } = {};
  
  for (const product of products) {
    product.variants.forEach(variant => {
      const quantitySold = filteredSales
        .flatMap(sale => sale.items)
        .filter(item => item.sku === variant.sku)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      if (quantitySold > 0) {
        productSales[product.id] = (productSales[product.id] || 0) + quantitySold;
      }
    });
  }

  const sortedProductIds = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]);

  return sortedProductIds
    .map(productId => {
      const product = products.find(p => p.id === productId);
      return product ? { product, totalSold: productSales[productId] } : null;
    })
    .filter((p): p is TopProduct => p !== null)
    .slice(0, limit);
};

export const getSalesByDay = (sales: Sale[], range: DateRange): SalesByDay => {
  const filteredSales = filterSalesByDate(sales, range);
  const dailySales: { [date: string]: number } = {};

  let currentDate = new Date(range.from);
  while (currentDate <= range.to) {
    const dateKey = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    dailySales[dateKey] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  filteredSales.forEach(sale => {
    const dateKey = new Date(sale.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (dailySales[dateKey] !== undefined) {
      dailySales[dateKey] += sale.finalAmount;
    }
  });

  return Object.entries(dailySales)
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => {
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
};

export const getSalesByHour = (sales: Sale[], range?: DateRange): SalesByHour => {
  const filteredSales = filterSalesByDate(sales, range);
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    sales: 0,
    total: 0,
  }));

  filteredSales.forEach(sale => {
    const hour = new Date(sale.timestamp).getHours();
    if(hours[hour]) {
      hours[hour].sales += 1;
      hours[hour].total += sale.finalAmount;
    }
  });

  return hours.filter(h => h.sales > 0);
};