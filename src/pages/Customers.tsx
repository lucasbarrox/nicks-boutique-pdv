import { useState } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState(() => db.customers.getAll());
  
  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${customer.name}"?`)) {
      db.customers.remove(customer.id);
      setCustomers(db.customers.getAll()); // Re-sincroniza a lista
      toast.success("Cliente excluído com sucesso!");
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes Cadastrados</h2>
        <Link to="/clientes/novo" className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors">
            Novo Cliente
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Telefone</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Link to={`/clientes/${c.id}`} className="font-bold hover:text-pink-primary transition-colors">{c.name}</Link>
                </td>
                <td className="p-4 text-gray-600">{c.phone}</td>
                <td className="p-4 text-gray-600">{c.email}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>Nenhum cliente cadastrado.</p>
            </div>
        )}
      </div>
    </div>
  );
}