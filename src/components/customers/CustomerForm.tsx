import { useState, useEffect } from 'react';
import { Customer } from '@/types';

interface Props {
  customerToEdit?: Customer | null;
  onSave: (data: Omit<Customer, 'id'>) => void;
  onCancel: () => void;
}

export function CustomerForm({ customerToEdit, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
    }
  }, [customerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, email });
  };
  
  const isEditing = !!customerToEdit;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Nome Completo</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Telefone (WhatsApp)</label>
        <input 
          type="text" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Email (Opcional)</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
        />
      </div>
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  )
}