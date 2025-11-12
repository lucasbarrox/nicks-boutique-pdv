import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';
import { Customer, Address } from '@/types';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onAddressSelect: (address: Address, fee: number, notes?: string) => void;
}

const initialAddressState: Omit<Address, 'id'> = { 
  street: '', 
  number: '',
  neighborhood: '', 
  complement: '',
};

export function DeliveryAddressModal({ isOpen, onClose, customer, onAddressSelect }: Props) {
  
  const [view, setView] = useState<'list' | 'form'>('list');
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>(initialAddressState);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  

  const deliveryFees = useMemo(() => db.deliveryFees.getAll(), []);
  const neighborhoods = useMemo(() => [...new Set(deliveryFees.map(fee => fee.neighborhood.trim()))].sort(), [deliveryFees]);


  useEffect(() => {
    if (isOpen) {
      setView('list'); 
      setNewAddress({ ...initialAddressState, neighborhood: neighborhoods[0] || '' });
      setDeliveryNotes('');
    }
  }, [isOpen, neighborhoods]);

  if (!customer) return null;


  const findFeeAndSelectAddress = (address: Address) => {
    if (!address.neighborhood) {
      toast.error("O endereço precisa ter um bairro definido para calcular a taxa.");
      return;
    }
    const matchingFee = deliveryFees.find(
      fee => fee.neighborhood.trim().toLowerCase() === address.neighborhood.trim().toLowerCase()
    );

    if (matchingFee) {
      onAddressSelect(address, matchingFee.fee, deliveryNotes);
      toast.success(`Taxa de ${matchingFee.fee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} aplicada para o bairro ${address.neighborhood}.`);
      onClose(); // Fecha o modal
    } else {
      toast.error(`Nenhuma taxa de entrega encontrada para o bairro "${address.neighborhood}".`);
    }
  };

  const handleAddressFieldChange = (field: keyof Omit<Address, 'id'>, value: string) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const savedAddress = db.customers.addAddress(customer.id, newAddress);
    if (savedAddress) {
      const updatedCustomer = db.customers.getById(customer.id);
      if (updatedCustomer) {
        useCartStore.getState().setCustomer(updatedCustomer);
      }
      toast.success("Novo endereço salvo para o cliente!");
      findFeeAndSelectAddress(savedAddress);
    } else {
      toast.error("Não foi possível salvar o endereço.");
    }
  };

 
  const handleSelectExistingAddress = (addr: Address) => {
    findFeeAndSelectAddress(addr);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entrega para ${customer.name}`}>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Observações da Entrega (Opcional)</label>
        <input type="text" value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Ex: Deixar na portaria, casa amarela..." />
      </div>

      {view === 'list' && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-gray-700">Selecione um endereço salvo:</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {customer.addresses?.length > 0 ? (
              customer.addresses.map(addr => (
                <button type="button" key={addr.id} onClick={() => handleSelectExistingAddress(addr)} className="w-full text-left p-3 border rounded-lg cursor-pointer hover:bg-pink-light/30 transition-colors">
                  <p className="font-semibold">{addr.street}, {addr.number}</p>
                  <p className="text-sm text-gray-600">{addr.neighborhood}</p>
                </button>
              ))
            ) : ( <p className="text-sm text-gray-500 text-center py-4">Nenhum endereço cadastrado.</p> )}
          </div>
          <button onClick={() => setView('form')} className="w-full flex items-center justify-center gap-2 mt-4 p-3 border-2 border-dashed rounded-lg">
            <Plus size={16} /> Cadastrar Novo Endereço
          </button>
        </div>
      )}

      {view === 'form' && (
        <form onSubmit={handleSaveNewAddress} className="border-t pt-4">
          <button type="button" onClick={() => setView('list')} className="flex items-center gap-2 text-sm font-semibold mb-4"><ArrowLeft size={16} /> Voltar para a lista</button>
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" placeholder="Rua, Av..." value={newAddress.street} onChange={e => handleAddressFieldChange('street', e.target.value)} className="w-full p-2 border rounded-md sm:col-span-2" required />
              <input type="text" placeholder="Nº" value={newAddress.number} onChange={e => handleAddressFieldChange('number', e.target.value)} className="w-full p-2 border rounded-md" required />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select value={newAddress.neighborhood} onChange={e => handleAddressFieldChange('neighborhood', e.target.value)} className="w-full p-2 border rounded-md bg-white" required>
                <option value="" disabled>Selecione o Bairro</option>
                {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <input type="text" placeholder="Complemento (Opcional)" value={newAddress.complement || ''} onChange={e => handleAddressFieldChange('complement', e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold">Salvar e Usar Endereço</button>
          </div>
        </form>
      )}
    </Modal>
  );
}