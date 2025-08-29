import { useState } from 'react';
import { db } from '@/lib/db';
import { Address, Payment } from '@/types';
import { Package, Truck, Minus, ShoppingCart, Trash2, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { FinalizeSaleModal } from '@/components/sales/FinalizeSaleModal';
import { SaleSuccessModal } from '@/components/sales/SaleSuccessModal';
import { DeliveryAddressModal } from '@/components/deliveries/DeliveryAddressModal';

const Button = ({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className="w-full px-6 py-3 rounded-lg font-bold transition-colors bg-pink-primary text-white hover:bg-pink-primary/90 disabled:opacity-50">{children}</button>;

export function Cart() {
  const { 
    items, customer, deliveryInfo,
    setDeliveryInfo, 
    removeItem, updateQuantity, 
    getTotal, setLastSale
  } = useCartStore();

  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const handleSelectAddress = (address: Address, fee: number, notes?: string) => {
    setDeliveryInfo({ address, fee, notes });
    toast.success("Entrega adicionada ao carrinho!");
  };

  const handleFinalizeSale = (details: { payments: Payment[], amountPaid: number, changeDue: number }) => {
    const { seller, customer: currentCustomer, items: cartItems } = useCartStore.getState();
    if (!seller) { toast.error("Por favor, selecione um vendedor."); return; }
    
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
    
    const newSale = db.sales.create(saleData as any);
    setLastSale(newSale);
    
    setFinalizeModalOpen(false);
    setIsSuccessModalOpen(true);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleNewSale = () => {
    useCartStore.getState().clearCart();
    setIsSuccessModalOpen(false);
  };

  return (
    <>
      <FinalizeSaleModal isOpen={isFinalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} total={getTotal()} onFinalize={handleFinalizeSale} />
      <SaleSuccessModal isOpen={isSuccessModalOpen} onNewSale={handleNewSale} onPrint={handlePrint} />
      <DeliveryAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} customer={customer} onAddressSelect={handleSelectAddress} />

      <aside className="bg-white p-6 flex flex-col h-full">
        <h2 className="text-2xl font-bold mb-4 border-b pb-3 flex justify-between items-center">Carrinho <span>({items.length})</span></h2>
        <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-2">
          {items.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-500"><ShoppingCart size={48} className="mb-4" /><p>Nenhum item</p></div> : 
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
          ))}
        </div>
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