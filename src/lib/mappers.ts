import { Product, Sale, Customer, Seller, DeliveryFee, ProductVariant } from "@/types";
import { DbProduct, DbProductVariant, DbSale, DbCustomer, DbSeller, DbDeliveryFee } from "@/types/database";

export const Mappers = {
  // Traduz Produto do Banco -> Frontend
  product: (dbProduct: DbProduct, dbVariants: DbProductVariant[] = []): Product => ({
    id: dbProduct.id,
    store_id: dbProduct.store_id,
    name: dbProduct.name,
    description: dbProduct.description || undefined,
    category: dbProduct.category || undefined,
    basePrice: dbProduct.base_price, // Tradução snake -> camel
    imageUrl: dbProduct.image_url || undefined,
    active: dbProduct.active,
    variants: dbVariants.map(v => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      product_id: v.product_id
    }))
  }),

  // Traduz Venda
  sale: (dbSale: DbSale): Sale => ({
    id: dbSale.id,
    store_id: dbSale.store_id,
    displayId: dbSale.display_id,
    customer_id: dbSale.customer_id || undefined,
    customerName: dbSale.customer_name || undefined,
    seller_id: dbSale.seller_id || undefined,
    sellerName: dbSale.seller_name || undefined,
    total: dbSale.total,
    status: dbSale.status,
    paymentMethod: dbSale.payment_method,
    items: dbSale.items, 
    date: dbSale.date,
    created_at: dbSale.created_at
  }),

  // Traduz Cliente
  customer: (dbCustomer: DbCustomer): Customer => ({
    id: dbCustomer.id,
    store_id: dbCustomer.store_id,
    name: dbCustomer.name,
    email: dbCustomer.email || undefined,
    phone: dbCustomer.phone || undefined,
    addresses: dbCustomer.addresses || [],
    created_at: dbCustomer.created_at
  }),

  // Traduz Vendedor
  seller: (dbSeller: DbSeller): Seller => ({
    id: dbSeller.id,
    store_id: dbSeller.store_id,
    name: dbSeller.name,
    pixKey: dbSeller.pix_key || undefined
  }),

  // Traduz Taxa de Entrega
  deliveryFee: (dbFee: DbDeliveryFee): DeliveryFee => ({
    id: dbFee.id,
    neighborhood: dbFee.neighborhood,
    fee: dbFee.fee
  })
};