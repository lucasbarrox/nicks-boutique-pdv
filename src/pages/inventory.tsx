import { useState } from 'react';
import { db } from '../lib/db';
import { Product } from '../types';
import { Modal } from '../components/ui/Modal';
import { ProductForm } from '../components/products/ProductForm';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export function Inventory() {
  const [products, setProducts] = useState<Product[]>(() => db.products.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const refreshProducts = () => {
    setProducts(db.products.getAll());
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'>) => {
    db.products.create(productData);
    toast.success(`Produto "${productData.name}" cadastrado com sucesso!`);
    refreshProducts();
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${productName}"? Esta ação não pode ser desfeita.`)) {
      db.products.remove(productId);
      toast.success(`Produto "${productName}" excluído com sucesso!`);
      refreshProducts();
    }
  };

  return (
    <>
      <Modal title="Cadastrar Novo Produto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ProductForm onSave={handleSaveProduct} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gestão de Estoque</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors">Novo Produto</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Produto</th>
                <th className="p-4 font-semibold">Preço</th>
                <th className="p-4 font-semibold">Variações em Estoque</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Link to={`/estoque/${product.id}`} className="font-bold text-text-primary hover:text-pink-primary transition-colors">
                      {product.name}
                    </Link>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{product.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="p-4 text-gray-600">{product.variants.length}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}