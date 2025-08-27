import { useState, useEffect } from 'react';
import { Seller } from '@/types';

interface Props {
  sellerToEdit?: Seller | null;
  onSave: (data: Omit<Seller, 'id'>) => void;
  onCancel: () => void;
}

export function SellerForm({ sellerToEdit, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [commissionRate, setCommissionRate] = useState(0);

  useEffect(() => {
    if (sellerToEdit) {
      setName(sellerToEdit.name);
      setCommissionRate(sellerToEdit.commissionRate || 0);
    }
  }, [sellerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, commissionRate });
  };

  const isEditing = !!sellerToEdit;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Nome do Vendedor</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Taxa de Comissão (%)</label>
        <input 
          type="number"
          value={commissionRate}
          onChange={e => setCommissionRate(Number(e.target.value))}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none"
        />
      </div>
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Vendedor'}
        </button>
      </div>
    </form>
  )
}