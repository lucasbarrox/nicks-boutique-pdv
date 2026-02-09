import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  
  // Seleciona a primeira variante disponível por padrão
  const defaultVariant = product.variants.find(v => v.stock > 0);
  const [selectedSku, setSelectedSku] = useState<string>(defaultVariant?.sku || '');

  const currentVariant = product.variants.find(v => v.sku === selectedSku);
  const hasStock = currentVariant && currentVariant.stock > 0;
  const isOutOfStock = product.variants.every(v => v.stock === 0);

  const handleAdd = () => {
    if (!currentVariant) {
      toast.error('Selecione um tamanho/cor');
      return;
    }
    if (!hasStock) {
      toast.error('Produto sem estoque!');
      return;
    }

    addItem(product, currentVariant);
    toast.success(`${product.name} adicionado!`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      {/* Imagem */}
      <div className="h-48 bg-gray-100 relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl bg-gray-50">
            {product.name.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Badge de Preço */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full font-bold text-gray-800 shadow-sm text-sm">
          {product.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.description || 'Sem descrição'}</p>

        <div className="mt-auto space-y-3">
          {/* Seletor de Variantes */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Tamanho / Cor</label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.sku}
                  onClick={() => setSelectedSku(variant.sku)}
                  disabled={variant.stock === 0}
                  className={`px-2 py-1 text-xs rounded border transition-all ${
                    selectedSku === variant.sku
                      ? 'bg-pink-primary text-white border-pink-primary'
                      : variant.stock === 0
                      ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'
                  }`}
                >
                  {variant.size} - {variant.color}
                </button>
              ))}
            </div>
          </div>

          {/* Botão de Ação */}
          <button
            onClick={handleAdd}
            disabled={!hasStock && !isOutOfStock}
            className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle size={16} /> Sem Estoque
              </>
            ) : (
              <>
                <Plus size={16} /> Adicionar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}