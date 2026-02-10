import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, MapPin, DollarSign } from 'lucide-react';
import { DeliveryFee } from '@/types';

// Schema de Validação
const deliveryFeeSchema = z.object({
  neighborhood: z.string().min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  fee: z.coerce.number().min(0, 'A taxa não pode ser negativa')
});

type DeliveryFeeFormData = z.infer<typeof deliveryFeeSchema>;

interface DeliveryFeeFormProps {
  initialData?: DeliveryFee;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function DeliveryFeeForm({ initialData, onSubmit, onCancel }: DeliveryFeeFormProps) {
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(deliveryFeeSchema),
    defaultValues: {
      neighborhood: '',
      fee: 0
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        neighborhood: initialData.neighborhood,
        fee: initialData.fee
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: DeliveryFeeFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Taxa' : 'Nova Taxa de Entrega'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Bairro / Região</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                {...register('neighborhood')}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
                placeholder="Ex: Centro"
              />
            </div>
            {errors.neighborhood && <span className="text-xs text-red-500">{errors.neighborhood.message}</span>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Valor da Taxa (R$)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="number"
                step="0.50"
                {...register('fee')}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
                placeholder="0.00"
              />
            </div>
            {errors.fee && <span className="text-xs text-red-500">{errors.fee.message}</span>}
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