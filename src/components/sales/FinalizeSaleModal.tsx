import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Payment, Sale } from '@/types';
import { Trash2 } from 'lucide-react';

// A nova "assinatura" da nossa função de finalizar
interface FinalizeSaleDetails {
  payments: Payment[];
  amountPaid: number;
  changeDue: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (details: FinalizeSaleDetails) => void;
  total: number;
}

const paymentMethods: Payment['method'][] = ['Dinheiro', 'Pix', 'Débito', 'Crédito'];

export function FinalizeSaleModal({ isOpen, onClose, onFinalize, total }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState('');

  // Limpa o estado do modal sempre que ele é aberto
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setCurrentAmount(total.toFixed(2));
    }
  }, [isOpen, total]);

  // Cálculos automáticos que rodam a cada mudança
  const { totalPaid, balanceDue, changeDue } = useMemo(() => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, total - totalPaid);
    const changeDue = Math.max(0, totalPaid - total);
    return { totalPaid, balanceDue, changeDue };
  }, [payments, total]);

  const handleAddPayment = (method: Payment['method']) => {
    const amount = parseFloat(currentAmount);
    if (!amount || amount <= 0) {
      return; // Não adiciona pagamento com valor zero ou inválido
    }

    setPayments(prev => [...prev, { method, amount }]);
    
    // Prepara o campo para o próximo pagamento, se ainda faltar
    const newBalance = total - (totalPaid + amount);
    setCurrentAmount(Math.max(0, newBalance).toFixed(2));
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

  const handleFinalize = () => {
    onFinalize({ payments, amountPaid: totalPaid, changeDue });
  };

  const isFinalizeDisabled = balanceDue > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Venda">
      <div className="grid grid-cols-2 gap-8">
        {/* Lado Esquerdo: Adicionar Pagamentos */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Valor a Pagar</label>
            <input 
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0.00"
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

        {/* Lado Direito: Resumo */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3 flex flex-col">
          <h3 className="text-lg font-bold text-center border-b pb-2">Resumo</h3>
          <div className="flex justify-between text-lg"><span>Total da Venda:</span><span className="font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          <div className="flex justify-between"><span>Total Pago:</span><span className="font-semibold">{totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          <div className={`flex justify-between text-xl font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
            <span>{balanceDue > 0 ? 'Falta Pagar:' : 'Total Pago:'}</span>
            <span>{balanceDue > 0 ? balanceDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          {changeDue > 0 && <div className="flex justify-between text-2xl font-bold text-blue-500 border-t pt-3"><span>TROCO:</span><span>{changeDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
          
          <div className="mt-auto space-y-2">
            {payments.map((p, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm">
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