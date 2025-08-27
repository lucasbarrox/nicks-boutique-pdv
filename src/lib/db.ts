import { Product, Sale, Customer, DeliveryFee, Seller } from "@/types";

const DB_KEYS = {
  PRODUCTS: 'nicks_boutique_products',
  SALES: 'nicks_boutique_sales',
  CUSTOMERS: 'nicks_boutique_customers',
  DELIVERY_FEES: 'nicks_boutique_delivery_fees',
  SELLERS: 'nicks_boutique_sellers',
  SALE_COUNTER: 'nicks_boutique_sale_counter',
};

function getTable<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return [];
  }
}

function setTable<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
}

// Função auxiliar para ajustar o estoque de um item específico
const adjustStock = (sku: string, quantity: number) => {
  const products = db.products.getAll();
  const productIndex = products.findIndex(p => p.variants.some(v => v.sku === sku));
  if (productIndex === -1) return;

  const variantIndex = products[productIndex].variants.findIndex(v => v.sku === sku);
  if (variantIndex === -1) return;

  products[productIndex].variants[variantIndex].stock += quantity;
  db.products.setAll(products);
};

// Função para gerar o próximo ID de venda sequencial
const getNewSaleId = (): { id: string, displayId: string } => {
  const currentCounter = parseInt(localStorage.getItem(DB_KEYS.SALE_COUNTER) || '0', 10);
  const newCounter = currentCounter + 1;
  localStorage.setItem(DB_KEYS.SALE_COUNTER, newCounter.toString());
  
  const displayId = `#${newCounter.toString().padStart(5, '0')}`;
  return { id: newCounter.toString(), displayId };
};

export const db = {
  products: {
    getAll: () => getTable<Product>(DB_KEYS.PRODUCTS),
    setAll: (data: Product[]) => setTable(DB_KEYS.PRODUCTS, data),
    getById: (id: string) => getTable<Product>(DB_KEYS.PRODUCTS).find(p => p.id === id),
    create: (newProductData: Omit<Product, 'id'>) => {
      const products = getTable<Product>(DB_KEYS.PRODUCTS);
      const newProduct: Product = { ...newProductData, id: `prod_${Date.now()}` };
      products.push(newProduct);
      setTable(DB_KEYS.PRODUCTS, products);
      return newProduct;
    },
    update: (updatedProduct: Product) => {
        const products = getTable<Product>(DB_KEYS.PRODUCTS);
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index > -1) {
            products[index] = updatedProduct;
            setTable(DB_KEYS.PRODUCTS, products);
        }
    },
    remove: (productId: string) => {
      let products = getTable<Product>(DB_KEYS.PRODUCTS);
      products = products.filter(p => p.id !== productId);
      setTable(DB_KEYS.PRODUCTS, products);
    }
  },
  sales: {
    getAll: () => getTable<Sale>(DB_KEYS.SALES),
    setAll: (data: Sale[]) => setTable(DB_KEYS.SALES, data),
    getById: (id: string) => getTable<Sale>(DB_KEYS.SALES).find(s => s.id === id),
    create: (saleData: Omit<Sale, 'id' | 'displayId'>): Sale => {
      const sales = getTable<Sale>(DB_KEYS.SALES);
      const { id, displayId } = getNewSaleId();
      
      const newSale: Sale = { ...saleData, id, displayId };
      sales.push(newSale);
      setTable(DB_KEYS.SALES, sales);

      // Diminui o estoque dos itens vendidos
      newSale.items.forEach(item => {
        adjustStock(item.sku, -item.quantity); // Passa quantidade negativa para subtrair
      });

      return newSale;
    },
    update: (updatedSale: Sale) => {
      const sales = getTable<Sale>(DB_KEYS.SALES);
      const index = sales.findIndex(s => s.id === updatedSale.id);
      if (index > -1) {
        sales[index] = updatedSale;
        setTable(DB_KEYS.SALES, sales);
      }
    },
    remove: (saleId: string) => {
      let sales = getTable<Sale>(DB_KEYS.SALES);
      const saleToRemove = sales.find(s => s.id === saleId);

      if (saleToRemove && saleToRemove.status === 'Concluída') {
        // Devolve os itens ao estoque se a venda estava concluída
        saleToRemove.items.forEach(item => {
          adjustStock(item.sku, item.quantity); // Passa quantidade positiva para adicionar
        });
      }

      sales = sales.filter(s => s.id !== saleId);
      setTable(DB_KEYS.SALES, sales);
    },
  },
  customers: {
    getAll: () => getTable<Customer>(DB_KEYS.CUSTOMERS),
    setAll: (data: Customer[]) => setTable(DB_KEYS.CUSTOMERS, data),
    getById: (id: string) => getTable<Customer>(DB_KEYS.CUSTOMERS).find(c => c.id === id),
    create: (data: Omit<Customer, 'id'>) => {
      const customers = getTable<Customer>(DB_KEYS.CUSTOMERS);
      const newCustomer: Customer = { ...data, id: `cust_${Date.now()}` };
      customers.push(newCustomer);
      setTable(DB_KEYS.CUSTOMERS, customers);
      return newCustomer;
    },
    update: (updatedCustomer: Customer) => {
      const customers = getTable<Customer>(DB_KEYS.CUSTOMERS);
      const index = customers.findIndex(c => c.id === updatedCustomer.id);
      if (index > -1) {
        customers[index] = updatedCustomer;
        setTable(DB_KEYS.CUSTOMERS, customers);
      }
    },
    remove: (id: string) => {
      let customers = getTable<Customer>(DB_KEYS.CUSTOMERS);
      customers = customers.filter(c => c.id !== id);
      setTable(DB_KEYS.CUSTOMERS, customers);
    }
  },
  deliveryFees: {
    getAll: () => getTable<DeliveryFee>(DB_KEYS.DELIVERY_FEES),
    setAll: (data: DeliveryFee[]) => setTable(DB_KEYS.DELIVERY_FEES, data),
    create: (data: Omit<DeliveryFee, 'id'>) => {
      const fees = getTable<DeliveryFee>(DB_KEYS.DELIVERY_FEES);
      const newFee: DeliveryFee = { ...data, id: `fee_${Date.now()}` };
      fees.push(newFee);
      setTable(DB_KEYS.DELIVERY_FEES, fees);
      return newFee;
    },
    update: (updatedFee: DeliveryFee) => {
      const fees = getTable<DeliveryFee>(DB_KEYS.DELIVERY_FEES);
      const index = fees.findIndex(f => f.id === updatedFee.id);
      if (index > -1) {
        fees[index] = updatedFee;
        setTable(DB_KEYS.DELIVERY_FEES, fees);
      }
    },
    remove: (id: string) => {
      let fees = getTable<DeliveryFee>(DB_KEYS.DELIVERY_FEES);
      fees = fees.filter(f => f.id !== id);
      setTable(DB_KEYS.DELIVERY_FEES, fees);
    }
  },
  sellers: {
    getAll: () => getTable<Seller>(DB_KEYS.SELLERS),
    setAll: (data: Seller[]) => setTable(DB_KEYS.SELLERS, data),
    getById: (id: string) => getTable<Seller>(DB_KEYS.SELLERS).find(s => s.id === id),
    create: (data: Omit<Seller, 'id'>) => {
      const sellers = getTable<Seller>(DB_KEYS.SELLERS);
      const newSeller: Seller = { ...data, id: `seller_${Date.now()}` };
      sellers.push(newSeller);
      setTable(DB_KEYS.SELLERS, sellers);
      return newSeller;
    },
    update: (updatedSeller: Seller) => {
      const sellers = getTable<Seller>(DB_KEYS.SELLERS);
      const index = sellers.findIndex(s => s.id === updatedSeller.id);
      if (index > -1) {
        sellers[index] = updatedSeller;
        setTable(DB_KEYS.SELLERS, sellers);
      }
    },
    remove: (id: string) => {
      let sellers = getTable<Seller>(DB_KEYS.SELLERS);
      sellers = sellers.filter(s => s.id !== id);
      setTable(DB_KEYS.SELLERS, sellers);
    }
  },
};