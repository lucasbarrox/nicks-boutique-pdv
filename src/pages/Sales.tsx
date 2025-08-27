import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSalesFilterStore } from '@/store/salesFilterStore';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Sales() {
  const navigate = useNavigate();
  // Pega o estado e as funções do nosso store de filtros
  const { 
    dateRange, 
    customerId, 
    productId, 
    setDateRange, 
    setCustomerId, 
    setProductId, 
    clearFilters 
  } = useSalesFilterStore();

  // O estado local agora controla a lista visível, para podermos atualizar após exclusão
  const [sales, setSales] = useState(() => db.sales.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

  // Busca todos os dados necessários para os filtros apenas uma vez
  const allCustomers = useMemo(() => db.customers.getAll(), []);
  const allProducts = useMemo(() => db.products.getAll(), []);

  // O coração da nova funcionalidade: filtra as vendas baseado no estado do store
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Filtro de Data
      const saleDate = new Date(sale.timestamp);
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0); // Começo do dia
        if (saleDate < fromDate) return false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Fim do dia
        if (saleDate > toDate) return false;
      }

      // Filtro de Cliente
      if (customerId && sale.customerId !== customerId) {
        return false;
      }

      // Filtro de Produto
      if (productId && !sale.items.some(item => {
        const productOfItem = allProducts.find(p => p.variants.some(v => v.sku === item.sku));
        return productOfItem?.id === productId;
      })) {
        return false;
      }

      return true;
    });
  }, [sales, dateRange, customerId, productId, allProducts]);

  const handleDeleteSale = (e: React.MouseEvent, sale: Sale) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a venda ${sale.displayId}? Os produtos retornarão ao estoque.`)) {
      db.sales.remove(sale.id);
      setSales(db.sales.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      toast.success(`Venda ${sale.displayId} excluída com sucesso!`);
    }
  };


  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Histórico de Vendas</h2>
      
      <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg mb-6 bg-gray-50">
        <DateRangePicker dateRange={dateRange} setDateRange={(range) => setDateRange(range)} />
        
        <select value={customerId || ''} onChange={(e) => setCustomerId(e.target.value || null)} className="p-2 border border-gray-300 rounded-lg bg-white">
          <option value="">Todos os Clientes</option>
          {allCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={productId || ''} onChange={(e) => setProductId(e.target.value || null)} className="p-2 border border-gray-300 rounded-lg bg-white">
          <option value="">Todos os Produtos</option>
          {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <button onClick={clearFilters} className="flex items-center gap-2 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold">
          <X size={16} /> Limpar Filtros
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(sale => (
              <tr 
                key={sale.id} 
                className="border-b hover:bg-gray-50 cursor-pointer" 
                onClick={() => navigate(`/vendas/${sale.id}`)}
              >
                <td className="p-4">{new Date(sale.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="p-4 font-mono font-semibold text-gray-700">{sale.displayId}</td>
                <td className="p-4">{sale.customerName || 'Cliente Avulso'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sale.status === 'Concluída' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-pink-primary">{sale.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td className="p-4 text-right">
                  <button onClick={(e) => handleDeleteSale(e, sale)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" title="Excluir Venda">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredSales.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>Nenhuma venda encontrada para os filtros selecionados.</p>
            </div>
        )}
      </div>
    </div>
  );
}