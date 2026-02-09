import { useState, useEffect } from 'react';
import { Search, Loader2, PackageX } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { Cart } from '@/components/cart/Cart';
import { useCartStore } from '@/store/cart';
import { SelectCustomerModal } from '@/components/customers/SelectCustomerModal';
import { SelectSellerModal } from '@/components/sellers/SelectSellerModal';

export function PDV() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  // Store
  const { setCustomer, setSeller, customer, seller } = useCartStore();

  // Carregar produtos ao iniciar
  useEffect(() => {
    async function load() {
      try {
        const data = await db.products.getAll();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filtragem
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-pink-primary">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ÁREA DE PRODUTOS (ESQUERDA) */}
      <div className="flex-1 flex flex-col h-full bg-gray-50">
        
        {/* Barra de Topo */}
        <div className="p-4 bg-white border-b flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white border focus:border-pink-300 rounded-xl transition-all outline-none"
            />
          </div>
          
          {/* Botões rápidos de Cliente/Vendedor */}
          <button 
            onClick={() => setIsCustomerModalOpen(true)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border truncate max-w-[150px] ${customer ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {customer ? customer.name : 'Selecionar Cliente'}
          </button>
          
          <button 
             onClick={() => setIsSellerModalOpen(true)}
             className={`px-4 py-2 rounded-lg text-sm font-bold border truncate max-w-[150px] ${seller ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}
          >
            {seller ? seller.name : 'Vendedor'}
          </button>
        </div>

        {/* Grade de Produtos */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <PackageX size={64} className="mb-4 opacity-50" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA DO CARRINHO (DIREITA) */}
      {/* Aqui é onde o carrinho é chamado! */}
      <Cart />

      {/* Modais de Seleção */}
      <SelectCustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSelect={setCustomer}
      />
      
      <SelectSellerModal 
        isOpen={isSellerModalOpen} 
        onClose={() => setIsSellerModalOpen(false)} 
        onSelect={setSeller}
      />
    </div>
  );
}