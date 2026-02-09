import { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, PackageOpen } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { FinalizeSaleModal } from '../sales/FinalizeSaleModal';
import { SaleSuccessModal } from '../sales/SaleSuccessModal';
import { Sale } from '@/types';

export function Cart() {
  const { items, removeItem, updateQuantity, customer } = useCartStore();
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);

  // Cálculo local do total (Preço x Quantidade)
  const total = items.reduce((acc, item) => acc + (item.product.basePrice * item.quantity), 0);

  const handleSuccess = (sale: Sale) => {
    setLastSale(sale);
    setIsSuccessOpen(true);
  };

  // Se o carrinho estiver vazio
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400 bg-white border-l">
        <PackageOpen size={64} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Seu carrinho está vazio</p>
        <p className="text-sm text-center mt-2">Adicione produtos através da lista ao lado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white border-l shadow-xl w-full md:w-[400px]">
        {/* Cabeçalho */}
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-pink-primary" size={20} />
            <h2 className="font-bold text-gray-800">Carrinho</h2>
          </div>
          <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full">
            {items.length} itens
          </span>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.map((item) => (
            <div key={item.variant.sku} className="flex gap-4 p-3 bg-white border rounded-lg shadow-sm hover:border-pink-200 transition-colors">
              {/* Imagem (se houver, senão placeholder) */}
              <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                {item.product.image_url ? (
                   <img src={item.product.image_url} alt="" className="w-full h-full object-cover rounded-md" />
                ) : (
                   <span className="text-xs text-gray-400 font-bold">{item.variant.size}</span>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</h3>
                  <p className="text-xs text-gray-500">
                    Cor: {item.variant.color} | Tam: {item.variant.size}
                  </p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <p className="font-bold text-pink-primary">
                    {item.product.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  
                  {/* Controles de Quantidade */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border">
                    <button 
                      onClick={() => updateQuantity(item.variant.sku, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:bg-white rounded shadow-sm transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.variant.sku, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded shadow-sm transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botão Remover */}
              <button 
                onClick={() => removeItem(item.variant.sku)}
                className="text-gray-400 hover:text-red-500 self-start p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Rodapé e Totais */}
        <div className="p-6 bg-gray-50 border-t space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            {customer && (
              <div className="flex justify-between text-blue-600 font-medium">
                <span>Cliente</span>
                <span className="truncate max-w-[150px]">{customer.name}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>

          <button
            onClick={() => setIsFinalizeOpen(true)}
            className="w-full bg-pink-primary hover:bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95 flex justify-between px-6"
          >
            <span>Finalizar Venda</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Modais */}
      <FinalizeSaleModal 
        isOpen={isFinalizeOpen} 
        onClose={() => setIsFinalizeOpen(false)}
        onSuccess={handleSuccess}
      />

      {lastSale && (
        <SaleSuccessModal
          isOpen={isSuccessOpen}
          onClose={() => setIsSuccessOpen(false)}
          sale={lastSale}
        />
      )}
    </>
  );
}