import React from 'react';
import { Sale } from '@/types';
import { db } from '@/lib/db';

interface ReceiptProps {
  sale: Sale | null;
  componentRef: React.RefObject<HTMLDivElement>;
}

// Função auxiliar (pode ser movida para um arquivo de utils depois)
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

export function Receipt({ sale, componentRef }: ReceiptProps) {
  if (!sale) return null;

  return (
    // Este componente é escondido por padrão e só é preparado para impressão
    <div ref={componentRef} className="p-4 font-mono text-xs text-black bg-white">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">Nick's Boutique</h1>
        <p>Comprovante de Venda (Não Fiscal)</p>
        <p>--------------------------------</p>
      </div>
      
      <div className="mb-2">
        <p><strong>Venda:</strong> {sale.displayId}</p>
        <p><strong>Data:</strong> {new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
        <p><strong>Vendedor:</strong> {sale.sellerName || 'N/A'}</p>
        <p><strong>Cliente:</strong> {sale.customerName || 'Cliente Avulso'}</p>
      </div>
      
      <p>--------------------------------</p>

      <div className="my-2">
        <div className="grid grid-cols-12 font-bold">
          <div className="col-span-6">Item</div>
          <div className="col-span-2 text-center">Qtd</div>
          <div className="col-span-2 text-right">Preço</div>
          <div className="col-span-2 text-right">Total</div>
        </div>
        {sale.items.map(item => {
          const { product, variant } = getVariantDetailsBySku(item.sku);
          return (
            <div key={item.sku} className="grid grid-cols-12 mt-1">
              <div className="col-span-6">
                <p>{product?.name}</p>
                <p className='text-[10px]'>({variant?.size}/{variant?.color})</p>
              </div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">{item.price.toFixed(2)}</div>
              <div className="col-span-2 text-right">{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <p>--------------------------------</p>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>R$ {sale.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Entrega:</span>
          <span>R$ {sale.deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>R$ {sale.finalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p>--------------------------------</p>

      <div className="mt-2">
        <p><strong>Pagamento:</strong> {sale.paymentMethod}</p>
      </div>

      <div className="text-center mt-4">
        <p>Obrigado pela preferência!</p>
      </div>
    </div>
  );
}