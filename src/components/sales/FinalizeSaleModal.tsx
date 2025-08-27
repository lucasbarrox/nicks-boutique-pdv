import { Modal } from '../ui/Modal';
import { Sale } from '@/types';

type PaymentMethod = Sale['paymentMethod'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFinalize: (paymentMethod: PaymentMethod) => void;
  total: number;
}

const paymentOptions: PaymentMethod[] = ['Crédito', 'Débito', 'Dinheiro', 'Pix'];

export function FinalizeSaleModal({ isOpen, onClose, onFinalize, total }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Venda">
      <div className="text-center mb-6">
        <p className="text-lg text-gray-600">Total a Pagar</p>
        <p className="text-5xl font-bold text-pink-primary">
          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {paymentOptions.map(method => (
          <button 
            key={method} 
            onClick={() => onFinalize(method)} 
            className="p-6 border-2 border-pink-primary rounded-lg text-pink-primary font-bold hover:bg-pink-light/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-primary"
          >
            {method}
          </button>
        ))}
      </div>
    </Modal>
  )
}