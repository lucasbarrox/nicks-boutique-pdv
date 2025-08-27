import React from 'react';
import { Sale } from '@/types';
import { db } from '@/lib/db';

/**
 * @interface ReceiptProps
 * Define as propriedades que o componente Receipt recebe.
 * @param {Sale | null} sale - O objeto da venda a ser exibido no comprovante. Pode ser nulo se nenhuma venda foi finalizada ainda.
 */
interface ReceiptProps {
  sale: Sale | null;
}

/**
 * Função auxiliar para buscar os detalhes completos de um produto e sua variação a partir do SKU.
 * Em um banco de dados real, isso seria um JOIN. Aqui, simulamos essa busca para obter o nome do produto.
 * @param {string} sku - O SKU da variação do produto.
 * @returns Um objeto contendo o produto e a variação encontrados, ou nulo.
 */
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

/**
 * Componente Receipt
 * Responsável por renderizar um comprovante de venda não fiscal.
 * Ele é projetado para ser usado com a funcionalidade de impressão nativa do navegador.
 */
export function Receipt({ sale }: ReceiptProps) {
  // Cláusula de guarda: Se não houver dados de venda, não renderiza nada para evitar erros.
  if (!sale) {
    return null;
  }

  // Busca os dados completos do cliente usando o ID salvo na venda, para podermos exibir detalhes como o telefone.
  const customer = sale.customerId ? db.customers.getById(sale.customerId) : null;

  return (
    <div className="p-4 font-mono text-xs text-black bg-white">
      {/* --- Cabeçalho do Comprovante --- */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">Nick's Boutique</h1>
        <p>Comprovante de Venda</p>
        <p>--------------------------------</p>
      </div>
      
      {/* --- Informações Gerais da Venda --- */}
      <div className="mb-2">
        <p><strong>Venda:</strong> {sale.displayId}</p>
        <p><strong>Data:</strong> {new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
        <p><strong>Vendedor:</strong> {sale.sellerName || 'N/A'}</p>
        <p><strong>Cliente:</strong> {sale.customerName || 'Cliente Avulso'}</p>
        {customer?.phone && <p><strong>Telefone:</strong> {customer.phone}</p>}
      </div>
      
      {/* --- Seção de Entrega (só aparece se houver dados de entrega) --- */}
      {sale.deliveryAddress && (
        <div className="mb-2">
          <p>--------------------------------</p>
          <p className="font-bold">ENTREGA:</p>
          <p>{sale.deliveryAddress.street}, {sale.deliveryAddress.number || 'S/N'}</p>
          <p>{sale.deliveryAddress.neighborhood}, {sale.deliveryAddress.city}</p>
          {sale.deliveryNotes && <p>Obs: {sale.deliveryNotes}</p>}
        </div>
      )}

      <p>--------------------------------</p>

      {/* --- Tabela de Itens Vendidos --- */}
      <div className="my-2">
        <div className="grid grid-cols-12 font-bold">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-center">Qtd</div>
          <div className="col-span-2 text-right">Preço</div>
          <div className="col-span-3 text-right">Total</div>
        </div>
        {sale.items.map(item => {
          const { product, variant } = getVariantDetailsBySku(item.sku);
          return (
            <div key={item.sku} className="grid grid-cols-12 mt-1">
              <div className="col-span-5">
                <p>{product?.name}</p>
                <p className='text-[10px]'>({variant?.size}/{variant?.color})</p>
              </div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">{item.price.toFixed(2)}</div>
              <div className="col-span-3 text-right">{(item.price * item.quantity).toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <p>--------------------------------</p>

      {/* --- Resumo Financeiro --- */}
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
          <span>TOTAL DA VENDA:</span>
          <span>R$ {sale.finalAmount.toFixed(2)}</span>
        </div>
      </div>

      <p>--------------------------------</p>

      {/* --- Detalhes do Pagamento (com lógica de compatibilidade para vendas antigas) --- */}
      <div className="mt-2">
        <p className="font-bold">PAGAMENTO:</p>
        {/* Verifica se a venda usa a nova estrutura de múltiplos pagamentos */}
        {sale.payments && sale.payments.length > 0 ? (
          <>
            {sale.payments.map((p, index) => (
                <div key={index} className="flex justify-between">
                    <span>{p.method}:</span>
                    <span>R$ {p.amount.toFixed(2)}</span>
                </div>
            ))}
            <div className="flex justify-between mt-1">
                <span>Total Pago:</span>
                <span>R$ {sale.amountPaid.toFixed(2)}</span>
            </div>
            {sale.changeDue > 0 && (
                <div className="flex justify-between font-bold">
                    <span>TROCO:</span>
                    <span>R$ {sale.changeDue.toFixed(2)}</span>
                </div>
            )}
          </>
        ) : (
          // Fallback: Se for uma venda antiga, mostra o método de pagamento único.
          <div className="flex justify-between">
            <span>Método:</span>
            {/* Usamos 'as any' para o TypeScript não reclamar do campo antigo 'paymentMethod' */}
            <span>{(sale as any).paymentMethod}</span>
          </div>
        )}
      </div>

      {/* --- Rodapé --- */}
      <div className="text-center mt-4">
        <p>Obrigada princesa, até a próxima compra.</p>
      </div>
    </div>
  );
}