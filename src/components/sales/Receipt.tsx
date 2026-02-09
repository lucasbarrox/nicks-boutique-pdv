import { Sale } from '@/types';
import { MapPin, Phone } from 'lucide-react';

interface ReceiptProps {
  sale: Sale | null;
}

export function Receipt({ sale }: ReceiptProps) {
  if (!sale) return null;

  return (
    <div className="bg-white p-8 max-w-md mx-auto text-sm font-mono leading-relaxed text-gray-800 border shadow-sm">
      
      {/* Cabeçalho do Recibo */}
      <div className="text-center border-b-2 border-dashed border-gray-300 pb-6 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">Nick's Boutique</h1>
        <p className="text-gray-500 mb-1">Moda Feminina & Acessórios</p>
        <p className="text-xs text-gray-400">CNPJ: 00.000.000/0001-00</p>
        <div className="mt-4 flex flex-col items-center text-xs text-gray-500">
           <span className="flex items-center gap-1"><MapPin size={12}/> Rua Exemplo, 123 - Centro</span>
           <span className="flex items-center gap-1"><Phone size={12}/> (11) 99999-9999</span>
        </div>
      </div>

      {/* Dados da Venda */}
      <div className="mb-6 space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Data:</span>
          <span className="font-bold">
            {new Date(sale.date).toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Venda Nº:</span>
          <span className="font-bold">{sale.displayId || sale.display_id}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-gray-500">Cliente:</span>
            <span className="font-bold truncate max-w-[200px]">{sale.customerName || 'Cliente Avulso'}</span>
        </div>
        {sale.sellerName && (
            <div className="flex justify-between">
                <span className="text-gray-500">Vendedor:</span>
                <span>{sale.sellerName}</span>
            </div>
        )}
      </div>

      {/* Tabela de Itens */}
      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-left text-xs uppercase">
            <th className="py-2 w-full">Item</th>
            <th className="py-2 px-2 text-right">Qtd</th>
            <th className="py-2 text-right whitespace-nowrap">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sale.items.map((item, index) => (
            <tr key={`${item.sku}-${index}`}>
              <td className="py-2 pr-2 align-top">
                <p className="font-bold">{item.productName}</p>
                <p className="text-xs text-gray-500">{item.size} / {item.color}</p>
              </td>
              <td className="py-2 px-2 text-right align-top">{item.quantity}</td>
              <td className="py-2 text-right align-top font-medium">
                {(item.quantity * item.priceAtSale).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totais */}
      <div className="border-t-2 border-dashed border-gray-300 pt-4 space-y-2">
        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL A PAGAR</span>
          <span>{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
        </div>
        
        <div className="flex justify-between text-sm pt-2">
          <span>Forma de Pagamento:</span>
          <span className="font-medium uppercase">{sale.payment_method || sale.paymentMethod || 'Dinheiro'}</span>
        </div>
      </div>

      {/* Rodapé */}
      <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
        <p>Obrigado pela preferência!</p>
        <p>Trocas somente com etiqueta e este cupom (prazo 7 dias).</p>
        <p className="mt-4 font-mono opacity-50">Sistema: Nick's Boutique SaaS</p>
      </div>
    </div>
  );
}