import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Package, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { ProductForm } from '@/components/products/ProductForm';
import { toast } from 'sonner';

export function Inventory() {
  
  // 1. Estados iniciam vazios ou carregando
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controle do Modal de criar/editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  // 2. Buscar dados na nuvem ao abrir a página
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setIsLoading(true);
      const data = await db.products.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar produtos.");
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Filtro de busca (Local, já que baixamos a lista)
  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.variants.some(v => v.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    ), 
  [products, searchTerm]);

  // 4. Função para Salvar (Criar ou Editar)
  const handleSaveProduct = async (productData: any) => {
    try {
      // Se tiver ID, é edição. Se não, é criação.
      if (editingProduct) {
        await db.products.update({ ...productData, id: editingProduct.id });
        toast.success('Produto atualizado com sucesso!');
      } else {
        await db.products.create(productData);
        toast.success('Produto criado com sucesso!');
      }
      
      // Fecha o modal e recarrega a lista da nuvem
      setIsModalOpen(false);
      setEditingProduct(undefined);
      await loadProducts();
      
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar produto.');
    }
  };

  // 5. Função para Deletar
  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await db.products.remove(id);
        toast.success('Produto removido.');
        await loadProducts();
      } catch (error) {
        console.error(error);
        toast.error('Erro ao remover produto.');
      }
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  // Renderização da tela
  if (isLoading) {
     return (
      <div className="h-full flex flex-col items-center justify-center text-pink-primary gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="font-medium text-gray-500">Carregando estoque...</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
            <p className="text-gray-500">Gerencie seus produtos e variações</p>
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 bg-pink-primary text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Plus size={20} />
            Novo Produto
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Preço Base</th>
                  <th className="p-4">Total em Estoque</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                             <Package size={20} />
                          </div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{product.category || '-'}</td>
                      <td className="p-4 font-medium text-gray-900">
                        {Number(product.basePrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${totalStock > 10 ? 'bg-green-100 text-green-800' : 
                            totalStock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {totalStock} unidades
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEditModal(product)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                 {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">Nenhum produto encontrado</p>
                        <p className="text-sm">Cadastre novos produtos para começar.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <ProductForm 
               onSubmit={handleSaveProduct} 
               initialData={editingProduct}
               onCancel={() => setIsModalOpen(false)}
             />
          </div>
        </div>
      )}
    </>
  );
}