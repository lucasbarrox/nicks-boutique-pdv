import { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (value: number, type: 'fixed' | 'percentage') => void;
  subtotal: number;
}

export function DiscountModal({ isOpen, onClose, onApply, subtotal }: DiscountModalProps) {
  const [type, setType] = useState<'fixed' | 'percentage'>('fixed');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value.replace(',', '.'));
    if (!isNaN(numValue) && numValue > 0) {
      onApply(numValue, type);
      onClose();
      setValue('');
    }
  };

  if (!isOpen) return null;

  // Cálculo prévio para mostrar quanto vai ficar
  const numValue = parseFloat(value.replace(',', '.')) || 0;
  const discountAmount = type === 'fixed' ? numValue : subtotal * (numValue / 100);
  const finalPreview = Math.max(0, subtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Aplicar Desconto</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Toggle Tipo */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('fixed')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${type === 'fixed' ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <DollarSign size={16} /> Dinheiro (R$)
            </button>
            <button
              type="button"
              onClick={() => setType('percentage')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${type === 'percentage' ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Percent size={16} /> Porcentagem (%)
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'fixed' ? 'Valor do desconto (R$)' : 'Porcentagem de desconto (%)'}
            </label>
            <input
              type="number"
              step="0.01"
              autoFocus
              className="w-full text-3xl font-bold text-center border-b-2 border-gray-200 focus:border-pink-500 outline-none py-2 text-gray-800"
              placeholder="0"
              value={value}
              onChange={e => setValue(e.target.value)}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 flex justify-between">
             <span>Novo Total Estimado:</span>
             <span className="font-bold text-gray-900">
               {finalPreview.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
             </span>
          </div>

          <div className="flex gap-3">
             <button
              type="button"
              onClick={() => { onApply(0, 'fixed'); onClose(); setValue(''); }}
              className="flex-1 py-3 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors"
            >
              Remover
            </button>
            <button
              type="submit"
              disabled={numValue <= 0}
              className="flex-1 py-3 bg-pink-primary text-white font-bold rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}