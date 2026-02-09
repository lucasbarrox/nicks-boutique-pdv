import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Seller } from '@/types';

interface SellerFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: Seller;
}

export function SellerForm({ onSubmit, onCancel, initialData }: SellerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pixKey: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        pixKey: initialData.pix_key || initialData.pixKey || '',
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        pix_key: formData.pixKey, // Enviar no formato do banco
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome do Vendedor</label>
        <input
          required
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-primary outline-none"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Maria Vendedora"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Chave Pix (Opcional)</label>
        <input
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-pink-primary outline-none"
          value={formData.pixKey}
          onChange={e => setFormData({ ...formData, pixKey: e.target.value })}
          placeholder="CPF, Email ou Telefone"
        />
        <p className="text-xs text-gray-500 mt-1">Usada para calcular comissões futuramente.</p>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          disabled={isSubmitting}
          type="submit"
          className="px-4 py-2 bg-pink-primary text-white rounded-lg hover:bg-pink-600 flex items-center gap-2 transition-colors"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={16} />}
          Salvar Vendedor
        </button>
      </div>
    </form>
  );
}