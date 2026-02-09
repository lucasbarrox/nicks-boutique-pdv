import { useState } from 'react';
import { X, Search, User, Plus } from 'lucide-react';
import { Customer } from '@/types';
import { CustomerForm } from './CustomerForm';
import { Modal } from '@/components/ui/Modal';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers'; // Novo Hook

interface SelectCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export function SelectCustomerModal({ isOpen, onClose, onSelect }: SelectCustomerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: customers = [], isLoading } = useCustomers();
  const createMutation = useCreateCustomer();

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleCreate = async (data: any) => {
    try {
      const newCustomer = await createMutation.mutateAsync(data);
      onSelect(newCustomer);
      setIsCreating(false);
      onClose();
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">{isCreating ? 'Novo Cliente' : 'Selecionar Cliente'}</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        {isCreating ? (
          <div className="p-4 overflow-y-auto">
            <CustomerForm 
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : (
          <>
            <div className="p-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nome ou telefone..."
                  className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-3 p-3 text-pink-primary hover:bg-pink-50 rounded-lg transition-colors font-medium"
              >
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <Plus size={20} />
                </div>
                Cadastrar Novo Cliente
              </button>

              {isLoading ? (
                <p className="p-4 text-center text-gray-500">Carregando...</p>
              ) : filteredCustomers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => { onSelect(customer); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{customer.name}</p>
                    {customer.phone && <p className="text-xs text-gray-500">{customer.phone}</p>}
                  </div>
                </button>
              ))}
              
              {!isLoading && filteredCustomers.length === 0 && (
                <p className="p-4 text-center text-gray-500 text-sm">Nenhum cliente encontrado.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}