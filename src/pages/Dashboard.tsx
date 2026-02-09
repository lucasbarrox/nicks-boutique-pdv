import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Sale, Product } from '@/types';
import { DollarSign, ShoppingBag, Package, TrendingUp, Loader2 } from 'lucide-react';
import { getTopSellingProducts } from '@/lib/analytics'; 
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [salesData, productsData] = await Promise.all([
          db.sales.getAll(),
          db.products.getAll()
        ]);
        setSales(salesData);
        setProducts(productsData);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-pink-primary" size={48} />
      </div>
    );
  }

  // Cálculos baseados nos dados carregados
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const totalSales = sales.length;
  const totalProducts = products.reduce((acc, p) => acc + p.variants.reduce((vAcc, v) => vAcc + v.stock, 0), 0);
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  const topSelling = getTopSellingProducts(sales, products, undefined, 5);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-lg ${color} text-white`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Vendas Realizadas" 
          value={totalSales} 
          icon={ShoppingBag} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Produtos em Estoque" 
          value={totalProducts} 
          icon={Package} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Ticket Médio" 
          value={averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={TrendingUp} 
          color="bg-pink-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-4">
            {topSelling.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-gray-800">{item.product.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} unidades vendidas</p>
                  </div>
                </div>
                <p className="font-bold text-pink-primary">
                  {item.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
             {topSelling.length === 0 && <p className="text-gray-500">Nenhum dado de venda ainda.</p>}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Últimas Vendas</h2>
          <div className="space-y-4">
            {sales.slice(0, 5).map(sale => (
              <Link key={sale.id} to={`/vendas/${sale.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                <div>
                  <p className="font-bold text-gray-800">{sale.displayId}</p>
                  <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-xs text-gray-500">{sale.items.length} itens</p>
                </div>
              </Link>
            ))}
            {sales.length === 0 && <p className="text-gray-500">Nenhuma venda realizada.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}