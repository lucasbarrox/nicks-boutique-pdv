import { useState, useEffect } from 'react';
import { DeliveryFee } from '@/types';

interface Props {
  feeToEdit?: DeliveryFee | null;
  onSave: (data: Omit<DeliveryFee, 'id'>) => void;
  onCancel: () => void;
}

export function DeliveryFeeForm({ feeToEdit, onSave, onCancel }: Props) {
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [fee, setFee] = useState(0);

  useEffect(() => {
    if (feeToEdit) {
      setNeighborhood(feeToEdit.neighborhood);
      setCity(feeToEdit.city);
      setFee(feeToEdit.fee);
    } else {
      // Reseta o formulário se não estiver editando (para o modo de criação)
      setNeighborhood('');
      setCity('');
      setFee(0);
    }
  }, [feeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ neighborhood, city, fee });
  };

  const isEditing = !!feeToEdit;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Bairro</label>
        <input 
          type="text" 
          value={neighborhood} 
          onChange={e => setNeighborhood(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Cidade</label>
        <input 
          type="text" 
          value={city} 
          onChange={e => setCity(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Valor da Taxa (R$)</label>
        <input 
          type="number"
          step="0.01"
          value={fee} 
          onChange={e => setFee(Number(e.target.value))} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Taxa'}
        </button>
      </div>
    </form>
  );
}