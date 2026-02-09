import { useState, useMemo } from 'react';
import { Plus, Search, UserCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SellerForm } from '@/components/sellers/SellerForm';
import { Modal } from '@/components/ui/Modal';
import { useSellers, useCreateSeller } from '@/hooks/useSellers'; // Hooks

export function Sellers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Query
  const { data: sellers = [], isLoading } = useSellers();
  const createMutation = useCreateSeller();

  const filteredSellers = useMemo(() => 
    sellers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [sellers, searchTerm]);

  const handleCreateSeller = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-pink-primary gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-medium text-gray-500">Carregando vendedores...</p>
        </div>
      );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendedores</h1>
          <p className="text-gray-500">Gerencie sua equipe de vendas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-pink-primary text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <Plus size={20} />
          Novo Vendedor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
                type="text"
                placeholder="Buscar vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-primary/20"
            />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredSellers.map((seller) => (
            <Link 
              key={seller.id} 
              to={`/vendedores/${seller.id}`}
              className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow hover:border-blue-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{seller.name}</h3>
                  {seller.pixKey && (
                    <p className="text-xs text-gray-500 mt-1">Pix: {seller.pixKey}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {filteredSellers.length === 0 && (
             <div className="col-span-full p-8 text-center text-gray-500">
                Nenhum vendedor encontrado.
             </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Vendedor"
      >
        <SellerForm 
          onSubmit={handleCreateSeller}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}