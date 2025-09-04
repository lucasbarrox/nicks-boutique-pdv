// Importa as ferramentas essenciais do React e de outras bibliotecas
import { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';
import { Customer, Address } from '@/types';
import { Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart';

/**
 * @interface Props
 * Define as propriedades que o componente espera receber.
 * @param {boolean} isOpen - Controla se o modal está visível.
 * @param onClose - Função para fechar o modal.
 * @param {Customer | null} customer - O cliente selecionado no PDV, para quem a entrega será feita.
 * @param onAddressSelect - Função de callback para "devolver" o endereço e a taxa selecionados para a página do PDV.
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onAddressSelect: (address: Address, fee: number, notes?: string) => void;
}

// Define o estado inicial para um novo endereço em branco.
const initialAddressState: Omit<Address, 'id'> = { 
  street: '', 
  number: '',
  neighborhood: '', 
  complement: '',
};

/**
 * Componente DeliveryAddressModal
 * Um modal com múltiplas visualizações para gerenciar o endereço de entrega de uma venda.
 */
export function DeliveryAddressModal({ isOpen, onClose, customer, onAddressSelect }: Props) {
  // --- ESTADO DO COMPONENTE ---
  
  // Controla a visualização interna do modal: 'list' (para listar endereços) ou 'form' (para cadastrar um novo).
  const [view, setView] = useState<'list' | 'form'>('list');
  // Guarda os dados do novo endereço que está sendo digitado no formulário.
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>(initialAddressState);
  // Guarda as observações da entrega.
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  // --- DADOS E MEMORIZAÇÃO ---

  // Busca a lista de taxas de entrega do banco de dados.
  // useMemo garante que essa busca só aconteça uma vez, otimizando a performance.
  const deliveryFees = useMemo(() => db.deliveryFees.getAll(), []);
  // Cria uma lista de bairros únicos a partir das taxas, para preencher o <select>.
  const neighborhoods = useMemo(() => [...new Set(deliveryFees.map(fee => fee.neighborhood.trim()))].sort(), [deliveryFees]);

  // --- EFEITOS ---

  // Este useEffect "reseta" o estado do modal sempre que ele é aberto.
  useEffect(() => {
    if (isOpen) {
      setView('list'); // Sempre começa na visualização de lista.
      // Pré-seleciona o primeiro bairro da lista no formulário de novo endereço.
      setNewAddress({ ...initialAddressState, neighborhood: neighborhoods[0] || '' });
      setDeliveryNotes(''); // Limpa as observações.
    }
  }, [isOpen, neighborhoods]);

  // Cláusula de guarda: se não houver cliente, não renderiza nada.
  if (!customer) return null;


  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Lógica central que busca a taxa correspondente a um endereço e finaliza a seleção.
   * @param {Address} address - O endereço (novo ou existente) selecionado pelo usuário.
   */
  const findFeeAndSelectAddress = (address: Address) => {
    if (!address.neighborhood) {
      toast.error("O endereço precisa ter um bairro definido para calcular a taxa.");
      return;
    }
    // Procura por uma taxa correspondente, ignorando maiúsculas/minúsculas e espaços extras.
    const matchingFee = deliveryFees.find(
      fee => fee.neighborhood.trim().toLowerCase() === address.neighborhood.trim().toLowerCase()
    );

    if (matchingFee) {
      // Se encontrou a taxa, chama a função do PDV com os dados corretos.
      onAddressSelect(address, matchingFee.fee, deliveryNotes);
      toast.success(`Taxa de ${matchingFee.fee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} aplicada para o bairro ${address.neighborhood}.`);
      onClose(); // Fecha o modal
    } else {
      // Se não encontrou, avisa o usuário.
      toast.error(`Nenhuma taxa de entrega encontrada para o bairro "${address.neighborhood}".`);
    }
  };

  /**
   * Atualiza o estado do formulário de novo endereço conforme o usuário digita.
   */
  const handleAddressFieldChange = (field: keyof Omit<Address, 'id'>, value: string) => {
    setNewAddress(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Chamado ao enviar o formulário de novo endereço.
   */
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    // Salva o novo endereço no perfil do cliente no "banco de dados".
    const savedAddress = db.customers.addAddress(customer.id, newAddress);
    if (savedAddress) {
      // Atualiza o cliente no estado global para que a UI reflita a mudança.
      const updatedCustomer = db.customers.getById(customer.id);
      if (updatedCustomer) {
        useCartStore.getState().setCustomer(updatedCustomer);
      }
      toast.success("Novo endereço salvo para o cliente!");
      // Prossegue para encontrar a taxa e finalizar a seleção.
      findFeeAndSelectAddress(savedAddress);
    } else {
      toast.error("Não foi possível salvar o endereço.");
    }
  };

  /**
   * Chamado quando o usuário clica em um endereço já existente na lista.
   */
  const handleSelectExistingAddress = (addr: Address) => {
    findFeeAndSelectAddress(addr);
  };


  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Entrega para ${customer.name}`}>
      {/* Estes campos aparecem em ambas as visualizações do modal */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Observações da Entrega (Opcional)</label>
        <input type="text" value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Ex: Deixar na portaria, casa amarela..." />
      </div>

      {/* Renderização condicional: mostra a lista de endereços */}
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

      {/* Renderização condicional: mostra o formulário de novo endereço */}
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