import { Sale, Product, Payment } from '@/types';

// Tipos para nos ajudar nos cálculos
type SkuCount = { [sku: string]: number };
type ProductSales = { [productId: string]: number };
type PaymentMethodBreakdown = { [method: string]: number };
type SalesByHour = { hour: string; sales: number; total: number }[];

// O tipo de retorno da nossa função
export type TopProduct = {
  product: Product;
  totalSold: number;
};

// --- FUNÇÕES AUXILIARES DE DATA ---

const isToday = (someDate: Date) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

const isThisWeek = (someDate: Date) => {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  
  return someDate >= firstDayOfWeek && someDate <= lastDayOfWeek;
};


// --- FUNÇÕES DE ANÁLISE ---

/**
 * Calcula os produtos mais vendidos, agregando as vendas de todas as suas variações.
 */
export const getTopSellingProducts = (
  sales: Sale[],
  products: Product[],
  limit: number = 10
): TopProduct[] => {
  const skuCounts: SkuCount = {};

  // 1. Itera sobre todas as vendas para contar a quantidade de cada SKU vendido
  sales.forEach(sale => {
    if (sale.status === 'Concluída') {
      sale.items.forEach(item => {
        skuCounts[item.sku] = (skuCounts[item.sku] || 0) + item.quantity;
      });
    }
  });

  // 2. Agrega as contagens de SKU por produto principal (ID do produto)
  const productSales: ProductSales = {};
  for (const product of products) {
    product.variants.forEach(variant => {
      if (skuCounts[variant.sku]) {
        productSales[product.id] = (productSales[product.id] || 0) + skuCounts[variant.sku];
      }
    });
  }

  // 3. Converte o objeto de vendas de produtos em um array e ordena
  const sortedProductIds = Object.keys(productSales)
    .sort((a, b) => productSales[b] - productSales[a]);

  // 4. Mapeia os IDs ordenados de volta para os objetos de produto completos e formata a saída
  const topProducts: TopProduct[] = sortedProductIds
    .map(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return null;
      return {
        product: product,
        totalSold: productSales[productId],
      };
    })
    .filter((p): p is TopProduct => p !== null)
    .slice(0, limit);

  return topProducts;
};

/**
 * Calcula as métricas principais de vendas: total do dia, da semana e ticket médio.
 */
export const calculateSalesMetrics = (sales: Sale[]) => {
  const completedSales = sales.filter(s => s.status === 'Concluída');
  const todaySales = completedSales.filter(s => isToday(new Date(s.timestamp)));
  const weekSales = completedSales.filter(s => isThisWeek(new Date(s.timestamp)));

  const totalDay = todaySales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const totalWeek = weekSales.reduce((sum, sale) => sum + sale.finalAmount, 0);
  const averageTicket = completedSales.length > 0 
    ? completedSales.reduce((sum, sale) => sum + sale.finalAmount, 0) / completedSales.length
    : 0;

  return { totalDay, totalWeek, averageTicket };
};

/**
 * Calcula o lucro total baseado no preço de custo dos produtos vendidos.
 */
export const calculateTotalProfit = (sales: Sale[], products: Product[]): number => {
  let totalCost = 0;
  const completedSales = sales.filter(s => s.status === 'Concluída');
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalAmount, 0); // Usa totalAmount antes de taxas

  completedSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.variants.some(v => v.sku === item.sku));
      if (product) {
        totalCost += (product.costPrice || 0) * item.quantity;
      }
    });
  });

  return totalRevenue - totalCost;
};

/**
 * Agrupa o total de vendas por forma de pagamento.
 */
export const getSalesByPaymentMethod = (sales: Sale[]): PaymentMethodBreakdown => {
  const breakdown: PaymentMethodBreakdown = {};
  const completedSales = sales.filter(s => s.status === 'Concluída');

  completedSales.forEach(sale => {
    // Garante que sale.payments exista e seja um array
    if (Array.isArray(sale.payments)) {
      sale.payments.forEach(payment => {
        breakdown[payment.method] = (breakdown[payment.method] || 0) + payment.amount;
      });
    }
  });

  return breakdown;
};

/**
 * Agrupa a quantidade e o valor das vendas por hora do dia.
 */
export const getSalesByHour = (sales: Sale[]): SalesByHour => {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    sales: 0,
    total: 0,
  }));

  const completedSales = sales.filter(s => s.status === 'Concluída');
  completedSales.forEach(sale => {
    const hour = new Date(sale.timestamp).getHours();
    if(hours[hour]) {
      hours[hour].sales += 1;
      hours[hour].total += sale.finalAmount;
    }
  });

  return hours.filter(h => h.sales > 0);
};