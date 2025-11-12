import { useMemo, useState } from 'react';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSalesFilterStore } from '@/store/salesFilterStore';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { X, Trash2, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full p-2 border rounded-lg bg-white" />;

export function Sales() {
  const navigate = useNavigate();
  const { 
    dateRange, 
    customerName,
    setDateRange, 
    setCustomerName,
    clearFilters 
  } = useSalesFilterStore();

  const [sales, setSales] = useState<Sale[]>(() => db.sales.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

  const filteredSales = useMemo(() => {
    const today = new Date();
    const isDefaultView = !dateRange.from && !dateRange.to && !customerName;

    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      
      if (isDefaultView) {
        return saleDate.getDate() === today.getDate() &&
               saleDate.getMonth() === today.getMonth() &&
               saleDate.getFullYear() === today.getFullYear();
      }

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from.replace(/-/g, '\/'));
        fromDate.setHours(0, 0, 0, 0);
        if (saleDate < fromDate) return false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to.replace(/-/g, '\/'));
        toDate.setHours(23, 59, 59, 999);
        if (saleDate > toDate) return false;
      }

      if (customerName && !sale.customerName?.toLowerCase().includes(customerName.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [sales, dateRange, customerName]);
  
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Histórico de Vendas</h2>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-xl mb-6 bg-gray-50">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar size={20} className="text-gray-500 flex-shrink-0"/>
          <DateRangePicker dateRange={dateRange} setDateRange={(range) => setDateRange(range)} />
        </div>
        
        <div className="relative w-full md:w-auto flex-1">
          <Input 
            placeholder="Buscar por cliente..."
            value={customerName || ''}
            onChange={(e) => setCustomerName(e.target.value || null)}
            className="pl-10"
          />
        </div>

        <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-semibold whitespace-nowrap">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${sale.status === 'Concluída' ? 'bg-green-100 text-green-700' : ''}
                    ${sale.status === 'Cancelada' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {sale.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-pink-primary">
                  {sale.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
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