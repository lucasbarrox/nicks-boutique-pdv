import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DeliveryFee } from '@/types';

interface DeliveryFeeFormProps {
  onSubmit: (data: Omit<DeliveryFee, 'id'>) => Promise<void>;
  onCancel: () => void;
  initialData?: DeliveryFee;
}

export function DeliveryFeeForm({ onSubmit, onCancel, initialData }: DeliveryFeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    neighborhood: initialData?.neighborhood || '',
    fee: initialData?.fee.toString() || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        neighborhood: formData.neighborhood,
        fee: parseFloat(formData.fee.replace(',', '.')) || 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Bairro</label>
        <input 
          required
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-primary outline-none"
          value={formData.neighborhood}
          onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
          placeholder="Ex: Centro"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Taxa de Entrega (R$)</label>
        <input 
          required
          type="number" 
          step="0.01"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-primary outline-none"
          value={formData.fee}
          onChange={e => setFormData({ ...formData, fee: e.target.value })}
          placeholder="0.00"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button 
          disabled={isSubmitting} 
          type="submit" 
          className="px-4 py-2 bg-pink-primary text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 transition-colors"
        >
           {isSubmitting && <Loader2 className="animate-spin" size={16} />}
           Salvar Taxa
        </button>
      </div>
    </form>
  );
}