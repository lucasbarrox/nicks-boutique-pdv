import { useState } from 'react';
import { db } from '@/lib/db';
import { Seller } from '@/types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export function Sellers() {
  const [sellers, setSellers] = useState(() => db.sellers.getAll());

  const handleDelete = (seller: Seller) => {
    if (window.confirm(`Tem certeza que deseja excluir o vendedor "${seller.name}"?`)) {
      db.sellers.remove(seller.id);
      setSellers(db.sellers.getAll());
      toast.success("Vendedor excluído com sucesso.");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Vendedores</h2>
        <Link 
          to="/vendedores/novo" 
          className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors"
        >
          Novo Vendedor
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Comissão</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Link to={`/vendedores/${s.id}`} className="font-bold hover:text-pink-primary transition-colors">{s.name}</Link>
                </td>
                <td className="p-4 text-gray-600">{s.commissionRate || 0}%</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(s)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sellers.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>Nenhum vendedor cadastrado.</p>
            </div>
        )}
      </div>
    </div>
  );
}