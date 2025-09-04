// Importa o componente base de Modal e os ícones que vamos usar.
import { Modal } from '../ui/Modal';
import { CheckCircle, Printer, ArrowRight } from 'lucide-react';

/**
 * @interface Props
 * Define as propriedades que o componente SaleSuccessModal espera receber.
 * @param {boolean} isOpen - Controla se o modal está visível ou não.
 * @param onNewSale - Uma função de callback que será chamada quando o usuário clicar em "Próxima Venda" ou fechar o modal.
 * @param onPrint - Uma função de callback que será chamada quando o usuário clicar em "Imprimir Comprovante".
 */
interface Props {
  isOpen: boolean;
  onNewSale: () => void;
  onPrint: () => void;
}

/**
 * Componente SaleSuccessModal
 * Um modal que aparece após a finalização bem-sucedida de uma venda.
 * Ele informa ao usuário que tudo deu certo e oferece as próximas ações (nova venda ou impressão).
 */
export function SaleSuccessModal({ isOpen, onNewSale, onPrint }: Props) {
  return (
    // Usa o componente Modal base, passando o controle de visibilidade (isOpen)
    // e a função para fechar (onNewSale), que também inicia a próxima venda.
    <Modal isOpen={isOpen} onClose={onNewSale} title="Status da Venda">
      <div className="text-center py-8">
        <CheckCircle 
          className="mx-auto text-green-500 mb-4"
          size={64}
          strokeWidth={1.5}
        />
        <h2 className="text-3xl font-bold text-gray-800">Venda Concluída!</h2>
        <p className="text-gray-500 mt-2">A venda foi registrada e o estoque foi atualizado.</p>
      </div>

      {/* Container para os botões de ação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        
        {/* Botão para Imprimir Comprovante */}
        <button 
          onClick={onPrint}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-semibold transition-colors bg-white border-2 border-pink-primary text-pink-primary hover:bg-pink-light/30"
        >
          <Printer size={20} />
          Imprimir Comprovante
        </button>

        {/* Botão para Iniciar a Próxima Venda */}
        <button 
          onClick={onNewSale}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-bold transition-colors bg-pink-primary text-white hover:bg-pink-primary/90"
        >
          Próxima Venda
          <ArrowRight size={20} />
        </button>
        
      </div>
    </Modal>
  )
}