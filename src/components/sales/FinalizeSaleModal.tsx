// Importa as ferramentas essenciais do React e os 'contratos' (tipos) de dados.
import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Payment } from '@/types';
import { Trash2 } from 'lucide-react';

/**
 * @interface FinalizeSaleDetails
 * Define a "forma" do objeto que será devolvido para a página do PDV
 * quando a venda for finalizada, contendo todos os detalhes do pagamento.
 */
interface FinalizeSaleDetails {
  payments: Payment[];
  amountPaid: number;
  changeDue: number;
}

/**
 * @interface Props
 * Define as propriedades que o componente FinalizeSaleModal espera receber.
 * @param {boolean} isOpen - Controla se o modal está visível.
 * @param onClose - Função para fechar o modal.
 * @param onFinalize - Função de callback que é chamada ao finalizar, passando os detalhes do pagamento.
 * @param {number} total - O valor total da venda que precisa ser pago.
 */
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (details: FinalizeSaleDetails) => void;
  total: number;
}

// Array constante com os métodos de pagamento disponíveis.
const paymentMethods: Payment['method'][] = ['Dinheiro', 'Pix', 'Débito', 'Crédito'];

/**
 * Componente FinalizeSaleModal
 * Um modal interativo que funciona como um "terminal de pagamento",
 * permitindo múltiplos pagamentos e calculando o troco.
 */
export function FinalizeSaleModal({ isOpen, onClose, onFinalize, total }: Props) {
  // --- ESTADO DO COMPONENTE ---
  // Guarda a lista de pagamentos já adicionados à venda.
  const [payments, setPayments] = useState<Payment[]>([]);
  // Guarda o valor que está sendo digitado no campo de input.
  const [currentAmount, setCurrentAmount] = useState('');

  // --- EFEITOS ---
  // Este useEffect "reseta" o estado do modal sempre que ele é aberto.
  useEffect(() => {
    if (isOpen) {
      setPayments([]); // Limpa a lista de pagamentos anterior.
      // Preenche o campo de input com o valor total da venda, para agilizar o pagamento.
      setCurrentAmount(total > 0 ? total.toFixed(2) : '');
    }
  }, [isOpen, total]); // Roda sempre que 'isOpen' ou 'total' mudarem.

  // --- DADOS CALCULADOS ---
  // useMemo otimiza a performance, recalculando os totais apenas quando a lista de pagamentos ou o total da venda mudam.
  const { totalPaid, balanceDue, changeDue } = useMemo(() => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, total - totalPaid); // Garante que o valor a pagar nunca seja negativo.
    const changeDue = Math.max(0, totalPaid - total); // Garante que o troco nunca seja negativo.
    return { totalPaid, balanceDue, changeDue };
  }, [payments, total]);

  // --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) ---

  // Adiciona um novo pagamento à lista.
  const handleAddPayment = (method: Payment['method']) => {
    const amount = parseFloat(currentAmount);
    // Validação para não adicionar pagamentos vazios ou inválidos.
    if (!amount || amount <= 0) return;

    setPayments(prev => [...prev, { method, amount }]);
    
    // Lógica inteligente: calcula o valor restante e já o preenche no campo de input.
    const newBalance = total - (totalPaid + amount);
    setCurrentAmount(Math.max(0, newBalance).toFixed(2));
  };

  // Remove um pagamento da lista pelo seu índice.
  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // Chamada ao finalizar a venda.
  const handleFinalize = () => {
    onFinalize({ payments, amountPaid: totalPaid, changeDue });
  };

  // O botão de finalizar venda fica desabilitado enquanto o valor total não for pago.
  const isFinalizeDisabled = balanceDue > 0;

  
  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Venda">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* --- Lado Esquerdo: Adicionar Pagamentos --- */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Valor do Pagamento</label>
            <input 
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0,00"
              className="w-full p-3 border rounded-lg text-2xl font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map(method => (
              <button key={method} onClick={() => handleAddPayment(method)} className="p-4 border-2 border-pink-primary text-pink-primary rounded-lg font-bold hover:bg-pink-light/30">
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* --- Lado Direito: Resumo da Transação --- */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 flex flex-col">
          <h3 className="text-lg font-bold text-center border-b pb-2">Resumo</h3>
          <div className="flex justify-between text-lg"><span>Total da Venda:</span><span className="font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          <div className="flex justify-between"><span>Total Recebido:</span><span className="font-semibold">{totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          
          {/* Mostra 'Falta Pagar' em vermelho ou 'Total Recebido' em verde */}
          <div className={`flex justify-between text-xl font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
            <span>{balanceDue > 0 ? 'Falta Pagar:' : 'Total Recebido:'}</span>
            <span>{balanceDue > 0 ? balanceDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>

          {/* Mostra o troco apenas se o valor pago for maior que o total */}
          {changeDue > 0 && <div className="flex justify-between text-2xl font-bold text-blue-500 border-t pt-3"><span>TROCO:</span><span>{changeDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
          
          {/* A lista de pagamentos já adicionados */}
          <div className="mt-auto space-y-2 pt-2">
            {payments.map((p, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                <span>{p.method}</span>
                <span className="font-semibold">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <button onClick={() => handleRemovePayment(index)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>

          <button onClick={handleFinalize} disabled={isFinalizeDisabled} className="w-full mt-4 p-4 bg-pink-primary text-white rounded-lg font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed">
            Finalizar Venda
          </button>
        </div>
      </div>
    </Modal>
  )
}