import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, Loader2, ArrowLeft } from 'lucide-react';
import { useSellers } from '@/hooks/useSellers';
import { useSales } from '@/hooks/useSales';

export function SellerDetail() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  // Busca dados do cache
  const { data: sellers = [], isLoading: isLoadingSellers } = useSellers();
  const { data: allSales = [], isLoading: isLoadingSales } = useSales();

  const isLoading = isLoadingSellers || isLoadingSales;

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-pink-primary" /></div>;

  const seller = sellers.find(s => s.id === sellerId);

  if (!seller) {
      if (!isLoading) navigate('/vendedores');
      return null;
  }

  // Filtra as vendas deste vendedor
  const sales = allSales.filter(s => s.seller_id === sellerId);
  const totalSold = sales.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-pink-primary"><ArrowLeft size={20} /> Voltar</button>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border mb-8 border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <UserCheck size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">{seller.name}</h1>
                <p className="text-gray-500 mt-1">Total Vendido: <span className="font-bold text-green-600">{totalSold.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span></p>
                {seller.pixKey && <p className="text-sm text-gray-400 mt-1">Chave Pix: {seller.pixKey}</p>}
            </div>
        </div>

        <h3 className="font-bold text-lg mb-4 text-gray-700">Vendas Realizadas</h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {sales.map(sale => (
                <div key={sale.id} className="p-4 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                        <span className="font-bold text-gray-800 block">{sale.displayId || sale.display_id}</span>
                        <span className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                        {sale.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
                    </span>
                </div>
            ))}
             {sales.length === 0 && <div className="p-8 text-center text-gray-500">Nenhuma venda registrada para este vendedor.</div>}
        </div>
    </div>
  );
}