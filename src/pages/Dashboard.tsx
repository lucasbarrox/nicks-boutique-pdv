import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { getTopSellingProducts } from '@/lib/analytics';
import { Package } from 'lucide-react';
import { Sale, Product } from '@/types';

export function Dashboard() {
  // Busca os dados uma vez na inicialização do componente
  const [sales] = useState<Sale[]>(() => db.sales.getAll());
  const [products] = useState<Product[]>(() => db.products.getAll());

  // useMemo garante que o cálculo pesado só seja refeito se os dados mudarem
  const topSelling = useMemo(() => getTopSellingProducts(sales, products, 10), [sales, products]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Painel Financeiro</h1>
      
      {/* Card de Produtos Mais Vendidos */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-primary mb-4 border-b pb-3">Produtos Mais Vendidos</h2>
        <div className="space-y-4">
          {topSelling.length > 0 ? topSelling.map(({ product, variantSku, quantitySold }) => {
            const variant = product.variants.find(v => v.sku === variantSku);
            return (
              <div key={variantSku} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Package className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {variantSku} ({variant?.size} / {variant?.color})</p>
                </div>
                <p className="font-bold text-lg text-pink-primary">{quantitySold} vendidos</p>
              </div>
            )
          }) : (
            <div className="text-center py-10 text-gray-500">
              <p>Ainda não há dados de vendas suficientes para exibir esta análise.</p>
            </div>
          )}
        </div>
      </div>

      {/* Outros cards de análise podem ser adicionados aqui no futuro */}
    </div>
  );
}