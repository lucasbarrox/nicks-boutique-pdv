import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Payment } from '@/types';
import { Trash2, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart'; // Importa o store do carrinho

export interface FinalizeSaleDetails {
  payments: Payment[];
  amountPaid: number;
  changeDue: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (details: FinalizeSaleDetails) => void;
  total: number; // Esse total já deve vir com o desconto aplicado
}

const paymentMethods: Payment['method'][] = ['Dinheiro', 'Pix', 'Débito', 'Crédito'];

export function FinalizeSaleModal({ isOpen, onClose, onFinalize, total }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentAmount, setCurrentAmount] = useState('');

  // Desconto vindo do store do carrinho
  const { discount, discountType, setDiscount } = useCartStore();
  const subtotal = useCartStore.getState().getSubtotal();

  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setCurrentAmount(total > 0 ? total.toFixed(2) : '');
      // Removido o reset do desconto para permitir digitação
      // setDiscount(0, 'R$');
    }
  }, [isOpen, total]);

  const handleClose = () => {
    setDiscount(0, 'R$'); // Reseta o desconto ao fechar
    onClose();
  };


  const calculatedDiscount = useMemo(() => {
    if (discountType === '%' && discount > 0) {
      return (subtotal * discount) / 100;
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const { totalPaid, balanceDue, changeDue } = useMemo(() => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceDue = Math.max(0, total - totalPaid);
    const changeDue = Math.max(0, totalPaid - total);
    return { totalPaid, balanceDue, changeDue };
  }, [payments, total]);

  const handleAddPayment = (method: Payment['method']) => {
    const amount = parseFloat(currentAmount);
    if (!amount || amount <= 0) return;

    setPayments(prev => [...prev, { method, amount }]);

    const newBalance = total - (totalPaid + amount);
    setCurrentAmount(Math.max(0, newBalance).toFixed(2));
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleFinalize = () => {
    onFinalize({ payments, amountPaid: totalPaid, changeDue });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pagamento">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <label className="block font-semibold mb-2 flex items-center gap-2"><Tag size={16}/> Desconto</label>
            <div className="flex items-center gap-2">
              <input 
                type="number"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0, discountType)}
                className="w-full p-2 border rounded-lg"
                placeholder="0"
              />
              <div className="flex bg-gray-200 rounded-lg p-1">
                <button onClick={() => setDiscount(discount, 'R$')} className={`px-3 py-1 text-sm font-bold rounded-md ${discountType === 'R$' ? 'bg-white shadow' : ''}`}>R$</button>
                <button onClick={() => setDiscount(discount, '%')} className={`px-3 py-1 text-sm font-bold rounded-md ${discountType === '%' ? 'bg-white shadow' : ''}`}>%</button>
              </div>
            </div>
          </div>

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

        <div className="bg-gray-50 p-4 rounded-lg space-y-3 flex flex-col">
          <h3 className="text-lg font-bold text-center border-b pb-2">Resumo</h3>
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          {calculatedDiscount > 0 && <div className="flex justify-between text-red-500"><span>Desconto:</span><span className="font-semibold">- {calculatedDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total a Pagar:</span><span className="font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          <div className="flex justify-between"><span>Total Recebido:</span><span>{totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
          <div className={`flex justify-between text-xl font-bold ${balanceDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
            <span>{balanceDue > 0 ? 'Falta Pagar:' : 'Total Pago:'}</span>
            <span>{balanceDue > 0 ? balanceDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          {changeDue > 0 && <div className="flex justify-between text-2xl font-bold text-blue-500 border-t pt-3"><span>TROCO:</span><span>{changeDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}
          
          <div className="mt-auto space-y-2 pt-2">
            {payments.map((p, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-2 rounded text-sm shadow-sm">
                <span>{p.method}</span>
                <span className="font-semibold">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <button onClick={() => handleRemovePayment(index)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>

          <button onClick={handleFinalize} disabled={balanceDue > 0} className="w-full mt-4 p-4 bg-pink-primary text-white rounded-lg font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed">
            Finalizar Venda
          </button>
        </div>
      </div>
    </Modal>
  )
}