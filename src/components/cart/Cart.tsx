import { useState } from 'react';
import { ShoppingCart, Trash2, Minus, Plus, CreditCard, User, Truck, Tag } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { FinalizeSaleModal } from '../sales/FinalizeSaleModal';
import { DeliverySelectionModal } from './DeliverySelectionModal';
import { DiscountModal } from './DiscountModal';

export function Cart() {
  const { 
    items, 
    customer, 
    // removeItem, // Estava unused, vamos usar agora
    updateQuantity, 
    subtotal, 
    total, 
    clearCart,
    deliveryFee,
    setDeliveryFee,
    discount,
    setDiscount
  } = useCartStore();

  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const subtotalValue = subtotal();
  const totalValue = total();

  if (items.length === 0) {
    return (
      <div className="w-96 bg-white border-l h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-pink-primary" />
            Carrinho
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
          <ShoppingCart size={48} className="mb-4 opacity-20" />
          <p>O carrinho está vazio</p>
          <p className="text-sm mt-2">Adicione produtos para começar a venda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white border-l h-full flex flex-col shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-pink-primary" />
            Carrinho
          </h2>
          <p className="text-xs text-gray-500">{items.length} itens</p>
        </div>
        <button 
          onClick={clearCart}
          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm"
          title="Limpar Carrinho"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map(item => {
          // Lógica para encontrar a variante correta visualmente
          // Se tiver selectedVariant, usa. Senão tenta achar pelo SKU. Senão pega a primeira.
          const variant = item.selectedVariant || item.variants?.find(v => v.sku === item.sku) || item.variants?.[0];

          return (
            <div key={item.id} className="flex gap-3 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 line-clamp-1">{item.name}</h4>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span>{variant?.size || 'U'}</span>
                    <span>•</span>
                    <span>{variant?.color || 'Cor Única'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-pink-600 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-pink-600 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {(item.basePrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer com Totais e Ações */}
      <div className="border-t bg-gray-50 p-4 space-y-4">
        
        {/* Cliente Selecionado */}
        {customer && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white p-2 rounded-lg border">
            <User size={16} className="text-pink-500" />
            <span className="truncate flex-1">{customer.name}</span>
            <button onClick={() => useCartStore.getState().setCustomer(null)} className="text-xs text-red-400 hover:text-red-600">Remover</button>
          </div>
        )}

        {/* Botões de Taxa e Desconto */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => setIsDeliveryModalOpen(true)}
            className={`text-xs flex items-center justify-center gap-1 py-2 rounded-lg border transition-colors ${deliveryFee > 0 ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            <Truck size={14} />
            {deliveryFee > 0 ? 'Alterar Entrega' : 'Add Entrega'}
          </button>
          <button 
            onClick={() => setIsDiscountModalOpen(true)}
             className={`text-xs flex items-center justify-center gap-1 py-2 rounded-lg border transition-colors ${discount ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
          >
            <Tag size={14} />
             {discount ? 'Alterar Desc.' : 'Add Desconto'}
          </button>
        </div>

        {/* Resumo de Valores */}
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>{subtotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          
          {deliveryFee > 0 && (
            <div className="flex justify-between text-blue-600">
              <span className="flex items-center gap-1"><Truck size={12}/> Entrega</span>
              <span>+ {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          )}

          {discount && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1"><Tag size={12}/> Desconto ({discount.type === 'percentage' ? `${discount.value}%` : 'R$'})</span>
              <span>- {(subtotalValue + deliveryFee - totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          )}

          <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>

        <button 
          onClick={() => setIsFinalizeModalOpen(true)}
          className="w-full bg-pink-primary hover:bg-pink-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg shadow-pink-200 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <CreditCard size={24} />
          Finalizar Venda
        </button>
      </div>

      {/* Modais */}
      <FinalizeSaleModal 
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        // CORREÇÃO: Passando onSuccess para limpar o carrinho após venda
        onSuccess={() => {
          clearCart();
          setIsFinalizeModalOpen(false);
        }}
      />

      <DeliverySelectionModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        onSelect={(fee, id) => setDeliveryFee(fee, id)}
      />

      <DiscountModal 
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        subtotal={subtotalValue}
        onApply={(val, type) => setDiscount({ value: val, type })}
      />
    </div>
  );
}