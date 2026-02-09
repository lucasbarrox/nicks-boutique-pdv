import { useState, useEffect } from 'react';
import { Plus, Search, Users, MapPin, Phone, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const data = await db.customers.getAll();
      setCustomers(data);
    } catch (e) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleCreateCustomer = async (data: any) => {
    try {
      await db.customers.create(data);
      toast.success('Cliente cadastrado!');
      setIsModalOpen(false);
      loadCustomers();
    } catch (e) {
      toast.error('Erro ao salvar cliente');
    }
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-pink-primary" size={48} /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-pink-primary text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-2">
        <Search className="text-gray-400" />
        <input 
          placeholder="Buscar cliente..." 
          className="flex-1 outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(customer => (
          <Link key={customer.id} to={`/clientes/${customer.id}`} className="bg-white p-6 rounded-xl shadow-sm border hover:border-pink-300 transition-colors block">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-pink-primary">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.email || 'Sem email'}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2"><Phone size={16} /> {customer.phone || '-'}</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> {customer.addresses?.length || 0} endereços</p>
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Novo Cliente</h2>
                <CustomerForm onSubmit={handleCreateCustomer} onCancel={() => setIsModalOpen(false)} />
            </div>
        </div>
      )}
    </div>
  );
}