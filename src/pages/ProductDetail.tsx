import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Product } from '../types';
import { ProductForm } from '../components/products/ProductForm';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (productId) {
      const foundProduct = db.products.getById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        toast.error("Produto não encontrado.");
        navigate('/estoque');
      }
    }
  }, [productId, navigate]);

  const handleUpdateProduct = (productData: Omit<Product, 'id'>, id?: string) => {
    if (!id) return;
    
    const updatedProduct: Product = { ...productData, id };
    db.products.update(updatedProduct);
    toast.success(`Produto "${updatedProduct.name}" atualizado com sucesso!`);
    navigate('/estoque');
  };

  if (!product) {
    return (
        <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">Carregando produto...</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/estoque')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft />
            </button>
            <div>
                <h2 className="text-2xl font-bold">Editar Produto</h2>
                <p className="text-gray-600">{product.name}</p>
            </div>
        </div>
      
      <ProductForm 
        productToEdit={product}
        onSave={handleUpdateProduct}
        onCancel={() => navigate('/estoque')}
      />
    </div>
  );
}