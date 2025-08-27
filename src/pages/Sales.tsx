import { useState } from 'react';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function Sales() {
  const [sales, setSales] = useState<Sale[]>(() => 
    db.sales.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  );
  const navigate = useNavigate();

  const handleDeleteSale = (e: React.MouseEvent, sale: Sale) => {
    e.stopPropagation(); // Impede que o clique na lixeira navegue para os detalhes da venda
    if (window.confirm(`Tem certeza que deseja excluir a venda ${sale.displayId}? Os produtos retornarão ao estoque.`)) {
      db.sales.remove(sale.id);
      setSales(db.sales.getAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      toast.success(`Venda ${sale.displayId} excluída com sucesso!`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Histórico de Vendas</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">ID da Venda</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Vendedor</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Valor Total</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr 
                key={sale.id} 
                className="border-b hover:bg-gray-50 cursor-pointer" 
                onClick={() => navigate(`/vendas/${sale.id}`)}
              >
                <td className="p-4">{new Date(sale.timestamp).toLocaleString('pt-BR')}</td>
                <td className="p-4 font-mono font-semibold text-gray-700">{sale.displayId}</td>
                <td className="p-4">{sale.customerName || 'Cliente Avulso'}</td>
                <td className="p-4">{sale.sellerName || 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${sale.status === 'Concluída' ? 'bg-green-100 text-green-700' : ''}
                    ${sale.status === 'Cancelada' ? 'bg-red-100 text-red-700' : ''}
                    ${sale.status === 'Em Troca' ? 'bg-yellow-100 text-yellow-700' : ''}
                  `}>
                    {sale.status}
                  </span>
                </td>
                <td className="p-4 font-semibold text-pink-primary">
                  {sale.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={(e) => handleDeleteSale(e, sale)} 
                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                    title="Excluir Venda"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {sales.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>Nenhuma venda registrada.</p>
            </div>
        )}
      </div>
    </div>
  );
}