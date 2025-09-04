// Importa as ferramentas essenciais do React: 'useState' para gerenciar o estado
// do formulário e 'useEffect' para reagir a mudanças nas propriedades.
import { useState, useEffect } from 'react';

// Importa o 'contrato' (tipo) que define a estrutura de uma Taxa de Entrega.
import { DeliveryFee } from '@/types';

/**
 * @interface Props
 * Define as propriedades que o componente DeliveryFeeForm espera receber.
 * @param {DeliveryFee | null} feeToEdit - Um objeto de taxa existente para pré-preencher o formulário no modo de edição.
 * @param onSave - Uma função de callback que será chamada quando o formulário for enviado, passando os dados da taxa.
 * @param onCancel - Uma função de callback que será chamada para fechar o formulário/modal.
 */
interface Props {
  feeToEdit?: DeliveryFee | null;
  onSave: (data: Omit<DeliveryFee, 'id'>) => void;
  onCancel: () => void;
}

/**
 * Componente DeliveryFeeForm
 * Um formulário reutilizável para criar e editar taxas de entrega.
 */
export function DeliveryFeeForm({ feeToEdit, onSave, onCancel }: Props) {
  // --- ESTADO DO COMPONENTE ---
  // Criamos um estado para cada campo do formulário.
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [fee, setFee] = useState(0);

  // --- EFEITOS ---
  // Este useEffect reage a mudanças na propriedade 'feeToEdit'.
  // Se recebermos uma taxa para editar, ele preenche os estados com os dados existentes.
  // Se não (feeToEdit é nulo), ele limpa o formulário, preparando-o para o modo de criação.
  useEffect(() => {
    if (feeToEdit) {
      setNeighborhood(feeToEdit.neighborhood);
      setCity(feeToEdit.city);
      setFee(feeToEdit.fee);
    } else {
      // Reseta o formulário para o modo de criação.
      setNeighborhood('');
      setCity('');
      setFee(0);
    }
  }, [feeToEdit]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  /**
   * Chamado quando o formulário é enviado.
   * @param {React.FormEvent} e - O evento do formulário.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Previne o recarregamento padrão da página ao enviar.
    // Chama a função onSave passada pelo componente pai, enviando os dados atuais do formulário.
    onSave({ neighborhood, city, fee });
  };

  // Uma variável booleana para sabermos facilmente se estamos no modo de edição ou criação.
  // Usada para mudar o texto do botão de salvar.
  const isEditing = !!feeToEdit;


  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-semibold mb-1">Bairro</label>
        <input 
          type="text" 
          value={neighborhood} 
          onChange={e => setNeighborhood(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Cidade</label>
        <input 
          type="text" 
          value={city} 
          onChange={e => setCity(e.target.value)} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Valor da Taxa (R$)</label>
        <input 
          type="number"
          step="0.01" // Permite a digitação de centavos.
          value={fee} 
          onChange={e => setFee(Number(e.target.value))} 
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" 
          required 
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type-="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Criar Taxa'}
        </button>
      </div>
    </form>
  );
}