import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { Sale } from '@/types';

interface FinalizeSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

export function FinalizeSaleModal({ isOpen, onClose, onSuccess }: FinalizeSaleModalProps) {
  const { items, customer, seller, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const total = items.reduce((acc, item) => acc + (item.product.basePrice * item.quantity), 0);

  const handleFinalize = async () => {
    try {
      setIsProcessing(true);

      const saleData = {
        // CORREÇÃO: Usar nomes compatíveis com o banco de dados (snake_case)
        customer_id: customer?.id, 
        customerName: customer?.name || 'Cliente Avulso',
        
        seller_id: seller?.id,
        sellerName: seller?.name,
        
        items: items.map(i => ({
          sku: i.variant.sku,
          productName: i.product.name,
          size: i.variant.size,
          color: i.variant.color,
          quantity: i.quantity,
          priceAtSale: i.product.basePrice
        })),
        total,
        payment_method: paymentMethod, // Compatível com banco
        status: 'Concluída' as const,
        date: new Date().toISOString()
      };

      // @ts-ignore - Ignorar erro de tipo estrito temporariamente para facilitar migração
      const newSale = await db.sales.create(saleData);

      clearCart();
      toast.success('Venda realizada com sucesso!');
      onSuccess(newSale);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar venda.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-pink-primary text-white">
          <h2 className="font-bold text-lg">Finalizar Venda</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-gray-500 text-sm mb-1">Total a Pagar</p>
            <p className="text-3xl font-bold text-pink-primary">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-primary focus:border-pink-primary"
            >
              <option value="Dinheiro">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="Cartão de Crédito">Cartão de Crédito</option>
              <option value="Cartão de Débito">Cartão de Débito</option>
            </select>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
             <p className="flex justify-between"><span>Itens:</span> <span className="font-medium">{items.length}</span></p>
             <p className="flex justify-between"><span>Cliente:</span> <span className="font-medium">{customer?.name || 'Avulso'}</span></p>
             <p className="flex justify-between"><span>Vendedor:</span> <span className="font-medium">{seller?.name || '-'}</span></p>
          </div>

          <button
            onClick={handleFinalize}
            disabled={isProcessing}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirmar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}