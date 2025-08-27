import React, { useState, useMemo, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { Product, Sale, Address, Customer, Payment } from '@/types';
import { Search, Package, User, Truck, X, Plus, Minus, ShoppingCart, UserCheck, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { SelectCustomerModal } from '@/components/customers/SelectCustomerModal';
import { FinalizeSaleModal } from '@/components/sales/FinalizeSaleModal';
import { SelectSellerModal } from '@/components/sellers/SelectSellerModal';
import { SaleSuccessModal } from '@/components/sales/SaleSuccessModal';
import { Receipt } from '@/components/sales/Receipt';
import { DeliveryAddressModal } from '@/components/deliveries/DeliveryAddressModal';
import { getTopSellingProducts } from '@/lib/analytics';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full p-3 border border-border-neutral rounded-lg focus:ring-2 focus:ring-pink-primary focus:border-pink-primary outline-none transition" />;
const Button = ({ children, ...props }: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className="w-full px-6 py-3 rounded-lg font-bold transition-colors bg-pink-primary text-white hover:bg-pink-primary/90 disabled:opacity-50">{children}</button>;

export function PDV() {
  const [products, setProducts] = useState<Product[]>(() => db.products.getAll());
  const [sales, setSales] = useState<Sale[]>(() => db.sales.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  
  const { 
    items, customer, seller, deliveryInfo,
    setCustomer, setSeller, setDeliveryInfo, 
    addItem, removeItem, updateQuantity, clearCart, 
    getTotal 
  } = useCartStore();

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  const [isFinalizeModalOpen, setFinalizeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  const topSelling = useMemo(() => getTopSellingProducts(sales, products, 4), [sales, products]);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    window.print();
  };
  
  useEffect(() => {
    const sellers = db.sellers.getAll();
    if (sellers.length > 0 && !seller) {
      setSeller(sellers[0]);
    }
  }, [seller, setSeller]);

  const filteredProducts = useMemo(() => searchTerm ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))) : [], [products, searchTerm]);
  
  const handleSelectAddress = (address: Address, fee: number, notes?: string) => {
    setDeliveryInfo({ address, fee, notes });
    toast.success("Entrega adicionada ao carrinho!");
  };

  const handleFinalizeSale = (details: { payments: Payment[], amountPaid: number, changeDue: number }) => {
    if (!seller) { toast.error("Por favor, selecione um vendedor."); return; }
    
    const saleData = {
      customerId: customer?.id || null,
      customerName: customer?.name,
      sellerId: seller?.id || null,
      sellerName: seller?.name,
      items: items.map(i => ({ sku: i.sku, quantity: i.quantity, price: i.unitPrice })),
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
    
    const newSale = db.sales.create(saleData);
    setLastSale(newSale);
    setSales(db.sales.getAll());
    
    setFinalizeModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleNewSale = () => {
    clearCart();
    setProducts(db.products.getAll());
    setSearchTerm('');
    setLastSale(null);
    setIsSuccessModalOpen(false);
  };

  return (
    <>
      <SelectCustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} onSelect={(c) => setCustomer(c as Customer)} />
      <SelectSellerModal isOpen={isSellerModalOpen} onClose={() => setSellerModalOpen(false)} onSelect={(s) => setSeller(s)} />
      <FinalizeSaleModal isOpen={isFinalizeModalOpen} onClose={() => setFinalizeModalOpen(false)} total={getTotal()} onFinalize={handleFinalizeSale} />
      <SaleSuccessModal isOpen={isSuccessModalOpen} onNewSale={handleNewSale} onPrint={handlePrint} />
      <DeliveryAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} customer={customer} onAddressSelect={handleSelectAddress} />
      
      <div id="printable-receipt">
        <Receipt sale={lastSale} />
      </div>

      <div className="h-full flex flex-col">
        <header className="bg-white p-4 rounded-xl shadow-sm mb-6 flex-wrap flex justify-between items-center gap-4">
            <div className="flex gap-4">
                <button onClick={() => setSellerModalOpen(true)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors"><UserCheck size={20} className="text-pink-primary"/><div><p className="text-xs text-gray-500">Vendedor(a)</p><p className="font-bold text-left">{seller?.name || 'Selecionar'}</p></div></button>
                <button onClick={() => setCustomerModalOpen(true)} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 transition-colors"><User size={20} className="text-pink-primary"/><div><p className="text-xs text-gray-500">Cliente</p><p className="font-bold text-left">{customer?.name || 'Cliente Avulso'}</p></div>{customer && <X size={16} className="ml-2 hover:text-red-500" onClick={(e) => { e.stopPropagation(); setCustomer(null);}}/>}</button>
            </div>
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                <Input placeholder="Buscar produto por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12" />
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm h-full flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 border-b pb-6 mb-6">
                {topSelling.map(({ product }) => (
                  <div key={product.id} className="border border-border-neutral rounded-lg p-4 flex flex-col">
                    <div className="bg-gray-100 rounded h-32 flex items-center justify-center mb-4"><Package className="text-gray-400" size={48} /></div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-pink-primary font-bold text-xl mb-2">{product.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <div className="mt-auto space-y-2">
                      {product.variants.map(v => <button key={v.sku} onClick={() => addItem(product, v)} disabled={v.stock <= 0} className="w-full text-left text-sm flex justify-between items-center p-2 rounded hover:bg-pink-light/30 disabled:opacity-50 disabled:cursor-not-allowed"><span>{v.size} / {v.color}</span><span className={`font-semibold ${v.stock <= 5 && v.stock > 0 ? 'text-orange-500' : 'text-gray-600'} ${v.stock === 0 ? 'text-red-500' : ''}`}>{v.stock > 0 ? `${v.stock} un.` : 'Esgotado'}</span></button>)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto -mr-3 pr-3">
                {!searchTerm && <div className="h-full flex items-center justify-center text-center text-gray-500"><p>Busque por produtos ou clique em um dos mais vendidos acima.</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(p => <div key={p.id} className="border border-border-neutral rounded-lg p-4 flex flex-col"><div className="bg-gray-100 rounded h-32 flex items-center justify-center mb-4"><Package className="text-gray-400" size={48} /></div><h3 className="font-bold text-lg">{p.name}</h3><p className="text-pink-primary font-bold text-xl mb-2">{p.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><div className="mt-auto space-y-2">{p.variants.map(v => <button key={v.sku} onClick={() => addItem(p, v)} disabled={v.stock <= 0} className="w-full text-left text-sm flex justify-between items-center p-2 rounded hover:bg-pink-light/30 disabled:opacity-50 disabled:cursor-not-allowed"><span>{v.size} / {v.color}</span><span className={`font-semibold ${v.stock <= 5 && v.stock > 0 ? 'text-orange-500' : 'text-gray-600'} ${v.stock === 0 ? 'text-red-500' : ''}`}>{v.stock > 0 ? `${v.stock} un.` : 'Esgotado'}</span></button>)}</div></div>)}
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-4 border-b pb-3 flex justify-between items-center">Carrinho <span>({items.length})</span></h2>
              <div className="flex-1 overflow-y-auto -mr-3 pr-3 space-y-2">
                {items.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-gray-500"><ShoppingCart size={48} className="mb-4" /><p>Nenhum item no carrinho</p></div> : 
                items.map(item => (
                  <div key={item.sku} className="flex items-center gap-2 p-2">
                    <div className="bg-gray-100 rounded p-2"><Package size={20} className="text-gray-400" /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.variantInfo}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <button onClick={() => updateQuantity(item.sku, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-200"><Minus size={12} /></button>
                        <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.sku, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-200"><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base">{(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <button onClick={() => removeItem(item.sku)} className="text-red-500 hover:text-red-700 mt-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto border-t pt-4 space-y-2">
                <div className="space-y-3">
                  <button 
                    onClick={() => customer ? setIsAddressModalOpen(true) : toast.error('Selecione um cliente para adicionar entrega!')} 
                    disabled={!customer} 
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-pink-primary"
                  >
                    <Truck size={16}/> 
                    {deliveryInfo ? `Entrega: ${deliveryInfo.address.street}` : 'Adicionar Entrega'}
                  </button>
                </div>
                <div className="flex justify-between font-semibold"><span>Subtotal</span><span>{useCartStore.getState().getSubtotal().toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                {deliveryInfo && <div className="flex justify-between font-semibold"><span>Entrega</span><span>{deliveryInfo.fee.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>}
                <div className="flex justify-between font-bold text-2xl text-pink-primary pt-2 border-t"><span>Total</span><span>{getTotal().toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></div>
                <Button onClick={() => setFinalizeModalOpen(true)} disabled={items.length === 0}>Finalizar Venda</Button>
              </div>
            </div>
        </div>
      </div>
    </>
  );
}