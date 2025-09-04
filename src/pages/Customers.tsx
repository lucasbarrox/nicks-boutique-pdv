import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Trash2, Edit, Search } from 'lucide-react';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full p-3 border rounded-lg" />;

export function Customers() {
  const [customers, setCustomers] = useState(() => db.customers.getAll());
  const navigate = useNavigate();
  
  // NOVO: Estado para controlar o termo da busca
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (customer: Customer) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${customer.name}"?`)) {
      db.customers.remove(customer.id);
      setCustomers(db.customers.getAll());
      toast.success("Cliente excluído com sucesso!");
    }
  };

  // NOVO: Lógica de filtro que busca no nome e no telefone
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) {
      return customers;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(lowercasedTerm) ||
      customer.phone.includes(lowercasedTerm) // Telefone não precisa de toLowerCase
    );
  }, [customers, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes Cadastrados</h2>
        <Link 
          to="/clientes/novo" 
          className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors"
        >
          Novo Cliente
        </Link>
      </div>

      {/* NOVA BARRA DE PESQUISA */}
      <div className="relative mb-6">
        <Input 
          placeholder="Buscar por nome ou telefone..." 
          className="pl-12 bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            {/* A lista agora usa os clientes filtrados */}
            {filteredCustomers.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <span 
                    onClick={() => navigate(`/clientes/${c.id}`)} 
                    className="font-bold hover:text-pink-primary transition-colors cursor-pointer"
                  >
                    {c.name}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{c.phone}</td>
                <td className="p-4 text-gray-600">{c.email || '-'}</td>
                <td className="p-4 text-right space-x-2">
                   <button 
                    onClick={() => navigate(`/clientes/${c.id}`)} 
                    className="text-gray-400 hover:text-pink-primary p-2 rounded-full hover:bg-pink-50" 
                    title="Editar Cliente"
                  >
                    <Edit size={18}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(c)} 
                    className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" 
                    title="Excluir Cliente"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>{searchTerm ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}</p>
            </div>
        )}
      </div>
    </div>
  );
}