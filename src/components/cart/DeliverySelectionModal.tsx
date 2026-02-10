import { useState } from 'react';
import { X, MapPin, Search, Truck } from 'lucide-react';
import { useDeliveryFees } from '@/hooks/useDeliveryFees';
import { DeliveryFee } from '@/types';

interface DeliverySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fee: number, id: string) => void;
}

export function DeliverySelectionModal({ isOpen, onClose, onSelect }: DeliverySelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: fees = [], isLoading } = useDeliveryFees();

  const filteredFees = fees.filter(f => 
    f.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Truck className="text-pink-primary" size={20} />
            Selecionar Entrega
          </h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              autoFocus
              type="text"
              placeholder="Buscar bairro..."
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <p className="p-4 text-center text-gray-500">Carregando taxas...</p>
          ) : filteredFees.map(fee => (
            <button
              key={fee.id}
              onClick={() => { onSelect(fee.fee, fee.id); onClose(); }}
              className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-colors">
                  <MapPin size={16} />
                </div>
                <span className="font-medium text-gray-800">{fee.neighborhood}</span>
              </div>
              <span className="font-bold text-gray-900">
                {fee.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </button>
          ))}
          
          {!isLoading && filteredFees.length === 0 && (
            <p className="p-4 text-center text-gray-500 text-sm">Nenhuma taxa encontrada.</p>
          )}
        </div>

        <div className="p-3 border-t bg-gray-50 text-center">
            <button onClick={() => { onSelect(0, ''); onClose(); }} className="text-sm text-red-500 hover:underline">
                Remover Taxa de Entrega
            </button>
        </div>
      </div>
    </div>
  );
}