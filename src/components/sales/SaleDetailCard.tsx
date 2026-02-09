import { Sale } from '@/types';
import { Package, User, Calendar, CreditCard, Tag } from 'lucide-react';

interface SaleDetailCardProps {
  sale: Sale;
}

export function SaleDetailCard({ sale }: SaleDetailCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cabeçalho do Cartão */}
      <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-full">
              {sale.status}
            </span>
            <span className="text-sm text-gray-400">#{sale.displayId || sale.display_id}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h2>
        </div>
        
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-pink-primary" />
            <span>{new Date(sale.date).toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-pink-primary" />
            <span>{sale.customerName || 'Cliente Avulso'}</span>
          </div>
          {sale.sellerName && (
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-pink-primary" />
              <span>Vendedor: {sale.sellerName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Itens */}
      <div className="p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Package size={20} className="text-gray-400" />
          Itens Comprados
        </h3>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="p-3">Produto</th>
                <th className="p-3">Tamanho/Cor</th>
                <th className="p-3 text-center">Qtd</th>
                <th className="p-3 text-right">Preço Unit.</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.items.map((item, index) => (
                <tr key={`${item.sku}-${index}`}>
                  <td className="p-3 font-medium text-gray-900">{item.productName}</td>
                  <td className="p-3 text-gray-600">{item.size} / {item.color}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">
                    {item.priceAtSale.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900">
                    {(item.priceAtSale * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rodapé com Pagamento */}
      <div className="bg-gray-50 p-6 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2 font-bold text-gray-700">
          <CreditCard size={20} />
          Detalhes do Pagamento
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Método:</span>
          <span className="font-medium uppercase bg-white border px-3 py-1 rounded">
            {sale.payment_method || sale.paymentMethod || 'Dinheiro'}
          </span>
        </div>
      </div>
    </div>
  );
}