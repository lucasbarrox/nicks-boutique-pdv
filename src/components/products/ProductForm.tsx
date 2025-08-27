import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface ProductFormProps {
  onSave: (product: Omit<Product, 'id'>, id?: string) => void;
  onCancel: () => void;
  productToEdit?: Product | null;
}

type VariantState = Omit<ProductVariant, 'sku'> & { sku?: string };

export function ProductForm({ onSave, onCancel, productToEdit }: ProductFormProps) {
  const [name, setName] = useState('');
  const [basePrice, setBasePrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [variants, setVariants] = useState<VariantState[]>([{ color: '', size: '', stock: 0 }]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBasePrice(productToEdit.basePrice);
      setCostPrice(productToEdit.costPrice);
      setVariants(productToEdit.variants);
    }
  }, [productToEdit]);

  const handleVariantChange = (index: number, field: keyof VariantState, value: string | number) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { color: '', size: '', stock: 0 }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name, description: '', basePrice, costPrice,
      variants: variants.map(v => ({
        ...v,
        stock: Number(v.stock), // Garante que o estoque é um número
        sku: v.sku || `${name.substring(0, 2).toUpperCase()}-${v.color.substring(0, 2).toUpperCase()}-${v.size}-${Math.floor(Math.random() * 1000)}`
      }))
    };
    onSave(productData, productToEdit?.id);
  };

  const isEditing = !!productToEdit;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Nome do Produto</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preço de Venda (R$)</label>
          <input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Preço de Custo (R$)</label>
          <input type="number" step="0.01" value={costPrice} onChange={(e) => setCostPrice(parseFloat(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-bold text-lg mb-2">Variações (Cor, Tamanho, Estoque)</h4>
        {variants.map((variant, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 mb-2 p-2 border rounded-lg items-center">
            <input type="text" placeholder="Cor" value={variant.color} onChange={(e) => handleVariantChange(index, 'color', e.target.value)} className="col-span-4 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            <input type="text" placeholder="Tamanho" value={variant.size} onChange={(e) => handleVariantChange(index, 'size', e.target.value)} className="col-span-4 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            <input type="number" placeholder="Estoque" value={variant.stock} onChange={(e) => handleVariantChange(index, 'stock', parseInt(e.target.value, 10))} className="col-span-3 p-2 border rounded-lg focus:ring-2 focus:ring-pink-primary outline-none" required />
            {variants.length > 1 && <button type="button" onClick={() => removeVariant(index)} className="col-span-1 text-red-500 hover:bg-red-100 rounded-full p-2"><Trash2 size={18}/></button>}
          </div>
        ))}
        <button type="button" onClick={addVariant} className="flex items-center gap-2 text-sm font-semibold text-pink-primary mt-2 hover:underline">
          <Plus size={16}/> Adicionar Variação
        </button>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t mt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-6 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90">
          {isEditing ? 'Salvar Alterações' : 'Salvar Produto'}
        </button>
      </div>
    </form>
  );
}