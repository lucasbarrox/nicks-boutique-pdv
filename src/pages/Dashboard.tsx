import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import {
  calculateSalesMetrics,
  calculateTotalProfit,
  getSalesByPaymentMethod,
  getSalesByHour,
  getTopSellingProducts
} from '@/lib/analytics';
import { Package, DollarSign, ShoppingCart, BarChart2, TrendingUp, Clock } from 'lucide-react';
import { Sale, Product } from '@/types';

// Um sub-componente para os cards de estatísticas, para manter o código limpo
const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
    <div className="bg-pink-100 p-3 rounded-full">
      <Icon className="text-pink-primary" size={24} />
    </div>
    <div>
      <p className="text-gray-500 font-semibold">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export function Dashboard() {
  const [sales] = useState<Sale[]>(() => db.sales.getAll());
  const [products] = useState<Product[]>(() => db.products.getAll());

  // Usamos useMemo para evitar recalcular esses dados a cada renderização
  const metrics = useMemo(() => calculateSalesMetrics(sales), [sales]);
  const totalProfit = useMemo(() => calculateTotalProfit(sales, products), [sales, products]);
  const paymentBreakdown = useMemo(() => getSalesByPaymentMethod(sales), [sales]);
  const salesByHour = useMemo(() => getSalesByHour(sales), [sales]);
  const topSelling = useMemo(() => getTopSellingProducts(sales, products, 5), [sales, products]);

  // Encontra a hora de maior movimento
  const peakHour = useMemo(() => {
    if (salesByHour.length === 0) return null;
    return salesByHour.reduce((max, hour) => hour.total > max.total ? hour : max);
  }, [salesByHour]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Dashboard Financeiro</h1>
      
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas do Dia" value={metrics.totalDay.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} />
        <StatCard title="Vendas da Semana" value={metrics.totalWeek.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={ShoppingCart} />
        <StatCard title="Ticket Médio" value={metrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={BarChart2} />
        <StatCard title="Lucro Bruto (Semana)" value={totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendas por Horário */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2"><Clock size={20}/> Vendas por Horário</h2>
          {salesByHour.length > 0 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">Pico de vendas: <span className="font-bold text-pink-primary">{peakHour?.hour}</span></p>
              <div className="flex gap-2 items-end h-48 border-l border-b border-gray-200 p-2">
                {salesByHour.map(({ hour, total }) => (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full bg-pink-200 hover:bg-pink-400 rounded-t-md transition-all" style={{ height: `${(total / (peakHour?.total || 1)) * 100}%` }}>
                      <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{hour.slice(0, 2)}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
             <div className="text-center py-10 text-gray-500"><p>Sem dados de vendas para exibir gráfico.</p></div>
          )}
        </div>

        {/* Breakdown de Pagamentos */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-text-primary mb-4">Vendas por Pagamento</h2>
          <div className="space-y-3">
            {Object.keys(paymentBreakdown).length > 0 ? Object.entries(paymentBreakdown).map(([method, total]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">{method}</span>
                <span className="font-bold text-gray-800">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            )) : (
              <div className="text-center py-10 text-gray-500"><p>Nenhum pagamento registrado.</p></div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-text-primary mb-4">Top 5 Produtos Mais Vendidos</h2>
        <div className="space-y-4">
          {topSelling.length > 0 ? topSelling.map(({ product, totalSold }) => (
            <div key={product.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50">
              <div className="bg-gray-100 p-3 rounded-lg"><Package className="text-gray-500" /></div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-500">{product.variants.length} variações</p>
              </div>
              <p className="font-bold text-lg text-pink-primary">{totalSold} vendidos</p>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-500"><p>Sem dados de vendas para exibir.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}