import { useState, useEffect } from 'react';
import { X, Search, User, Plus, Loader2 } from 'lucide-react';
import { Customer } from '@/types';
import { db } from '@/lib/db';
import { CustomerForm } from './CustomerForm';
import { toast } from 'sonner';

interface SelectCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

export function SelectCustomerModal({ isOpen, onClose, onSelect }: SelectCustomerModalProps) {
  // 1. Estados para guardar os dados da nuvem
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 2. Buscar clientes assim que a janela abrir
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const data = await db.customers.getAll();
      setCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Criar cliente novo direto no modal (Bônus de UX)
  const handleCreateCustomer = async (data: any) => {
    try {
      const newCustomer = await db.customers.create(data);
      toast.success('Cliente cadastrado!');
      // Já seleciona o cliente novo e fecha
      onSelect(newCustomer);
      onClose();
    } catch (error) {
      toast.error('Erro ao criar cliente');
    }
  };

  // 4. Filtro seguro (só roda depois que customers tem dados)
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm)) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[600px] flex flex-col">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-lg text-gray-800">
            {isCreating ? 'Novo Cliente' : 'Selecionar Cliente'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modo de Criação */}
        {isCreating ? (
          <div className="p-4 overflow-y-auto flex-1">
            <CustomerForm 
              onSubmit={handleCreateCustomer} 
              onCancel={() => setIsCreating(false)} 
            />
          </div>
        ) : (
          /* Modo de Seleção */
          <>
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/50"
                />
              </div>

              <button 
                onClick={() => setIsCreating(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-primary hover:text-pink-primary transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} />
                Cadastrar Novo Cliente
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-2">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="animate-spin text-pink-primary" size={32} />
                </div>
              ) : (
                <div className="space-y-1 pb-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        onSelect(customer);
                        onClose();
                      }}
                      className="w-full p-3 flex items-center gap-4 hover:bg-pink-50 rounded-lg transition-colors group text-left"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{customer.name}</p>
                        <p className="text-xs text-gray-500">
                          {customer.phone || customer.email || 'Sem contato'}
                        </p>
                      </div>
                    </button>
                  ))}
                  
                  {filteredCustomers.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-400">
                      <p>Nenhum cliente encontrado.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}