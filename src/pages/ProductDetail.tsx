import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { Package, ArrowLeft, Loader2 } from 'lucide-react';

export function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
        const all = await db.products.getAll();
        const found = all.find(p => p.id === productId);
        if (!found) { navigate('/estoque'); return; }
        setProduct(found);
        setIsLoading(false);
    }
    load();
  }, [productId]);

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!product) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
       <button onClick={() => navigate(-1)} className="mb-4 flex gap-2 items-center text-gray-500"><ArrowLeft size={20}/> Voltar</button>
       <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="flex gap-6">
                <div className="bg-gray-100 p-8 rounded-lg"><Package size={64} className="text-gray-300"/></div>
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-2xl text-pink-primary font-bold mt-2">{Number(product.basePrice).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                    <p className="mt-4 text-gray-600">{product.description || 'Sem descrição.'}</p>
                </div>
            </div>
            
            <h3 className="mt-8 font-bold text-lg mb-4">Variações em Estoque</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.variants.map(v => (
                    <div key={v.sku} className="p-4 border rounded-lg text-center">
                        <p className="font-bold">{v.size} / {v.color}</p>
                        <p className={`${v.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{v.stock} un.</p>
                    </div>
                ))}
            </div>
       </div>
    </div>
  );
}