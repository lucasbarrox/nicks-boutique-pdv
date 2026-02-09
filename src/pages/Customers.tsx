import { useState, useMemo } from 'react';
import { Plus, Search, User, MapPin, Phone, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Modal } from '@/components/ui/Modal';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers'; // Hooks

export function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query
  const { data: customers = [], isLoading } = useCustomers();
  const createMutation = useCreateCustomer();

  const filteredCustomers = useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
    ), [customers, searchTerm]);

  const handleCreateCustomer = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-pink-primary gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-medium text-gray-500">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-gray-500">Gerencie sua base de clientes</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-pink-primary text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredCustomers.map((customer) => (
            <Link 
              key={customer.id} 
              to={`/clientes/${customer.id}`}
              className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-pink-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">{customer.name}</h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{customer.addresses?.length || 0} endereços</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="col-span-full p-8 text-center text-gray-500">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Cliente"
      >
        <CustomerForm 
          onSubmit={handleCreateCustomer}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}