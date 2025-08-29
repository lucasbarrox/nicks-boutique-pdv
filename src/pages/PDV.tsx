import React, { useState, useMemo, useEffect } from 'react';
import { db } from '@/lib/db';
import { Product, Sale, Customer } from '@/types';
import { Search, Package, User, X, UserCheck } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { SelectCustomerModal } from '@/components/customers/SelectCustomerModal';
import { SelectSellerModal } from '@/components/sellers/SelectSellerModal';
import { Receipt } from '@/components/sales/Receipt';
import { getTopSellingProducts } from '@/lib/analytics';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full p-3 border rounded-lg" />;

export function PDV() {
  const [products] = useState<Product[]>(() => db.products.getAll());
  const [sales] = useState<Sale[]>(() => db.sales.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  
  // O PDV agora só precisa dos estados e ações relevantes para ele
  const { 
    customer, seller, lastSale,
    setCustomer, setSeller, 
    addItem
  } = useCartStore();

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isSellerModalOpen, setSellerModalOpen] = useState(false);
  
  const topSelling = useMemo(() => getTopSellingProducts(sales, products, 4).map(ts => ts.product), [sales, products]);
  
  useEffect(() => {
    const sellers = db.sellers.getAll();
    if (sellers.length > 0 && !seller) {
      setSeller(sellers[0]);
    }
  }, [seller, setSeller]);

  const filteredProducts = useMemo(() => searchTerm ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))) : [], [products, searchTerm]);
  
  const productsToShow = searchTerm ? filteredProducts : topSelling;

  return (
    <>
      <SelectCustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} onSelect={(c) => setCustomer(c as Customer)} />
      <SelectSellerModal isOpen={isSellerModalOpen} onClose={() => setSellerModalOpen(false)} onSelect={(s) => setSeller(s)} />
      
      {/* O recibo agora lê o 'lastSale' diretamente do estado global */}
      <div id="printable-receipt">
        <Receipt sale={lastSale} />
      </div>

      <div className="h-full flex flex-col gap-6">
        <header className="bg-white p-4 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="w-full flex justify-start items-center gap-4">
                <button onClick={() => setSellerModalOpen(true)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"><UserCheck size={20}/><p className="font-semibold">{seller?.name || 'Selecionar Vendedor'}</p></button>
                <button onClick={() => setCustomerModalOpen(true)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"><User size={20}/><p className="font-semibold">{customer?.name || 'Cliente Avulso'}</p>{customer && <X size={16} onClick={(e) => { e.stopPropagation(); setCustomer(null);}}/>}</button>
            </div>
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input placeholder="Pesquisar produto por nome ou SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12" />
            </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-2 -mr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {productsToShow.map(p => (
              <div key={p.id} className="border bg-white rounded-lg p-4 flex flex-col shadow-sm">
                <div className="bg-gray-100 rounded h-32 flex items-center justify-center mb-4"><Package size={48} className="text-gray-300"/></div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-pink-primary font-bold text-xl mb-2">{p.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <div className="mt-auto space-y-2">
                  {p.variants.map(v => <button key={v.sku} onClick={() => addItem(p, v)} disabled={v.stock <= 0} className="w-full text-left text-sm flex justify-between p-2 rounded hover:bg-pink-light/30 disabled:opacity-50"><span>{v.size}/{v.color}</span><span className={`font-semibold ${v.stock <= 5 && v.stock > 0 ? 'text-orange-500' : ''}`}>{v.stock > 0 ? `${v.stock} un.` : 'Esgotado'}</span></button>)}
                </div>
              </div>
            ))}
             {productsToShow.length === 0 && (
              <div className="col-span-full h-64 flex items-center justify-center text-center text-gray-500">
                <p>{searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto para exibir.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}