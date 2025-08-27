import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { ArrowLeft, Printer, RefreshCw } from 'lucide-react';
import { SaleDetailCard } from '@/components/sales/SaleDetailCard';
import { toast } from 'sonner';
import { Receipt } from '@/components/sales/Receipt';

export function SaleDetail() {
  const { saleId } = useParams<{ saleId: string }>();
  const navigate = useNavigate();
  const [sale, setSale] = useState<Sale | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (saleId) {
      const foundSale = db.sales.getById(saleId);
      if (foundSale) {
        setSale(foundSale);
      } else {
        toast.error("Venda não encontrada.");
        navigate('/vendas');
      }
    }
  }, [saleId, navigate]);

  const handleCancelSale = () => {
    if (!sale) return;

    if (window.confirm(`Deseja cancelar a venda ${sale.displayId}? Os produtos serão retornados ao estoque.`)) {
      sale.items.forEach(item => {
        const products = db.products.getAll();
        const productIndex = products.findIndex(p => p.variants.some(v => v.sku === item.sku));
        if (productIndex > -1) {
          const variantIndex = products[productIndex].variants.findIndex(v => v.sku === item.sku);
          if (variantIndex > -1) {
            products[productIndex].variants[variantIndex].stock += item.quantity;
            db.products.setAll(products);
          }
        }
      });
      
      const updatedSale: Sale = { ...sale, status: 'Cancelada' };
      db.sales.update(updatedSale);
      setSale(updatedSale);
      toast.success("Venda cancelada e estoque estornado!");
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (!sale) {
    return (
      <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">Carregando venda...</p>
      </div>
    );
  }

  return (
    <div>
      <div id="printable-receipt">
        <Receipt sale={sale} />
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/vendas')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft />
          </button>
          <div>
              <h2 className="text-2xl font-bold">Detalhes da Venda</h2>
              <p className="text-gray-500 font-mono">ID: {sale.displayId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sale.status === 'Concluída' && (
            <button 
              onClick={handleCancelSale}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              <RefreshCw size={16} />
              Cancelar / Estornar
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-pink-primary text-white rounded-lg font-semibold hover:bg-pink-primary/90 transition-colors"
          >
            <Printer size={16} />
            Imprimir Comprovante
          </button>
        </div>
      </div>
      <SaleDetailCard sale={sale} />
    </div>
  );
}