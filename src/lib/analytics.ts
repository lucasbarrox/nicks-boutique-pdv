import { Sale, Product } from '@/types';

type SkuCount = {
  [sku: string]: number;
};

export type ProductCount = {
  product: Product;
  variantSku: string;
  quantitySold: number;
};

export const getTopSellingProducts = (
  sales: Sale[],
  products: Product[],
  limit: number = 4
): ProductCount[] => {
  const skuCounts: SkuCount = {};

  sales.forEach(sale => {
    if (sale.status === 'Concluída') {
      sale.items.forEach(item => {
        skuCounts[item.sku] = (skuCounts[item.sku] || 0) + item.quantity;
      });
    }
  });

  const countedProducts: ProductCount[] = [];
  for (const sku in skuCounts) {
    for (const product of products) {
      const variant = product.variants.find(v => v.sku === sku);
      if (variant) {
        countedProducts.push({
          product,
          variantSku: sku,
          quantitySold: skuCounts[sku],
        });
        break; 
      }
    }
  }

  return countedProducts
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
};