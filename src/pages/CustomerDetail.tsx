import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Customer, Address } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
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

  const handleSave = (data: Omit<Customer, 'id' | 'addresses'> & { addresses: Omit<Address, 'id'>[] }) => {
    const cameFromPDV = location.state?.from === '/';
    
    // Adiciona IDs a qualquer endereço novo que não tenha um
    const addressesWithIds = data.addresses.map(addr => 
        ('id' in addr && addr.id) 
        ? addr as Address 
        : { ...addr, id: `addr_${Date.now()}_${Math.random()}` }
    );

    if (isNew) {
      const customerData = { ...data, addresses: addressesWithIds };
      const newCustomer = db.customers.create(customerData);
      toast.success(`Cliente "${newCustomer.name}" criado!`);
      
      if (cameFromPDV) {
        useCartStore.getState().setCustomer(newCustomer);
        navigate('/');
        return;
      }
    } else if (customerId) {
      const existingCustomer = db.customers.getById(customerId);
      if (!existingCustomer) return;

      const updatedData: Customer = { 
        ...existingCustomer, 
        ...data, 
        id: customerId,
        addresses: addressesWithIds,
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
    </div>
  );
}