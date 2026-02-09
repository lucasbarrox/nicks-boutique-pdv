import { useState, useEffect } from 'react';
import { Plus, UserCheck, Loader2 } from 'lucide-react';
import { db } from '@/lib/db';
import { Seller } from '@/types';
import { SellerForm } from '@/components/sellers/SellerForm';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function load() {
    try {
        const data = await db.sellers.getAll();
        setSellers(data);
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => { load() }, []);

  const handleCreate = async (data: any) => {
    await db.sellers.create(data);
    setIsModalOpen(false);
    load();
    toast.success('Vendedor adicionado');
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Vendedores</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-pink-primary text-white px-4 py-2 rounded-lg flex gap-2 items-center">
            <Plus size={20} /> Novo Vendedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sellers.map(s => (
            <Link key={s.id} to={`/vendedores/${s.id}`} className="bg-white p-6 rounded-xl shadow-sm border hover:border-pink-300 block">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600"><UserCheck /></div>
                    <div>
                        <h3 className="font-bold">{s.name}</h3>
                        <p className="text-sm text-gray-500">Chave Pix: {s.pixKey || '-'}</p>
                    </div>
                </div>
            </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">Novo Vendedor</h2>
                <SellerForm onSubmit={handleCreate} onCancel={() => setIsModalOpen(false)} />
            </div>
        </div>
      )}
    </div>
  );
}