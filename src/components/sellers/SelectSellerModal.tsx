import { useState } from 'react';
import { X, Search, UserCheck, Plus } from 'lucide-react';
import { Seller } from '@/types';
import { SellerForm } from './SellerForm';
import { useSellers, useCreateSeller } from '@/hooks/useSellers'; 

interface SelectSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (seller: Seller) => void;
}

export function SelectSellerModal({ isOpen, onClose, onSelect }: SelectSellerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data: sellers = [], isLoading } = useSellers();
  const createMutation = useCreateSeller();

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: any) => {
    try {
      const newSeller = await createMutation.mutateAsync(data);
      onSelect(newSeller);
      setIsCreating(false);
      onClose();
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">{isCreating ? 'Novo Vendedor' : 'Selecionar Vendedor'}</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        {isCreating ? (
          <div className="p-4">
             <SellerForm 
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
                  placeholder="Buscar vendedor..."
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
                Cadastrar Novo Vendedor
              </button>

              {isLoading ? (
                <p className="text-center p-4 text-gray-500">Carregando...</p>
              ) : filteredSellers.map(seller => (
                <button
                  key={seller.id}
                  onClick={() => { onSelect(seller); onClose(); }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{seller.name}</p>
                    {seller.pixKey && <p className="text-xs text-gray-500">Pix: {seller.pixKey}</p>}
                  </div>
                </button>
              ))}

              {!isLoading && filteredSellers.length === 0 && (
                 <p className="text-center p-4 text-gray-500 text-sm">Nenhum vendedor encontrado.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}