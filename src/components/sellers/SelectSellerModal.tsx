// Importa as ferramentas essenciais do React e os 'contratos' (tipos) de dados.
import { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { db } from '@/lib/db';
import { Seller } from '@/types';

// Importa o componente 'Link' para navegação e o ícone de 'Adicionar Usuário'.
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

/**
 * @interface Props
 * Define as propriedades que o componente SelectSellerModal espera receber.
 * @param {boolean} isOpen - Controla se o modal está visível ou não.
 * @param onClose - Uma função de callback para fechar o modal.
 * @param onSelect - Uma função de callback que é chamada quando um vendedor é selecionado, passando o objeto do vendedor.
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (seller: Seller) => void;
}

/**
 * Componente SelectSellerModal
 * Um modal reutilizável para buscar e selecionar um vendedor existente,
 * com um atalho para a página de criação de um novo vendedor.
 */
export function SelectSellerModal({ isOpen, onClose, onSelect }: Props) {
  // --- ESTADO DO COMPONENTE ---

  // Guarda a lista completa de vendedores, buscando do banco de dados apenas uma vez na inicialização.
  const [sellers] = useState(() => db.sellers.getAll());
  // Guarda o texto que o usuário digita no campo de busca.
  const [search, setSearch] = useState('');
  
  // --- LÓGICA DE FILTRO OTIMIZADA ---

  // useMemo garante que a filtragem da lista de vendedores só seja executada
  // quando a lista original ou o termo de busca mudarem, otimizando a performance.
  const filteredSellers = useMemo(() => {
    // Se a busca estiver vazia, retorna a lista completa.
    if (!search.trim()) return sellers;

    // Filtra a lista, buscando no nome do vendedor (ignorando maiúsculas/minúsculas).
    return sellers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [sellers, search]); // Dependências do useMemo

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Chamado quando o usuário clica em um vendedor na lista.
   * @param {Seller} seller - O objeto do vendedor que foi selecionado.
   */
  const handleSelect = (seller: Seller) => {
    onSelect(seller); // Chama a função do componente pai para "devolver" o vendedor selecionado.
    onClose(); // Fecha o modal.
  };
  
  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Vendedor">
      {/* Seção do cabeçalho do modal com a busca e o botão de novo vendedor */}
      <div className="flex gap-4 mb-4">
        <input 
          type="text" 
          placeholder="Buscar por nome..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
        />
        {/* O componente Link permite navegar para a página de criação de vendedores. */}
        <Link to="/vendedores/novo" className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-lg font-semibold whitespace-nowrap hover:bg-pink-primary/90">
          <UserPlus size={18} /> Novo
        </Link>
      </div>

      {/* A lista de vendedores filtrados, com uma barra de rolagem se o conteúdo for grande. */}
      <div className="max-h-80 overflow-y-auto">
        {/* Mapeia e renderiza cada vendedor da lista filtrada. */}
        {filteredSellers.map(s => (
          <div key={s.id} onClick={() => handleSelect(s)} className="p-3 hover:bg-pink-light/30 rounded-lg cursor-pointer">
            <p className="font-bold">{s.name}</p>
          </div>
        ))}
      </div>
    </Modal>
  )
}