import { useState, useEffect } from 'react';
import { X, MapPin, Plus, Loader2, Truck } from 'lucide-react';
import { Customer, Address, DeliveryFee } from '@/types';
import { db } from '@/lib/db';
import { toast } from 'sonner';

interface DeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: Address, fee: number) => void;
  customer?: Customer | null;
}

export function DeliveryAddressModal({ isOpen, onClose, onConfirm, customer }: DeliveryAddressModalProps) {
  const [fees, setFees] = useState<DeliveryFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Estado para novo endereço
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'São Paulo', // Cidade padrão para facilitar
    state: 'SP',
    zip: ''
  });

  // Carregar taxas de entrega ao abrir
  useEffect(() => {
    if (isOpen) {
      loadFees();
    }
  }, [isOpen]);

  async function loadFees() {
    try {
      const data = await db.deliveryFees.getAll();
      setFees(data || []);
    } catch (error) {
      console.error("Erro ao carregar taxas", error);
    }
  }

  const getFeeForNeighborhood = (neighborhood: string) => {
    // Normaliza para minúsculas para comparar
    const found = fees.find(f => f.neighborhood.toLowerCase() === neighborhood.toLowerCase());
    return found ? found.fee : 0; // Se não achar taxa, assume grátis (ou valor padrão)
  };

  const handleSelectExisting = (address: Address) => {
    if (!address.neighborhood) {
      toast.error('Endereço sem bairro cadastrado. Edite ou adicione um novo.');
      return;
    }
    const fee = getFeeForNeighborhood(address.neighborhood);
    onConfirm(address, fee);
    onClose();
  };

  const handleSaveNew = async () => {
    if (!newAddress.street || !newAddress.neighborhood || !newAddress.city) {
      toast.error('Rua, Bairro e Cidade são obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      const addressToSave = newAddress as Address;
      
      // Se tiver cliente, poderíamos salvar no banco (Feature Futura)
      // Por enquanto, apenas usamos na venda atual
      
      const fee = getFeeForNeighborhood(addressToSave.neighborhood!);
      onConfirm(addressToSave, fee);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar endereço');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const addresses = customer?.addresses || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 text-pink-primary">
            <Truck size={24} />
            <h2 className="font-bold text-lg">Dados de Entrega</h2>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-500" /></button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Lista de Endereços Salvos (se houver cliente) */}
          {!isAddingNew && addresses.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-700">Endereços Salvos</h3>
              <div className="grid gap-3">
                {addresses.map((addr, idx) => {
                   const fee = addr.neighborhood ? getFeeForNeighborhood(addr.neighborhood) : 0;
                   return (
                    <button
                      key={idx}
                      onClick={() => handleSelectExisting(addr)}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:border-pink-300 hover:bg-pink-50 text-left transition-colors group w-full"
                    >
                      <MapPin className="text-gray-400 group-hover:text-pink-500 mt-1" size={20} />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{addr.street}, {addr.number}</p>
                        <p className="text-sm text-gray-600">{addr.neighborhood} - {addr.city}</p>
                        {addr.complement && <p className="text-xs text-gray-500">{addr.complement}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Taxa</p>
                        <p className="font-bold text-green-600">
                          {fee === 0 ? 'Grátis' : fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </button>
                   );
                })}
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou</span></div>
              </div>
            </div>
          )}

          {/* Formulário de Novo Endereço */}
          {(isAddingNew || addresses.length === 0) && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="font-medium text-gray-700">Novo Endereço</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500">Rua *</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.street}
                    onChange={e => setNewAddress({...newAddress, street: e.target.value})}
                    placeholder="Av. Paulista"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Número *</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.number}
                    onChange={e => setNewAddress({...newAddress, number: e.target.value})}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Bairro *</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.neighborhood}
                    onChange={e => setNewAddress({...newAddress, neighborhood: e.target.value})}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Complemento</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.complement}
                    onChange={e => setNewAddress({...newAddress, complement: e.target.value})}
                    placeholder="Apto 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Cidade *</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.city}
                    onChange={e => setNewAddress({...newAddress, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Estado</label>
                  <input 
                    className="w-full p-2 border rounded-lg" 
                    value={newAddress.state}
                    onChange={e => setNewAddress({...newAddress, state: e.target.value})}
                    maxLength={2}
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveNew}
                disabled={isLoading}
                className="w-full py-3 bg-pink-primary text-white rounded-lg font-bold hover:bg-pink-600 transition-colors flex justify-center gap-2 items-center mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Confirmar Endereço'}
              </button>

              {addresses.length > 0 && (
                <button 
                  onClick={() => setIsAddingNew(false)}
                  className="w-full py-2 text-gray-500 hover:text-gray-800 text-sm"
                >
                  Cancelar e voltar para lista
                </button>
              )}
            </div>
          )}

          {/* Botão para mostrar formulário se tiver lista */}
          {!isAddingNew && addresses.length > 0 && (
            <button 
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-primary hover:text-pink-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Adicionar Outro Endereço
            </button>
          )}

        </div>
      </div>
    </div>
  );
}