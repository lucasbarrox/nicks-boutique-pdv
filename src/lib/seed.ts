import { db } from './db';
import { Product, Customer, DeliveryFee, Seller } from '@/types';

const seedProducts: Product[] = [
  {
    id: "prod_1", name: "Vestido Floral Elegance", description: "Vestido de verão com estampa floral, tecido leve.", basePrice: 299.90, costPrice: 150.00,
    variants: [
      { sku: "VF-AZ-P", color: "Azul", size: "P", stock: 5 }, { sku: "VF-AZ-M", color: "Azul", size: "M", stock: 8 },
      { sku: "VF-AZ-G", color: "Azul", size: "G", stock: 3 }, { sku: "VF-VM-M", color: "Vermelho", size: "M", stock: 6 },
    ]
  },
  {
    id: "prod_2", name: "Blusa Manga Longa Seda", description: "Blusa de seda com toque macio.", basePrice: 149.90, costPrice: 70.00,
    variants: [
      { sku: "BL-BR-P", color: "Branco", size: "P", stock: 10 }, { sku: "BL-BR-M", color: "Branco", size: "M", stock: 12 },
      { sku: "BL-PR-M", color: "Preto", size: "M", stock: 7 },
    ]
  },
  {
    id: "prod_3", name: "Saia Evasê", description: "Saia moderna com corte evasê.", basePrice: 189.90, costPrice: 90.00,
    variants: [
        { sku: "SA-PT-36", color: "Preto", size: "36", stock: 8 }, { sku: "SA-PT-38", color: "Preto", size: "38", stock: 9 },
        { sku: "SA-PT-40", color: "Preto", size: "40", stock: 2 },
    ]
  }
];

const seedCustomers: Customer[] = [
    { 
      id: 'cust_1', name: 'Ana Silva', phone: '11999998888', email: 'ana.silva@example.com',
      addresses: [
        { id: 'addr_1', street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'Maracanaú', state: 'CE' }
      ] 
    },
    { 
      id: 'cust_2', name: 'Beatriz Costa', phone: '21988887777', email: 'beatriz.costa@example.com',
      addresses: []
    },
];

const seedDeliveryFees: DeliveryFee[] = [
  { id: 'fee_1', neighborhood: 'Centro', city: 'Maracanaú', fee: 10.00 },
  { id: 'fee_2', neighborhood: 'Jereissati I', city: 'Maracanaú', fee: 12.00 },
  { id: 'fee_3', neighborhood: 'Pajuçara', city: 'Maracanaú', fee: 15.00 },
];

const seedSellers: Seller[] = [
  { id: 'seller_1', name: 'Ana (Admin)', phone: '85911112222', address: { id: 'addr_seller_1', street: 'Rua Principal, 1', city: 'Fortaleza', neighborhood: 'Centro', state: 'CE'} },
  { id: 'seller_2', name: 'Beatriz Silva', phone: '85933334444' },
];

export function initializeDb() {
  if (localStorage.getItem('nicks_boutique_products') === null) db.products.setAll(seedProducts);
  if (localStorage.getItem('nicks_boutique_customers') === null) db.customers.setAll(seedCustomers);
  if (localStorage.getItem('nicks_boutique_sales') === null) db.sales.setAll([]);
  if (localStorage.getItem('nicks_boutique_delivery_fees') === null) db.deliveryFees.setAll(seedDeliveryFees);
  if (localStorage.getItem('nicks_boutique_sellers') === null) db.sellers.setAll(seedSellers);
  if (localStorage.getItem('nicks_boutique_sale_counter') === null) localStorage.setItem('nicks_boutique_sale_counter', '0');
}