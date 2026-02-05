import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { Customer, Sale } from '@/types';
import { User, Phone, MapPin, Loader2, ArrowLeft } from 'lucide-react';

export function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!customerId) return;
      try {
        const [allCustomers, allSales] = await Promise.all([
           db.customers.getAll(),
           db.sales.getAll()
        ]);
        
        const found = allCustomers.find(c => c.id === customerId);
        if (!found) {
            navigate('/clientes'); 
            return;
        }

        setCustomer(found);
        
        // CORREÇÃO AQUI: Usamos 'customer_id' para filtrar
        setHistory(allSales.filter(s => s.customer_id === customerId));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [customerId, navigate]);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-pink-primary" /></div>;
  if (!customer) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-pink-primary"><ArrowLeft size={20} /> Voltar</button>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600">
            <User size={40} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{customer.name}</h1>
            <div className="flex gap-4 mt-2 text-gray-600">
                <span className="flex items-center gap-1"><Phone size={16}/> {customer.phone || 'Sem telefone'}</span>
                <span className="flex items-center gap-1"><MapPin size={16}/> {customer.addresses?.length || 0} locais salvos</span>
            </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Histórico de Compras</h2>
      <div className="space-y-4">
        {history.map(sale => (
            <div key={sale.id} className="bg-white p-4 rounded-lg border flex justify-between items-center">
                <div>
                    <p className="font-bold">{sale.displayId || sale.display_id}</p>
                    <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-green-600">{sale.total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
            </div>
        ))}
        {history.length === 0 && <p className="text-gray-500">Nenhuma compra realizada ainda.</p>}
      </div>
    </div>
  );
}