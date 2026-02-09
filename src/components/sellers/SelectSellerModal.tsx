import { useState, useEffect } from 'react';
import { X, Search, UserCheck, Loader2 } from 'lucide-react';
import { Seller } from '@/types';
import { db } from '@/lib/db';
import { toast } from 'sonner';

interface SelectSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (seller: Seller) => void;
}

export function SelectSellerModal({ isOpen, onClose, onSelect }: SelectSellerModalProps) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSellers();
    }
  }, [isOpen]);

  async function loadSellers() {
    setIsLoading(true);
    try {
      const data = await db.sellers.getAll();
      setSellers(data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar vendedores');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredSellers = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[500px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="font-bold text-lg text-gray-800">Selecionar Vendedor</h2>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar vendedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {isLoading ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-pink-primary" /></div>
          ) : (
            <div className="space-y-1 pb-2">
              {filteredSellers.map((seller) => (
                <button
                  key={seller.id}
                  onClick={() => {
                    onSelect(seller);
                    onClose();
                  }}
                  className="w-full p-3 flex items-center gap-4 hover:bg-pink-50 rounded-lg transition-colors group text-left"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                    <UserCheck size={20} />
                  </div>
                  <span className="font-bold text-gray-800">{seller.name}</span>
                </button>
              ))}
              {filteredSellers.length === 0 && !isLoading && (
                 <p className="text-center py-8 text-gray-400">Nenhum vendedor encontrado.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}