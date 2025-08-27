import { useState, useEffect } from 'react';
import { Seller, Address } from '@/types';

interface Props {
  sellerToEdit?: Seller | null;
  onSave: (data: Omit<Seller, 'id' | 'address'> & { address?: Omit<Address, 'id'> }) => void;
  onCancel: () => void;
}

const initialAddressState: Omit<Address, 'id'> = {
  street: '',
  neighborhood: '',
  city: '',
  state: '',
};

export function SellerForm({ sellerToEdit, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState<Omit<Address, 'id'>>(initialAddressState);

  useEffect(() => {
    if (sellerToEdit) {
      setName(sellerToEdit.name);
      setPhone(sellerToEdit.phone || '');
      setEmergencyPhone(sellerToEdit.emergencyPhone || '');
      setBirthDate(sellerToEdit.birthDate || '');
      setAddress(sellerToEdit.address || initialAddressState);
    } else {
      setName('');
      setPhone('');
      setEmergencyPhone('');
      setBirthDate('');
      setAddress(initialAddressState);
    }
  }, [sellerToEdit]);

  const handleAddressChange = (field: keyof Omit<Address, 'id'>, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, phone, emergencyPhone, birthDate, address });
  };

  const isEditing = !!sellerToEdit;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Nome Completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Data de Nascimento</label>
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefone de Emergência</label>
          <input type="text" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="w-full p-2 border rounded-lg" />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-bold text-lg mb-2">Endereço</h4>
        <div className="space-y-2 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-3"><label className="text-sm">Rua, Nº, Comp.</label><input type="text" value={address.street} onChange={e => handleAddressChange('street', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <div><label className="text-sm">Bairro</label><input type="text" value={address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <div><label className="text-sm">Cidade</label><input type="text" value={address.city} onChange={e => handleAddressChange('city', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <div><label className="text-sm">Estado</label><input type="text" value={address.state} onChange={e => handleAddressChange('state', e.target.value)} className="w-full p-2 border rounded-md" /></div>
          </div>
        </div>
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