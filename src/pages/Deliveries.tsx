import { useState } from 'react';
import { db } from '@/lib/db';
import { DeliveryFee } from '@/types';
import { toast } from 'sonner';
import { Trash2, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { DeliveryFeeForm } from '@/components/deliveries/DeliveryFeeForm';

export function Deliveries() {
  const [fees, setFees] = useState(() => db.deliveryFees.getAll());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<DeliveryFee | null>(null);

  const refreshFees = () => {
    setFees(db.deliveryFees.getAll());
  };

  const handleOpenModal = (fee: DeliveryFee | null = null) => {
    setEditingFee(fee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
  };

  const handleSaveFee = (data: Omit<DeliveryFee, 'id'>) => {
    if (editingFee) {
      db.deliveryFees.update({ ...data, id: editingFee.id });
      toast.success("Taxa de entrega atualizada com sucesso!");
    } else {
      db.deliveryFees.create(data);
      toast.success("Nova taxa de entrega criada com sucesso!");
    }
    refreshFees();
    handleCloseModal();
  };

  const handleDelete = (fee: DeliveryFee) => {
    if (window.confirm(`Tem certeza que deseja excluir a taxa para o bairro "${fee.neighborhood}"?`)) {
      db.deliveryFees.remove(fee.id);
      refreshFees();
      toast.success("Taxa de entrega excluída com sucesso!");
    }
  };
  
  return (
    <>
      <Modal 
        title={editingFee ? 'Editar Taxa de Entrega' : 'Nova Taxa de Entrega'}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
        <DeliveryFeeForm 
          onSave={handleSaveFee}
          onCancel={handleCloseModal}
          feeToEdit={editingFee}
        />
      </Modal>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Taxas de Entrega</h2>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-pink-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors"
          >
            Nova Taxa
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Bairro</th>
                <th className="p-4 font-semibold">Cidade</th>
                <th className="p-4 font-semibold">Taxa</th>
                <th className="p-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{f.neighborhood}</td>
                  <td className="p-4 text-gray-600">{f.city}</td>
                  <td className="p-4 font-semibold text-pink-primary">
                    {f.fee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenModal(f)} className="text-gray-400 hover:text-pink-primary p-2 rounded-full hover:bg-pink-50" title="Editar Taxa">
                      <Edit size={18}/>
                    </button>
                    <button onClick={() => handleDelete(f)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50" title="Excluir Taxa">
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {fees.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                  <p>Nenhuma taxa de entrega cadastrada.</p>
              </div>
          )}
        </div>
      </div>
    </>
  );
}