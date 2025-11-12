import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import {
  calculateSalesMetrics,
  calculateTotalProfit,
  getSalesByPaymentMethod,
  getSalesByDay,
  getTopSellingProducts,
  DateRange,
} from '@/lib/analytics';
import { Package, DollarSign, ShoppingCart, BarChart2, TrendingUp } from 'lucide-react';
import { Sale, Product } from '@/types';

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

type Period = 'today' | 'week' | 'month';

export function Dashboard() {
  const [sales] = useState<Sale[]>(() => db.sales.getAll());
  const [products] = useState<Product[]>(() => db.products.getAll());
  const [period, setPeriod] = useState<Period>('week');

  const dateRange = useMemo((): DateRange => {
    const to = new Date();
    const from = new Date();
    to.setHours(23, 59, 59, 999);

    if (period === 'today') {
      from.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      from.setDate(from.getDate() - 6);
      from.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
    }
    return { from, to };
  }, [period]);

  const metrics = useMemo(() => calculateSalesMetrics(sales, dateRange), [sales, dateRange]);
  const totalProfit = useMemo(() => calculateTotalProfit(sales, products, dateRange), [sales, products, dateRange]);
  const paymentBreakdown = useMemo(() => getSalesByPaymentMethod(sales, dateRange), [sales, dateRange]);
  const topSelling = useMemo(() => getTopSellingProducts(sales, products, dateRange, 5), [sales, products, dateRange]);
  const salesByDay = useMemo(() => getSalesByDay(sales, dateRange), [sales, dateRange]);
  const maxDailySale = useMemo(() => Math.max(...salesByDay.map(d => d.total), 0), [salesByDay]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">Dashboard Financeiro</h1>
        <div className="flex gap-2 p-1 bg-gray-200 rounded-lg">
          {(['today', 'week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1 rounded-md font-semibold transition-colors ${period === p ? 'bg-white shadow text-pink-primary' : 'text-gray-600 hover:bg-gray-300/50'}`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? '7 Dias' : 'Este Mês'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Vendido" value={metrics.totalSalesValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={DollarSign} />
        <StatCard title="Qtd. de Vendas" value={metrics.salesCount.toString()} icon={ShoppingCart} />
        <StatCard title="Ticket Médio" value={metrics.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={BarChart2} />
        <StatCard title="Lucro Bruto" value={totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-text-primary mb-4">Vendas por Dia</h2>
          {salesByDay.length > 1 ? (
            <div className="flex gap-2 items-end h-56 border-l border-b border-gray-200 p-2">
              {salesByDay.map(({ date, total }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-bold text-white bg-gray-700 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                  </div>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full bg-pink-200 hover:bg-pink-400 rounded-t-md transition-all" style={{ height: `${(total / (maxDailySale || 1)) * 100 || 1}%` }}></div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{date}</span>
                </div>
              ))}
            </div>
          ) : ( <div className="text-center py-10 text-gray-500"><p>Sem dados suficientes para exibir o gráfico.</p></div> )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-text-primary mb-4">Vendas por Pagamento</h2>
          <div className="space-y-3">
            {Object.keys(paymentBreakdown).length > 0 ? Object.entries(paymentBreakdown).map(([method, total]) => (
              <div key={method} className="flex justify-between items-center text-gray-700">
                <span className="font-semibold">{method}</span>
                <span className="font-bold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            )) : ( <div className="text-center py-10 text-gray-500"><p>Nenhum pagamento registrado no período.</p></div> )}
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
              </div>
              <p className="font-bold text-lg text-pink-primary">{totalSold} vendidos</p>
            </div>
          )) : ( <div className="text-center py-10 text-gray-500"><p>Sem vendas de produtos no período.</p></div> )}
        </div>
      </div>
    </div>
  );
}