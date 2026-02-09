import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { Product, ProductVariant } from '@/types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    category: '',
    imageUrl: '',
    variants: [] as Partial<ProductVariant>[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        basePrice: initialData.basePrice.toString(),
        category: initialData.category || '',
        imageUrl: initialData.imageUrl || '',
        // CRUCIAL: Aqui mantemos o ID da variação vindo do banco
        variants: initialData.variants.map(v => ({
            id: v.id, 
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock
        }))
      });
    } else {
      setFormData(prev => ({
        ...prev,
        variants: [{ sku: '', size: '', color: '', stock: 0 }]
      }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice.replace(',', '.')) || 0,
        variants: formData.variants.map(v => ({
           ...v,
           // Gera SKU se não tiver, mas mantém o ID se existir
           sku: v.sku || `${formData.name.substring(0,3).toUpperCase()}-${v.size}-${v.color}`.replace(/\s+/g, '')
        }))
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      // Nova variação entra sem ID (será um INSERT)
      variants: [...formData.variants, { sku: '', size: '', color: '', stock: 0 }]
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">{initialData ? 'Editar Produto' : 'Novo Produto'}</h2>
        <button onClick={onCancel}><X className="text-gray-500" /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                <input required className="w-full p-2 border rounded-md" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Preço Base (R$)</label>
                    <input required type="number" step="0.01" className="w-full p-2 border rounded-md" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <input className="w-full p-2 border rounded-md" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input className="w-full p-2 border rounded-md" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Variações e Estoque</label>
            <button type="button" onClick={addVariant} className="text-sm text-pink-primary flex items-center gap-1"><Plus size={16} /> Adicionar</button>
          </div>
          <div className="space-y-3">
            {formData.variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <span className="text-xs text-gray-500">Tam</span>
                  <input required className="w-full p-1 border rounded" value={variant.size} onChange={e => updateVariant(index, 'size', e.target.value)} />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-gray-500">Cor</span>
                  <input required className="w-full p-1 border rounded" value={variant.color} onChange={e => updateVariant(index, 'color', e.target.value)} />
                </div>
                <div className="w-24">
                  <span className="text-xs text-gray-500">Estoque</span>
                  <input required type="number" className="w-full p-1 border rounded" value={variant.stock} onChange={e => updateVariant(index, 'stock', parseInt(e.target.value) || 0)} />
                </div>
                <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </form>

      <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
        <button onClick={onCancel} className="px-4 py-2 text-gray-700 bg-white border rounded-lg">Cancelar</button>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-4 py-2 bg-pink-primary text-white rounded-lg flex items-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : 'Salvar Produto'}
        </button>
      </div>
    </div>
  );
}