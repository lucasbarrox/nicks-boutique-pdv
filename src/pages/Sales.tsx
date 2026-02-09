import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Componente simples para formatar dinheiro
const Money = ({ value }: { value: number }) => (
  <span className="font-medium text-gray-900">
    {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
  </span>
);

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar vendas da nuvem
  useEffect(() => {
    async function loadSales() {
      try {
        setIsLoading(true);
        const data = await db.sales.getAll();
        setSales(data);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.displayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-pink-primary gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-medium text-gray-500">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendas Realizadas</h1>
          <p className="text-gray-500">Histórico completo de transações</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID ou Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Vendedor</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-700">{sale.displayId}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(sale.date).toLocaleDateString('pt-BR')} <span className="text-xs text-gray-400">{new Date(sale.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="p-4 text-gray-900">{sale.customerName || 'Cliente Avulso'}</td>
                  <td className="p-4 text-gray-600">{sale.sellerName || '-'}</td>
                  <td className="p-4"><Money value={sale.total} /></td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link to={`/vendas/${sale.id}`} className="text-pink-primary hover:text-pink-700 font-medium text-sm">
                      Ver Recibo
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}