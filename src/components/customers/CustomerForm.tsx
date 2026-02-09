import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Customer } from '@/types';

// Schema de Validação
const customerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(10, 'Telefone inválido (mínimo 10 dígitos)').optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  // Gerenciamento de endereços
  addresses: z.array(z.object({
    street: z.string().min(1, 'Rua é obrigatória'),
    number: z.string().optional(),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().max(2, 'UF inválida').optional(),
    zip: z.string().optional()
  })).optional()
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function CustomerForm({ initialData, onSubmit, onCancel }: CustomerFormProps) {
  const { 
    register, 
    control, 
    handleSubmit, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      addresses: [] 
    }
  });

  // Array dinâmico de endereços
  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses"
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        phone: initialData.phone || '',
        email: initialData.email || '',
        addresses: initialData.addresses || []
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Dados Pessoais */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-700">Nome Completo</label>
            <input 
              {...register('name')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
              placeholder="Ex: Maria Silva"
            />
            {errors.name && <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12}/> {errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
              <input 
                {...register('phone')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
                placeholder="(00) 00000-0000"
              />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-700">E-mail (Opcional)</label>
              <input 
                {...register('email')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-100 outline-none" 
                placeholder="cliente@email.com"
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>
          </div>
        </div>

        {/* Endereços (Opcional e Dinâmico) */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <MapPin size={16} /> Endereços
            </label>
            <button 
              type="button" 
              onClick={() => append({ street: '', city: '', number: '' })} 
              className="text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Adicionar
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 relative group">
                <button 
                  type="button" 
                  onClick={() => remove(index)} 
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
                  title="Remover endereço"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid gap-3">
                  <div className="grid grid-cols-[1fr_80px] gap-2">
                    <div>
                      <input 
                        {...register(`addresses.${index}.street`)}
                        placeholder="Rua / Avenida"
                        className="w-full p-1.5 border rounded text-sm" 
                      />
                       {errors.addresses?.[index]?.street && <span className="text-[10px] text-red-500">Rua obrigatória</span>}
                    </div>
                    <div>
                      <input 
                        {...register(`addresses.${index}.number`)}
                        placeholder="Nº"
                        className="w-full p-1.5 border rounded text-sm" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      {...register(`addresses.${index}.city`)}
                      placeholder="Cidade"
                      className="w-full p-1.5 border rounded text-sm" 
                    />
                    <input 
                      {...register(`addresses.${index}.state`)}
                      placeholder="UF"
                      maxLength={2}
                      className="w-full p-1.5 border rounded text-sm uppercase" 
                    />
                  </div>
                </div>
              </div>
            ))}
            {fields.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum endereço cadastrado.</p>}
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