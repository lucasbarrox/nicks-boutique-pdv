import { useState } from 'react';
import { db } from '@/lib/db';
import { Address, Payment, Sale } from '@/types';
import { Package, Truck, Minus, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { FinalizeSaleModal } from '@/components/sales/FinalizeSaleModal';
import { SaleSuccessModal } from '@/components/sales/SaleSuccessModal';
import { DeliveryAddressModal } from '@/components/deliveries/DeliveryAddressModal';

// Componente auxiliar local para criar botões padronizados.
const Button = ({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className="w-full px-6 py-3 rounded-lg font-bold transition-colors bg-pink-primary text-white hover:bg-pink-primary/90 disabled:opacity-50">{children}</button>;

/**
 * Componente Cart
 * Responsável por toda a interface e lógica do carrinho de compras,
 * incluindo a adição de entrega e a finalização da venda.
 * Ele opera de forma independente na coluna direita da tela do PDV.
 */
export function Cart() {
  // Busca os estados e ações relevantes do nosso estado global (Zustand).
  const { 
    items, customer, deliveryInfo,
    setDeliveryInfo, 
    removeItem, updateQuantity, 
    getTotal, setLastSale
  } = useCartStore();

  // Estados locais para controlar a visibilidade dos diferentes modais.
  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  /**
   * Chamado quando um endereço é selecionado ou criado no modal de entrega.
   * Atualiza o estado do carrinho com as informações de entrega.
   */
  const handleSelectAddress = (address: Address, fee: number, notes?: string) => {
    setDeliveryInfo({ address, fee, notes });
    toast.success("Entrega adicionada ao carrinho!");
  };

  /**
   * Chamado quando o usuário confirma o pagamento no modal de finalização.
   * Reúne todos os dados da venda e a salva no banco de dados.
   */
  const handleFinalizeSale = (details: { payments: Payment[], amountPaid: number, changeDue: number }) => {
    // Busca os dados mais recentes do vendedor e cliente do estado global.
    const { seller, customer: currentCustomer, items: cartItems } = useCartStore.getState();
    
    // Validação para garantir que um vendedor está selecionado.
    if (!seller) { 
      toast.error("Por favor, selecione um vendedor."); 
      return; 
    }
    
    // Monta o objeto 'sale' com todos os dados da transação.
    const saleData = {
      customerId: currentCustomer?.id || null,
      customerName: currentCustomer?.name,
      sellerId: seller?.id || null,
      sellerName: seller?.name,
      items: cartItems.map(i => ({ sku: i.sku, quantity: i.quantity, price: i.unitPrice })),
      totalAmount: useCartStore.getState().getSubtotal(),
      discount: 0,
      deliveryFee: deliveryInfo?.fee || 0,
      deliveryAddress: deliveryInfo?.address || null,
      deliveryNotes: deliveryInfo?.notes,
      finalAmount: getTotal(),
      payments: details.payments,
      amountPaid: details.amountPaid,
      changeDue: details.changeDue,
      timestamp: new Date().toISOString(),
      status: 'Concluída' as const,
    };
    
    // Cria o registro da venda no banco de dados (que também atualiza o estoque).
    const newSale = db.sales.create(saleData as any);
    // Salva a venda recém-criada no estado global para que o recibo possa ser impresso.
    setLastSale(newSale);
    
    // Fecha o modal de pagamento e abre o de sucesso.
    setFinalizeModalOpen(false);
    setIsSuccessModalOpen(true);
  };
  
  /**
   * Função para acionar a impressão do comprovante.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Chamado pelo modal de sucesso para iniciar uma nova venda.
   * Limpa todos os dados do carrinho.
   */
  const handleNewSale = () => {
    useCartStore.getState().clearCart();
    setIsSuccessModalOpen(false);
  };

  return (
    // O React.Fragment <> é usado para agrupar os modais e o aside sem adicionar um <div> extra no DOM.
    <>
      <FinalizeSaleModal isOpen={isFinalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} total={getTotal()} onFinalize={handleFinalizeSale} />
      <SaleSuccessModal isOpen={isSuccessModalOpen} onNewSale={handleNewSale} onPrint={handlePrint} />
      <DeliveryAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} customer={customer} onAddressSelect={handleSelectAddress} />

      {/* A <aside> é usada para a barra lateral do carrinho. */}
      <aside className="bg-white p-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4 border-b pb-3 flex justify-between items-center">Carrinho <span>({items.length})</span></h2>
        
        {/* A div principal para os itens, com rolagem vertical se o conteúdo for grande. */}
        <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-2">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <ShoppingCart size={48} className="mb-4" />
              <p>Nenhum item</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.sku} className="flex items-center gap-2 p-2">
                <div className="bg-gray-100 rounded p-2"><Package size={20} className="text-gray-400" /></div>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.variantInfo}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <button onClick={() => updateQuantity(item.sku, item.quantity - 1)} className="p-1 rounded-full"><Minus size={12} /></button>
                    <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.sku, item.quantity + 1)} className="p-1 rounded-full"><Plus size={12} /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base">{(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <button onClick={() => removeItem(item.sku)} className="text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* O rodapé do carrinho, que fica fixo na parte de baixo. */}
        <div className="mt-auto border-t pt-4 space-y-2">
          <div className="space-y-3">
            <button onClick={() => customer ? setIsAddressModalOpen(true) : toast.error('Selecione um cliente!')} disabled={!customer} className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg disabled:opacity-50">
              <Truck size={16}/>{deliveryInfo ? `Entrega: ${deliveryInfo.address.street}` : 'Adicionar Entrega'}
            </button>
          </div>
          <div className="flex justify-between font-semibold"><span>Subtotal</span><span>{useCartStore.getState().getSubtotal().toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
          {deliveryInfo && <div className="flex justify-between"><span>Entrega</span><span>{deliveryInfo.fee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>}
          <div className="flex justify-between font-bold text-2xl text-pink-primary pt-2 border-t"><span>Total</span><span>{getTotal().toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
          <Button onClick={() => setFinalizeModalOpen(true)} disabled={items.length === 0}>Finalizar Venda</Button>
        </div>
      </aside>
    </>
  );
}