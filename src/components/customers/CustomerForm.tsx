import { useState, useEffect } from 'react';
import { Customer, Address } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  customerToEdit?: Customer | null;
  onSave: (data: Omit<Customer, 'id' | 'addresses'> & { addresses: Omit<Address, 'id'>[] }) => void;
  onCancel: () => void;
}

const initialAddressState: Omit<Address, 'id'> = { street: '', neighborhood: '', city: '', state: '', number: '', complement: '', zipCode: '' };

export function CustomerForm({ customerToEdit, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [addresses, setAddresses] = useState<Omit<Address, 'id'>[]>([initialAddressState]);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
      setBirthDate(customerToEdit.birthDate || '');
      setNotes(customerToEdit.notes || '');
      // Garante que haja pelo menos um formulário de endereço, mesmo que o cliente não tenha nenhum
      setAddresses(customerToEdit.addresses.length > 0 ? customerToEdit.addresses : [initialAddressState]);
    } else {
      // Reseta para o estado inicial ao criar um novo cliente
      setName('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setNotes('');
      setAddresses([initialAddressState]);
    }
  }, [customerToEdit]);

  const handleAddressChange = (index: number, field: keyof Omit<Address, 'id'>, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  const addAddress = () => {
    setAddresses([...addresses, initialAddressState]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtra endereços que não foram preenchidos antes de salvar
    const nonEmptyAddresses = addresses.filter(addr => addr.street && addr.neighborhood && addr.city && addr.state);
    onSave({ name, phone, email, birthDate, notes, addresses: nonEmptyAddresses });
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

      <div className="border-t pt-4">
        <h4 className="font-bold text-lg mb-2">Endereços</h4>
        {addresses.map((addr, index) => (
          <div key={index} className="space-y-2 mb-4 p-4 border rounded-lg relative">
            {addresses.length > 1 && (
              <button type="button" onClick={() => removeAddress(index)} className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-100 rounded-full" title="Remover Endereço">
                <Trash2 size={16}/>
              </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-3"><label className="text-sm">Rua, Nº, Comp.</label><input type="text" value={addr.street || ''} onChange={e => handleAddressChange(index, 'street', e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="text-sm">Bairro</label><input type="text" value={addr.neighborhood || ''} onChange={e => handleAddressChange(index, 'neighborhood', e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="text-sm">Cidade</label><input type="text" value={addr.city || ''} onChange={e => handleAddressChange(index, 'city', e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="text-sm">Estado</label><input type="text" value={addr.state || ''} onChange={e => handleAddressChange(index, 'state', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addAddress} className="flex items-center gap-2 text-sm font-semibold text-pink-primary mt-2 hover:underline">
          <Plus size={16}/> Adicionar Outro Endereço
        </button>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  )
}