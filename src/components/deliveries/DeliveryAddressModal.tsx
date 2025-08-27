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
  neighborhood: '', 
  city: '', 
  state: '',
  number: '',
  complement: '',
  zipCode: '',
};

export function DeliveryAddressModal({ isOpen, onClose, customer, onAddressSelect }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>(initialAddressState);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // Continuamos buscando todas as taxas para fazer a busca automática
  const deliveryFees = useMemo(() => db.deliveryFees.getAll(), []);

  useEffect(() => {
    if (isOpen) {
      setView('list');
      setNewAddress(initialAddressState);
      setDeliveryNotes('');
    }
  }, [isOpen]);

  if (!customer) return null;

  // Lógica central para encontrar a taxa e finalizar a seleção
  const findFeeAndSelectAddress = (address: Address) => {
    if (!address.neighborhood) {
      toast.error("O endereço precisa ter um bairro definido para calcular a taxa.");
      return;
    }

    // Procura por uma taxa correspondente (ignorando maiúsculas/minúsculas e espaços)
    const matchingFee = deliveryFees.find(
      fee => fee.neighborhood.trim().toLowerCase() === address.neighborhood.trim().toLowerCase()
    );

    if (matchingFee) {
      // Se encontrou a taxa, chama a função do PDV com o valor correto
      onAddressSelect(address, matchingFee.fee, deliveryNotes);
      toast.success(`Taxa de ${matchingFee.fee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} aplicada para o bairro ${address.neighborhood}.`);
      onClose();
    } else {
      // Se não encontrou, avisa o usuário
      toast.error(`Nenhuma taxa de entrega encontrada para o bairro "${address.neighborhood}". Verifique o cadastro de taxas.`);
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
      findFeeAndSelectAddress(savedAddress); // Usa a lógica de busca para o endereço recém-salvo
    } else {
      toast.error("Não foi possível salvar o endereço.");
    }
  };

  const handleSelectExistingAddress = (addr: Address) => {
    findFeeAndSelectAddress(addr); // Usa a lógica de busca para o endereço existente
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entrega para ${customer.name}`}>
      {/* O SELETOR MANUAL DE TAXA FOI REMOVIDO DAQUI */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Observações da Entrega (Opcional)</label>
        <input type="text" value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Ex: Deixar na portaria, casa amarela..." />
      </div>

      {view === 'list' && (
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-gray-700">Selecione um endereço para calcular a taxa:</h3>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {customer.addresses?.length > 0 ? (
              customer.addresses.map(addr => (
                <button type="button" key={addr.id} onClick={() => handleSelectExistingAddress(addr)} className="w-full text-left p-3 border rounded-lg cursor-pointer hover:bg-pink-light/30 transition-colors">
                  <p className="font-semibold">{addr.street}, {addr.number || 'S/N'}</p>
                  <p className="text-sm text-gray-600">{addr.neighborhood}, {addr.city}</p>
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
             <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input type="text" placeholder="CEP" value={newAddress.zipCode || ''} onChange={e => handleAddressFieldChange('zipCode', e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input type="text" placeholder="Rua" value={newAddress.street} onChange={e => handleAddressFieldChange('street', e.target.value)} className="w-full p-2 border rounded-md sm:col-span-3" required />
              <input type="text" placeholder="Nº" value={newAddress.number || ''} onChange={e => handleAddressFieldChange('number', e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input type="text" placeholder="Bairro" value={newAddress.neighborhood} onChange={e => handleAddressFieldChange('neighborhood', e.target.value)} className="w-full p-2 border rounded-md" required />
              <input type="text" placeholder="Cidade" value={newAddress.city} onChange={e => handleAddressFieldChange('city', e.target.value)} className="w-full p-2 border rounded-md" required />
              <input type="text" placeholder="Estado" value={newAddress.state} onChange={e => handleAddressFieldChange('state', e.target.value)} className="w-full p-2 border rounded-md" required />
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