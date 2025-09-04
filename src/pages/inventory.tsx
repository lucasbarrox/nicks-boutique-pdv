import { useState, useMemo } from 'react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/products/ProductForm';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Trash2, Edit, Search } from 'lucide-react';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="w-full p-3 border rounded-lg" />;

export function Inventory() {
  const [products, setProducts] = useState<Product[]>(() => db.products.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // NOVO: Estado para controlar o termo da busca
  const [searchTerm, setSearchTerm] = useState('');

  const refreshProducts = () => {
    setProducts(db.products.getAll());
  };

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>, id?: string) => {
    if (id) {
      db.products.update({ ...productData, id });
      toast.success(`Produto "${productData.name}" atualizado!`);
    } else {
      db.products.create(productData);
      toast.success(`Produto "${productData.name}" cadastrado!`);
    }
    refreshProducts();
    handleCloseModal();
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Excluir o produto "${productName}"?`)) {
      db.products.remove(productId);
      toast.success(`Produto "${productName}" excluído!`);
      refreshProducts();
    }
  };
  
  // NOVO: Lógica de filtro que busca no nome do produto e nos SKUs das variantes
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercasedTerm) ||
      product.variants.some(variant => variant.sku.toLowerCase().includes(lowercasedTerm))
    );
  }, [products, searchTerm]);

  return (
    <>
      <Modal 
        title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
        <ProductForm 
          onSave={handleSaveProduct}
          onCancel={handleCloseModal}
          productToEdit={editingProduct}
        />
      </Modal>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold"
          >
            Novo Produto
          </button>
        </div>

        {/* NOVA BARRA DE PESQUISA */}
        <div className="relative mb-6">
          <Input 
            placeholder="Buscar por nome ou SKU..." 
            className="pl-12 bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Produto</th>
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Variação</th>
                <th className="p-4 font-semibold">Preço</th>
                <th className="p-4 font-semibold">Estoque</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* A lista agora usa os produtos filtrados */}
              {filteredProducts.flatMap(product =>
                product.variants.map((variant, index) => (
                  <tr key={variant.sku} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">
                      {/* Mostra o nome apenas na primeira linha da variante */}
                      {index === 0 ? product.name : ''}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{variant.sku}</td>
                    <td className="p-4">{variant.size} / {variant.color}</td>
                    <td className="p-4 font-semibold text-pink-primary">
                      {product.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${variant.stock === 0 ? 'bg-red-100 text-red-700' : ''}
                        ${variant.stock > 0 && variant.stock <= 5 ? 'bg-orange-100 text-orange-700' : ''}
                        ${variant.stock > 5 ? 'bg-green-100 text-green-700' : ''}
                      `}>
                        {variant.stock} Unidades
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {index === 0 && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleOpenModal(product)} className="text-gray-400 hover:text-pink-primary p-2 rounded-full hover:bg-pink-50" title="Editar Produto">
                            <Edit size={18}/>
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" title="Excluir Produto">
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
           {filteredProducts.length === 0 && (
            <div className="text-center py-16 text-gray-500">
                <p>{searchTerm ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}