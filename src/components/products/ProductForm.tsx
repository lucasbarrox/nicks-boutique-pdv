import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Product } from '@/types';

// Definição do Schema de Validação
const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  // coerce.number converte string "10" para number 10 automaticamente
  basePrice: z.coerce.number().min(0.01, 'Preço deve ser maior que zero'),
  category: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  variants: z.array(z.object({
    id: z.string().optional(),
    sku: z.string().optional(),
    size: z.string().min(1, 'Tamanho obrigatório'),
    color: z.string().min(1, 'Cor obrigatória'),
    stock: z.coerce.number().min(0, 'Estoque não pode ser negativo')
  })).min(1, 'Adicione pelo menos uma variação')
});

// Inferência do tipo TypeScript a partir do Schema Zod
type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  // Setup do React Hook Form
  const { 
    register, 
    control, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      category: '',
      imageUrl: '',
      variants: [{ size: '', color: '', stock: 0 }]
    }
  });

  // Gerenciador de Array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  // Carrega dados na edição
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || '',
        basePrice: initialData.basePrice,
        category: initialData.category || '',
        imageUrl: initialData.imageUrl || '',
        variants: initialData.variants.map(v => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock
        }))
      });
    }
  }, [initialData, reset]);

  // Função de envio processada
  const onFormSubmit = async (data: ProductFormData) => {
    // Lógica de geração de SKUs simples
    const processedData = {
      ...data,
      variants: data.variants.map(v => ({
        ...v,
        sku: v.sku || `${data.name.substring(0,3).toUpperCase()}-${v.size}-${v.color}`.replace(/\s+/g, '').toUpperCase()
      }))
    };
    
    await onSubmit(processedData);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Produto' : 'Novo Produto'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Dados Principais */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Nome do Produto</label>
            <input 
              {...register('name')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              placeholder="Ex: Camiseta Básica"
            />
            {errors.name && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.name.message}</span>}
          </div>
            
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Preço Base (R$)</label>
              <input 
                type="number" 
                step="0.01"
                {...register('basePrice')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              />
              {errors.basePrice && <span className="text-xs text-red-500">{errors.basePrice.message}</span>}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Categoria</label>
              <input 
                {...register('category')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
                placeholder="Ex: Verão"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">URL da Imagem</label>
            <input 
              {...register('imageUrl')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              placeholder="https://..." 
            />
            {errors.imageUrl && <span className="text-xs text-red-500">{errors.imageUrl.message}</span>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <textarea 
              {...register('description')}
              rows={3} 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
            />
          </div>
        </div>

        {/* Seção de Variações (Dinâmica) */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-700">Variações e Estoque</label>
            <button 
              type="button" 
              onClick={() => append({ size: '', color: '', stock: 0 })} 
              className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Adicionar Variação
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex-1">
                  <span className="text-xs text-gray-500 mb-1 block">Tamanho</span>
                  <input 
                    {...register(`variants.${index}.size`)}
                    placeholder="P, M, G"
                    className="w-full p-1.5 border rounded text-sm" 
                  />
                  {errors.variants?.[index]?.size && <span className="text-[10px] text-red-500">{errors.variants[index]?.size?.message}</span>}
                </div>
                
                <div className="flex-1">
                  <span className="text-xs text-gray-500 mb-1 block">Cor</span>
                  <input 
                    {...register(`variants.${index}.color`)}
                    placeholder="Azul, Vermelho"
                    className="w-full p-1.5 border rounded text-sm" 
                  />
                  {errors.variants?.[index]?.color && <span className="text-[10px] text-red-500">{errors.variants[index]?.color?.message}</span>}
                </div>
                
                <div className="w-24">
                  <span className="text-xs text-gray-500 mb-1 block">Estoque</span>
                  <input 
                    type="number"
                    {...register(`variants.${index}.stock`)}
                    className="w-full p-1.5 border rounded text-sm" 
                  />
                  {errors.variants?.[index]?.stock && <span className="text-[10px] text-red-500">{errors.variants[index]?.stock?.message}</span>}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => remove(index)} 
                  className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  disabled={fields.length === 1} // Impede remover a última
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {errors.variants && <p className="text-xs text-red-500 text-center">{errors.variants.message}</p>}
          </div>
        </div>
      </form>

      <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSubmit(onFormSubmit)} 
          disabled={isSubmitting} 
          className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center gap-2 font-bold disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : initialData ? 'Salvar Alterações' : 'Criar Produto'}
        </button>
      </div>
    </div>
  );
}