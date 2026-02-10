import { useState } from 'react';
import { Plus, Search, MapPin, Trash2, Loader2, Pencil } from 'lucide-react';
import { DeliveryFee } from '@/types';
import { DeliveryFeeForm } from '@/components/deliveries/DeliveryFeeForm';
import { Modal } from '@/components/ui/Modal';
import { useDeliveryFees, useCreateDeliveryFee, useDeleteDeliveryFee } from '@/hooks/useDeliveryFees'; // Hooks

export function Deliveries() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | undefined>(undefined);

  // React Query
  const { data: fees = [], isLoading } = useDeliveryFees();
  const createMutation = useCreateDeliveryFee();
  const deleteMutation = useDeleteDeliveryFee();

  const filteredFees = fees.filter(f => 
    f.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
    setEditingFee(undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta taxa?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const openNewModal = () => {
    setEditingFee(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (fee: DeliveryFee) => {
    setEditingFee(fee);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-pink-primary gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-medium text-gray-500">Carregando taxas...</p>
        </div>
      );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Taxas de Entrega</h1>
          <p className="text-gray-500">Gerencie os valores por bairro/região</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-pink-primary text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={20} />
          Nova Taxa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="p-4">Bairro / Região</th>
                <th className="p-4">Taxa de Entrega</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-pink-400" />
                    {fee.neighborhood}
                  </td>
                  <td className="p-4 text-gray-600 font-medium">
                    {fee.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Botão de Editar Adicionado */}
                      <button 
                        onClick={() => openEditModal(fee)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>

                      <button 
                        onClick={() => handleDelete(fee.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFees.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-500">
                    Nenhuma taxa cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFee ? "Editar Taxa" : "Nova Taxa"}
      >
        <DeliveryFeeForm 
          initialData={editingFee}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}