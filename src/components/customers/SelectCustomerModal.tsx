// Importa as ferramentas essenciais do React: 'useState' para gerenciar o estado
// interno do modal e 'useMemo' para otimizar a performance da busca.
import { useState, useMemo } from 'react';

// Importa nosso componente base de Modal e o nosso "banco de dados".
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';

// Importa os 'contratos' (tipos) de dados e os ícones.
import { Customer } from '@/types';
import { UserPlus } from 'lucide-react';

// Importa o componente 'Link' para navegação entre páginas.
import { Link } from 'react-router-dom';

/**
 * @interface Props
 * Define as propriedades que o componente SelectCustomerModal espera receber.
 * @param {boolean} isOpen - Controla se o modal está visível ou não.
 * @param onClose - Uma função de callback para fechar o modal.
 * @param onSelect - Uma função de callback que é chamada quando um cliente é selecionado, passando o objeto do cliente.
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

/**
 * Componente SelectCustomerModal
 * Um modal reutilizável para buscar e selecionar um cliente existente,
 * ou navegar para a página de criação de um novo cliente.
 */
export function SelectCustomerModal({ isOpen, onClose, onSelect }: Props) {
  // --- ESTADO DO COMPONENTE ---

  // Guarda a lista completa de clientes, buscando do banco de dados apenas uma vez.
  const [customers] = useState(() => db.customers.getAll());
  // Guarda o texto que o usuário digita no campo de busca.
  const [search, setSearch] = useState('');
  
  // --- LÓGICA DE FILTRO OTIMIZADA ---

  // useMemo garante que a filtragem da lista de clientes só seja executada
  // quando a lista original ou o termo de busca mudarem, evitando recálculos desnecessários.
  const filteredCustomers = useMemo(() => {
    // Se a busca estiver vazia, retorna a lista completa.
    if (!search.trim()) return customers;
    
    // Filtra a lista, buscando tanto no nome (ignorando maiúsculas/minúsculas) quanto no telefone.
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.phone.includes(search)
    );
  }, [customers, search]); // Dependências do useMemo
  
  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Chamado quando o usuário clica em um cliente na lista.
   * @param {Customer} customer - O objeto do cliente que foi selecionado.
   */
  const handleSelect = (customer: Customer) => {
    onSelect(customer); // Chama a função do componente pai para "devolver" o cliente selecionado.
    onClose(); // Fecha o modal.
  };

  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Cliente">
      {/* Seção do cabeçalho do modal com a busca e o botão de novo cliente */}
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome ou telefone..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
        />
        {/* O componente Link nos permite navegar para a página de criação de clientes sem recarregar a página. */}
        <Link to="/clientes/novo" className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-lg font-semibold whitespace-nowrap hover:bg-pink-primary/90">
          <UserPlus size={18} /> Novo
        </Link>
      </div>

      {/* A lista de clientes filtrados, com uma barra de rolagem se o conteúdo for grande. */}
      <div className="max-h-80 overflow-y-auto">
        {filteredCustomers.length > 0 ? (
          // Se encontrarmos clientes, mapeamos e renderizamos cada um.
          filteredCustomers.map(c => (
            <div key={c.id} onClick={() => handleSelect(c)} className="p-3 hover:bg-pink-light/30 rounded-lg cursor-pointer">
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-gray-600">{c.phone}</p>
            </div>
          ))
        ) : (
          // Se a lista filtrada estiver vazia, mostramos uma mensagem.
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}