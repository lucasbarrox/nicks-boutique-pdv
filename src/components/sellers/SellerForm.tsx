// Importa as ferramentas essenciais do React e os 'contratos' (tipos) de dados.
import { useState, useEffect } from 'react';
import { Seller, Address } from '@/types';

/**
 * @interface Props
 * Define as propriedades que o componente SellerForm espera receber.
 * @param {Seller | null} sellerToEdit - Um objeto de vendedor existente para pré-preencher o formulário no modo de edição.
 * @param onSave - Uma função de callback que será chamada quando o formulário for enviado, passando os dados do vendedor.
 * @param onCancel - Uma função de callback que será chamada para fechar o formulário/modal.
 */
interface Props {
  sellerToEdit?: Seller | null;
  onSave: (data: Omit<Seller, 'id' | 'address'> & { address?: Omit<Address, 'id'> }) => void;
  onCancel: () => void;
}

// Define o estado inicial para um novo endereço em branco.
const initialAddressState: Omit<Address, 'id'> = {
  street: '',
  number: '',
  neighborhood: '',
};

/**
 * Componente SellerForm
 * Um formulário reutilizável para criar e editar os dados de um vendedor.
 */
export function SellerForm({ sellerToEdit, onSave, onCancel }: Props) {
  // --- ESTADO DO COMPONENTE ---
  // Criamos um estado para cada campo do formulário.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  // O estado do endereço é um objeto, pois um vendedor tem apenas um endereço.
  const [address, setAddress] = useState<Omit<Address, 'id'>>(initialAddressState);

  // --- EFEITOS ---
  // Este useEffect reage a mudanças na propriedade 'sellerToEdit'.
  // Se recebermos um vendedor para editar, ele preenche todos os estados com os dados existentes.
  // Se não, ele limpa o formulário para o modo de criação.
  useEffect(() => {
    if (sellerToEdit) {
      setName(sellerToEdit.name);
      setPhone(sellerToEdit.phone || '');
      setEmergencyPhone(sellerToEdit.emergencyPhone || '');
      setBirthDate(sellerToEdit.birthDate || '');
      setAddress(sellerToEdit.address || initialAddressState);
    }
  }, [sellerToEdit]); // Roda sempre que a propriedade 'sellerToEdit' mudar.

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Atualiza um campo específico do objeto de endereço no estado.
   * @param {keyof Omit<Address, 'id'>} field - O nome do campo do endereço a ser alterado ('street', 'number', etc.).
   * @param {string} value - O novo valor para o campo.
   */
  const handleAddressChange = (field: keyof Omit<Address, 'id'>, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Chamado quando o formulário é enviado.
   * Ele agrupa todos os dados do estado e chama a função onSave.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento padrão da página.
    // Chama a função onSave passada pelo componente pai, enviando os dados do formulário.
    onSave({ name, phone, emergencyPhone, birthDate, address });
  };

  // Uma variável booleana para sabermos facilmente se estamos no modo de edição ou criação.
  const isEditing = !!sellerToEdit;
  
  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção de Dados Pessoais do Vendedor */}
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
      
      {/* Seção de Endereço do Vendedor */}
      <div className="border-t pt-4">
        <h4 className="font-bold text-lg mb-2">Endereço</h4>
        <div className="space-y-2 p-4 border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="md:col-span-2"><label className="text-sm">Rua</label><input type="text" value={address.street} onChange={e => handleAddressChange('street', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            <div><label className="text-sm">Nº</label><input type="text" value={address.number} onChange={e => handleAddressChange('number', e.target.value)} className="w-full p-2 border rounded-md" required /></div>
            <div className="md:col-span-3"><label className="text-sm">Bairro</label><input type="text" value={address.neighborhood} onChange={e => handleAddressChange('neighborhood', e.target.value)} className="w-full p-2 border rounded-md" /></div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
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