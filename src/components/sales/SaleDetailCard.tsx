import { Sale } from '@/types';
import { db } from '@/lib/db';

const getVariantDetailsBySku = (sku: string) => {
  const allProducts = db.products.getAll();
  for (const product of allProducts) {
    const variant = product.variants.find(v => v.sku === sku);
    if (variant) {
      return { product, variant };
    }
  }
  return { product: null, variant: null };
}

export function SaleDetailCard({ sale }: { sale: Sale }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-6 border-b">
        <div>
          <h3 className="text-gray-500 font-semibold">Cliente</h3>
          <p className="font-bold text-lg">{sale.customerName || 'Cliente Avulso'}</p>
        </div>
        <div>
          <h3 className="text-gray-500 font-semibold">Vendedor(a)</h3>
          <p className="font-bold text-lg">{sale.sellerName || 'Não informado'}</p>
        </div>
        <div>
          <h3 className="text-gray-500 font-semibold">Data da Venda</h3>
          <p className="font-bold text-lg">{new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
        </div>
      </div>
      
      <div>
        <h3 className="font-bold text-xl mb-4">Itens Vendidos</h3>
        <div className="border border-border-neutral rounded-lg">
          <div className="hidden md:grid grid-cols-5 p-4 bg-gray-50 font-semibold">
            <div className="col-span-2">Produto</div>
            <div>Preço Unit.</div>
            <div>Qtd.</div>
            <div className="text-right">Total</div>
          </div>
          {sale.items.map((item, index) => {
            const { product, variant } = getVariantDetailsBySku(item.sku);
            return (
              <div key={index} className="grid grid-cols-5 p-4 border-b last:border-b-0 items-center">
                <div className="col-span-2">
                  <p className="font-semibold">{product?.name || 'Produto não encontrado'}</p>
                  <p className="text-sm text-gray-600">SKU: {item.sku} ({variant?.size} / {variant?.color})</p>
                </div>
                <div className="text-gray-700">{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                <div className="text-gray-700">{item.quantity}</div>
                <div className="text-right font-semibold">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h3 className="font-bold text-xl mb-4">Detalhes do Pagamento</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              {sale.payments && sale.payments.length > 0 ? (
                <>
                  {sale.payments.map((p, index) => (
                      <div key={index} className="flex justify-between">
                          <span className="text-gray-600">{p.method}:</span>
                          <span className="font-semibold">{p.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                  ))}
                  <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Total Pago:</span>
                      <span className="font-semibold">{sale.amountPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  {sale.changeDue > 0 && (
                      <div className="flex justify-between font-bold text-blue-500">
                          <span>Troco:</span>
                          <span>{sale.changeDue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-600">Forma de Pagamento:</span>
                    <span className="font-bold">{(sale as any).paymentMethod}</span>
                </div>
              )}
            </div>
        </div>
        <div className="space-y-2">
            <h3 className="font-bold text-xl mb-4">Resumo Financeiro</h3>
            <div className="flex justify-between text-lg">
                <span>Subtotal</span>
                <span>{sale.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-lg">
                <span>Taxa de Entrega</span>
                <span>{sale.deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold pt-2 border-t text-pink-primary">
                <span>TOTAL DA VENDA</span>
                <span>{sale.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
        </div>
      </div>
    </div>
  )
}