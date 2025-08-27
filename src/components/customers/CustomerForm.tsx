import { useState, useEffect } from 'react';
import { Customer } from '@/types';

interface Props {
  customerToEdit?: Customer | null;
  // A assinatura do onSave foi simplificada, não lida mais com endereços
  onSave: (data: Omit<Customer, 'id' | 'addresses'>) => void;
  onCancel: () => void;
}

export function CustomerForm({ customerToEdit, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
      setBirthDate(customerToEdit.birthDate || '');
      setNotes(customerToEdit.notes || '');
    } else {
      // Reseta para o estado inicial ao criar um novo cliente
      setName('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setNotes('');
    }
  }, [customerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, email, birthDate, notes });
  };
  
  const isEditing = !!customerToEdit;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Nome Completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefone (WhatsApp)</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Data de Nascimento</label>
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Observações</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" rows={3}></textarea>
        </div>
      </div>

      {/* A SEÇÃO DE ENDEREÇOS FOI COMPLETAMENTE REMOVIDA DAQUI */}

      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  )
}