import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CustomerFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export function CustomerForm({ onSubmit, onCancel, initialData }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    street: initialData?.addresses?.[0]?.street || '',
    city: initialData?.addresses?.[0]?.city || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        addresses: formData.street ? [{
          street: formData.street,
          city: formData.city
        }] : []
      };
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
        <input required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Telefone</label>
           <input className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Email</label>
           <input type="email" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
      </div>

      <div className="pt-2 border-t mt-2">
         <p className="text-sm font-bold text-gray-500 mb-2">Endereço Principal</p>
         <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
               <label className="block text-xs text-gray-500">Rua</label>
               <input className="w-full p-2 border rounded" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs text-gray-500">Cidade</label>
               <input className="w-full p-2 border rounded" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
         </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600">Cancelar</button>
        <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-pink-primary text-white rounded flex items-center gap-2">
           {isSubmitting && <Loader2 className="animate-spin" size={16} />} Salvar
        </button>
      </div>
    </form>
  );
}