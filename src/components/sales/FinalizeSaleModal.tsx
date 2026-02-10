import { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useCartStore } from '@/store/cart';
import { Sale, SaleItem } from '@/types';
import { useCreateSale } from '@/hooks/useSales';
import { Trash2, DollarSign, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface FinalizeSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FinalizeSaleModal({ isOpen, onClose, onSuccess }: FinalizeSaleModalProps) {
  // Estado local para pagamentos
  const [payments, setPayments] = useState<{ method: string; amount: number }[]>([]);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState('Dinheiro');
  const [amountToPay, setAmountToPay] = useState('');

  // Dados da Store
  const { 
    items, 
    customer, 
    seller, 
    subtotal: getSubtotal, 
    total: getTotal, 
    deliveryFee, 
    discount 
  } = useCartStore();

  const createSaleMutation = useCreateSale();
  
  // Valores calculados
  const subtotal = getSubtotal();
  const total = getTotal();
  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Math.max(0, totalPaid - total);

  // Reinicia estado ao abrir
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setAmountToPay(total.toFixed(2));
    }
  }, [isOpen, total]);

  const handleAddPayment = () => {
    const val = parseFloat(amountToPay.replace(',', '.'));
    if (!val || val <= 0) return;

    setPayments([...payments, { method: currentPaymentMethod, amount: val }]);
    
    // Calcula quanto falta para sugerir no próximo input
    const newPaid = totalPaid + val;
    const newRemaining = Math.max(0, total - newPaid);
    setAmountToPay(newRemaining > 0 ? newRemaining.toFixed(2) : '');
  };

  const handleRemovePayment = (index: number) => {
    const newPayments = [...payments];
    newPayments.splice(index, 1);
    setPayments(newPayments);
  };

  const handleFinalize = async () => {
    if (remaining > 0.01) { // Margem de erro para float
      toast.error('O valor total ainda não foi pago.');
      return;
    }

    try {
      const salePayload = {
        customer_id: customer?.id,
        customerName: customer?.name,
        seller_id: seller?.id,
        sellerName: seller?.name,
        total: total,
        payment_method: payments.map(p => p.method).join(', '), // Simplificação para registro
        status: 'Concluída',
        date: new Date().toISOString(),
        items: items.map(item => ({
          sku: item.sku,
          quantity: item.quantity,
          price: item.basePrice,
          name: item.name
        }))
      };

      await createSaleMutation.mutateAsync(salePayload);
      onSuccess(); // Limpa carrinho e fecha modal
      
    } catch (error) {
      console.error(error);
      // Erro já tratado no hook
    }
  };

  const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Venda">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Esquerda: Resumo */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-3 h-fit">
          <h3 className="font-bold text-gray-700 border-b pb-2">Resumo do Pedido</h3>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal ({items.length} itens)</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm text-blue-600">
              <span>Taxa de Entrega</span>
              <span>+ {formatMoney(deliveryFee)}</span>
            </div>
          )}

          {discount && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto ({discount.type === 'percentage' ? `${discount.value}%` : 'R$'})</span>
              <span>- {formatMoney(subtotal + deliveryFee - total)}</span>
            </div>
          )}

          <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2 mt-2">
            <span>Total a Pagar</span>
            <span>{formatMoney(total)}</span>
          </div>

          {/* Status do Pagamento */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm mb-1">
              <span>Já Pago:</span>
              <span className="font-bold text-green-600">{formatMoney(totalPaid)}</span>
            </div>
            {remaining > 0 ? (
              <div className="flex justify-between text-lg font-bold text-red-500">
                <span>Falta:</span>
                <span>{formatMoney(remaining)}</span>
              </div>
            ) : (
              <div className="flex justify-between text-lg font-bold text-blue-500">
                <span>Troco:</span>
                <span>{formatMoney(change)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Direita: Pagamento */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['Dinheiro', 'Pix', 'Crédito', 'Débito'].map(method => (
                <button
                  key={method}
                  onClick={() => setCurrentPaymentMethod(method)}
                  className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                    currentPaymentMethod === method 
                      ? 'bg-pink-50 border-pink-500 text-pink-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
            <div className="flex gap-2">
              <input 
                type="number"
                step="0.01"
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-pink-100 outline-none"
                value={amountToPay}
                onChange={e => setAmountToPay(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPayment()}
              />
              <button 
                onClick={handleAddPayment}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Lista de Pagamentos Adicionados */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {payments.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white border p-2 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gray-400"/>
                  <span className="font-medium">{p.method}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatMoney(p.amount)}</span>
                  <button onClick={() => handleRemovePayment(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-xs text-center text-gray-400 py-2">Nenhum pagamento registrado.</p>}
          </div>

          <button 
            onClick={handleFinalize}
            disabled={remaining > 0.01}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-100"
          >
            <CreditCard size={20} />
            Concluir Venda
          </button>
        </div>
      </div>
    </Modal>
  );
}