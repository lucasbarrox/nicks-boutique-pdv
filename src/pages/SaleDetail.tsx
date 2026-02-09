import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { Receipt } from '@/components/sales/Receipt';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function SaleDetail() {
  const { saleId } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
        const all = await db.sales.getAll();
        const found = all.find(s => s.id === saleId);
        if (!found) { navigate('/vendas'); return; }
        setSale(found);
        setIsLoading(false);
    }
    load();
  }, [saleId]);

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (!sale) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-4 flex gap-2 items-center text-gray-500"><ArrowLeft size={20}/> Voltar</button>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h1 className="text-2xl font-bold mb-6 text-center">Detalhes da Venda {sale.displayId}</h1>
            <Receipt sale={sale} />
        </div>
    </div>
  );
}