import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { toast } from 'sonner';
import { ArrowLeft, Home } from 'lucide-react';
import { useCartStore } from '@/store/cart';

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState<Customer | null>(null);

  const isNew = customerId === 'novo';

  useEffect(() => {
    if (customerId && !isNew) {
      const foundCustomer = db.customers.getById(customerId);
      if (foundCustomer) {
        setCustomer(foundCustomer);
      } else {
        toast.error("Cliente não encontrado.");
        navigate('/clientes');
      }
    }
  }, [customerId, isNew, navigate]);

  const handleSave = (data: Omit<Customer, 'id' | 'addresses'>) => {
    const cameFromPDV = location.state?.from === '/';

    if (isNew) {
      const newCustomer = db.customers.create({ ...data, addresses: [] }); // Cria cliente com array de endereços vazio
      toast.success(`Cliente "${newCustomer.name}" criado!`);
      
      if (cameFromPDV) {
        useCartStore.getState().setCustomer(newCustomer);
        navigate('/');
        return;
      }
    } else if (customerId) {
      const existingCustomer = db.customers.getById(customerId);
      if (!existingCustomer) return;
      
      // Mantém os endereços existentes e atualiza o resto dos dados
      const updatedData: Customer = { 
        ...existingCustomer, 
        ...data, 
        id: customerId,
      };
      db.customers.update(updatedData);
      toast.success("Cliente atualizado!");
    }
    navigate('/clientes');
  };

  if (!isNew && !customer) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Carregando cliente...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(location.state?.from || '/clientes')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft />
        </button>
        <div>
            <h2 className="text-2xl font-bold">{isNew ? 'Novo Cliente' : 'Editar Cliente'}</h2>
            {!isNew && <p className="text-gray-600">{customer?.name}</p>}
        </div>
      </div>

      <CustomerForm 
        customerToEdit={isNew ? undefined : customer} 
        onSave={handleSave} 
        onCancel={() => navigate(location.state?.from || '/clientes')} 
      />

      {/* NOVA SEÇÃO: MOSTRA ENDEREÇOS SALVOS (APENAS NA EDIÇÃO) */}
      {!isNew && customer && customer.addresses.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Home size={20} />
            Endereços Salvos
          </h3>
          <div className="space-y-3">
            {customer.addresses.map(addr => (
              <div key={addr.id} className="p-3 bg-gray-50 border rounded-lg text-sm">
                <p className="font-semibold">{addr.street}, {addr.number || 'S/N'}</p>
                <p className="text-gray-600">{addr.neighborhood}, {addr.city} - {addr.state}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}