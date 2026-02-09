import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Seller } from '@/types';

// Schema de Validação
const sellerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  pixKey: z.string().optional().or(z.literal(''))
});

type SellerFormData = z.infer<typeof sellerSchema>;

interface SellerFormProps {
  initialData?: Seller;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function SellerForm({ initialData, onSubmit, onCancel }: SellerFormProps) {
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: '',
      pixKey: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        pixKey: initialData.pixKey || ''
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: SellerFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Vendedor' : 'Novo Vendedor'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Nome do Vendedor</label>
            <input 
              {...register('name')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              placeholder="Ex: João Vendas"
            />
            {errors.name && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.name.message}</span>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Chave PIX (Para comissões)</label>
            <input 
              {...register('pixKey')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              placeholder="CPF, E-mail ou Aleatória"
            />
            <p className="text-xs text-gray-400">Opcional. Usado apenas para facilitar pagamentos.</p>
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
          {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : initialData ? 'Salvar' : 'Cadastrar'}
        </button>
      </div>
    </div>
  );
}