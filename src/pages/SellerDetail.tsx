import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Seller } from '@/types';
import { SellerForm } from '@/components/sellers/SellerForm';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export function SellerDetail() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<Seller | null>(null);

  const isNew = sellerId === 'novo';

  useEffect(() => {
    if (sellerId && !isNew) {
      const foundSeller = db.sellers.getById(sellerId);
      if (foundSeller) {
        setSeller(foundSeller);
      } else {
        toast.error("Vendedor não encontrado.");
        navigate('/vendedores');
      }
    }
  }, [sellerId, isNew, navigate]);

  const handleSave = (data: Omit<Seller, 'id'>) => {
    if (isNew) {
      db.sellers.create(data);
      toast.success("Vendedor criado com sucesso!");
    } else if (sellerId) {
      db.sellers.update({ ...data, id: sellerId });
      toast.success("Vendedor atualizado com sucesso!");
    }
    navigate('/vendedores');
  };

  if (!isNew && !seller) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/vendedores')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft />
        </button>
        <div>
            <h2 className="text-2xl font-bold">{isNew ? 'Novo Vendedor' : 'Editar Vendedor'}</h2>
            {!isNew && <p className="text-gray-600">{seller?.name}</p>}
        </div>
      </div>
      <SellerForm 
        sellerToEdit={isNew ? undefined : seller} 
        onSave={handleSave} 
        onCancel={() => navigate('/vendedores')} 
      />
    </div>
  );
}