// Importa as ferramentas essenciais do React: 'useState' para gerenciar o estado
// do formulário e 'useEffect' para reagir a mudanças nas propriedades.
import { useState, useEffect } from 'react';

// Importa os 'contratos' (tipos) que definem a estrutura dos nossos dados.
import { Customer, Address } from '@/types';

// Importa os ícones que usaremos nos botões.
import { Plus, Trash2 } from 'lucide-react';

/**
 * @interface Props
 * Define as propriedades que o componente CustomerForm espera receber de seu componente pai.
 * @param {Customer | null} customerToEdit - Um objeto de cliente existente para pré-preencher o formulário no modo de edição. Se for nulo, o formulário estará no modo de criação.
 * @param onSave - Uma função de callback que será chamada quando o formulário for enviado, passando os dados do cliente.
 * @param onCancel - Uma função de callback que será chamada quando o usuário clicar em "Cancelar".
 */
interface Props {
  customerToEdit?: Customer | null;
  onSave: (data: Omit<Customer, 'id' | 'addresses'> & { addresses: Omit<Address, 'id'>[] }) => void;
  onCancel: () => void;
}

// Define o estado inicial para um novo endereço, para ser usado ao adicionar novos campos de endereço.
const initialAddressState: Omit<Address, 'id'> = { 
  street: '', 
  number: '',
  neighborhood: '',
  complement: ''
};

/**
 * Componente CustomerForm
 * Um formulário reutilizável para criar e editar clientes.
 */
export function CustomerForm({ customerToEdit, onSave, onCancel }: Props) {
  // --- ESTADO DO COMPONENTE ---
  // Criamos um estado para cada campo do formulário.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  // O estado dos endereços é um array, pois um cliente pode ter múltiplos endereços.
  const [addresses, setAddresses] = useState<Omit<Address, 'id'>[]>([initialAddressState]);

  // --- EFEITOS ---
  // Este useEffect reage a mudanças na propriedade 'customerToEdit'.
  // Se recebermos um cliente para editar, ele preenche todos os estados com os dados existentes.
  // Se não, ele limpa o formulário para o modo de criação.
  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email || '');
      setBirthDate(customerToEdit.birthDate || '');
      setNotes(customerToEdit.notes || '');
      setAddresses(customerToEdit.addresses.length > 0 ? customerToEdit.addresses : [initialAddressState]);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setBirthDate('');
      setNotes('');
      setAddresses([initialAddressState]);
    }
  }, [customerToEdit]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  // Atualiza um campo específico de um endereço específico no array de endereços.
  const handleAddressChange = (index: number, field: keyof Omit<Address, 'id'>, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setAddresses(newAddresses);
  };

  // Adiciona um novo formulário de endereço em branco à lista.
  const addAddress = () => {
    setAddresses([...addresses, initialAddressState]);
  };

  // Remove um formulário de endereço da lista, garantindo que pelo menos um sempre permaneça.
  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
    }
  };

  // Chamado quando o formulário é enviado.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento padrão da página
    // Filtra para garantir que não salvaremos endereços vazios que o usuário possa ter adicionado.
    const nonEmptyAddresses = addresses.filter(addr => addr.street && addr.neighborhood);
    // Chama a função onSave passada pelo componente pai, enviando todos os dados do formulário.
    onSave({ name, phone, email, birthDate, notes, addresses: nonEmptyAddresses });
  };
  
  // Uma variável booleana para sabermos facilmente se estamos no modo de edição ou criação.
  const isEditing = !!customerToEdit;

  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seção de Dados Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Nome Completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Telefone</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-lg"/>
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

      {/* Seção de Endereços, renderizada dinamicamente */}
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
              <div className="md:col-span-2"><label className="text-sm">Rua</label><input type="text" value={addr.street || ''} onChange={e => handleAddressChange(index, 'street', e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div><label className="text-sm">Nº</label><input type="text" value={addr.number || ''} onChange={e => handleAddressChange(index, 'number', e.target.value)} className="w-full p-2 border rounded-md" /></div>
              <div className="md:col-span-3"><label className="text-sm">Bairro</label><input type="text" value={addr.neighborhood || ''} onChange={e => handleAddressChange(index, 'neighborhood', e.target.value)} className="w-full p-2 border rounded-md" /></div>
            </div>
          </div>
        ))}
        <button type="button" onClick={addAddress} className="flex items-center gap-2 text-sm font-semibold text-pink-primary mt-2 hover:underline">
          <Plus size={16}/> Adicionar Outro Endereço
        </button>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>
      </div>
    </form>
  )
}