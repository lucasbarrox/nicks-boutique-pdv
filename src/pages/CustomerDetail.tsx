import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
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

  const handleSave = (data: Omit<Customer, 'id'>) => {
    if (isNew) {
      db.customers.create(data);
      toast.success("Cliente criado com sucesso!");
    } else if (customerId) {
      db.customers.update({ ...data, id: customerId });
      toast.success("Cliente atualizado com sucesso!");
    }
    navigate('/clientes');
  };

  if (!isNew && !customer) {
    return <div>Carregando...</div>
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/clientes')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
        onCancel={() => navigate('/clientes')} 
      />
    </div>
  );
}