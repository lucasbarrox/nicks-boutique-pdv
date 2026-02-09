import { Check, Printer, ArrowRight } from 'lucide-react';
import { Sale } from '@/types';
import { Receipt } from './Receipt';

interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

export function SaleSuccessModal({ isOpen, onClose, sale }: SaleSuccessModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    // Cria uma janela invisível para impressão ou usa a função do navegador
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho de Sucesso */}
        <div className="bg-green-500 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Check size={32} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold">Venda Concluída!</h2>
          <p className="text-green-100 mt-1">ID: {sale.displayId || sale.display_id}</p>
        </div>

        {/* Conteúdo (Resumo rápido) */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">Valor Total</span>
              <span className="text-xl font-bold text-gray-800">
                {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Pagamento</span>
              <span className="font-medium">{sale.payment_method || sale.paymentMethod || 'Dinheiro'}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors"
            >
              <Printer size={20} />
              Imprimir Recibo
            </button>

            <button 
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 bg-pink-primary hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Nova Venda
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Recibo Oculto (Apenas para Impressão) */}
        <div className="hidden print:block fixed inset-0 bg-white z-[100]">
           <Receipt sale={sale} />
        </div>
      </div>
    </div>
  );
}