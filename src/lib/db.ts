import { supabase } from './supabase';
import { Product, Sale, Customer, Seller, DeliveryFee } from "@/types";
import { DbProduct, DbProductVariant, DbSale, DbCustomer, DbSeller, DbDeliveryFee } from "@/types/database";
import { Mappers } from './mappers';

const STORE_ID = '00000000-0000-0000-0000-000000000000';

export const db = {
  products: {
    getAll: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('store_id', STORE_ID)
        .order('name');

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return (data as any[]).map(p => Mappers.product(p, p.variants));
    },

    create: async (newProductData: Omit<Product, 'id'>): Promise<Product> => {
      const { variants, ...productInfo } = newProductData;

      const dbPayload: Partial<DbProduct> = {
        name: productInfo.name,
        description: productInfo.description,
        category: productInfo.category,
        base_price: productInfo.basePrice,
        image_url: productInfo.imageUrl,
        store_id: STORE_ID,
        active: true
      };

      const { data: product, error: prodError } = await supabase
        .from('products')
        .insert([dbPayload])
        .select()
        .single();

      if (prodError || !product) throw prodError;

      let createdVariants: DbProductVariant[] = [];

      if (variants && variants.length > 0) {
        const variantsWithId = variants.map(v => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          product_id: product.id,
        }));

        const { data: vars, error: varError } = await supabase
          .from('product_variants')
          .insert(variantsWithId)
          .select();
        
        if (varError) throw varError;
        createdVariants = vars as DbProductVariant[];
      }
      
      return Mappers.product(product as DbProduct, createdVariants);
    },

    update: async (updatedProduct: Product): Promise<void> => {
       const { variants, ...productInfo } = updatedProduct;
       
       const dbPayload: Partial<DbProduct> = {
        name: productInfo.name,
        description: productInfo.description,
        category: productInfo.category,
        base_price: productInfo.basePrice,
        image_url: productInfo.imageUrl
      };

       const { error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', updatedProduct.id);

       if (error) throw error;

       if (variants) {
         const variantsPayload = variants.map(v => {
           const payload: any = {
             sku: v.sku,
             size: v.size,
             color: v.color,
             stock: v.stock,
             product_id: updatedProduct.id
           };
           if (v.id) payload.id = v.id;
           return payload;
         });

         const { error: upsertError } = await supabase
            .from('product_variants')
            .upsert(variantsPayload);
         
         if (upsertError) throw upsertError;

         const keptIds = variants
            .filter(v => v.id)
            .map(v => v.id);

         if (keptIds.length > 0) {
            await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', updatedProduct.id)
                .not('id', 'in', `(${keptIds.join(',')})`);
         } else {
             await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', updatedProduct.id);
         }
       }
    },

    remove: async (productId: string): Promise<void> => {
      await supabase.from('product_variants').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
    }
  },

  sales: {
    getAll: async (): Promise<Sale[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('store_id', STORE_ID)
        .order('date', { ascending: false });
      
      if (error) return [];
      
      return (data as DbSale[]).map(Mappers.sale);
    },

    create: async (saleData: any): Promise<Sale> => {
        const displayId = `#${Date.now().toString().slice(-4)}`;

        const dbPayload = {
            display_id: displayId,
            store_id: STORE_ID,
            customer_id: saleData.customer_id || null,
            customer_name: saleData.customerName,
            seller_id: saleData.seller_id || null,
            seller_name: saleData.sellerName,
            total: saleData.total,
            payment_method: saleData.payment_method || saleData.paymentMethod,
            status: saleData.status,
            items: saleData.items,
            date: saleData.date
        };

        const { data, error } = await supabase
            .rpc('create_sale_transaction', { p_sale_data: dbPayload });
        
        if (error) {
            console.error("Erro na transação de venda:", error);
            throw error;
        }

        return {
            ...saleData,
            id: data.id,
            displayId: displayId
        } as Sale;
    },
    
    update: async () => {},
    remove: async () => {},
  },

  customers: {
    getAll: async (): Promise<Customer[]> => {
      const { data } = await supabase.from('customers').select('*').eq('store_id', STORE_ID);
      return (data as DbCustomer[] || []).map(Mappers.customer);
    },
    create: async (data: any): Promise<Customer> => {
       const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{ ...data, store_id: STORE_ID }])
        .select()
        .single();
       
       if (error) throw error;
       return Mappers.customer(newCustomer as DbCustomer);
    },
    update: async () => {},
    remove: async () => {},
    addAddress: async () => { return null },
  },

  sellers: {
    getAll: async (): Promise<Seller[]> => {
        const { data } = await supabase.from('sellers').select('*').eq('store_id', STORE_ID);
        return (data as DbSeller[] || []).map(Mappers.seller);
    },
    create: async (data: Omit<Seller, 'id'>): Promise<Seller> => {
        const dbPayload = { name: data.name, pix_key: data.pixKey, store_id: STORE_ID };
        const { data: newSeller } = await supabase.from('sellers').insert([dbPayload]).select().single();
        return Mappers.seller(newSeller as DbSeller);
    },
    update: async () => {},
    remove: async () => {},
  },
  
  deliveryFees: {
      getAll: async (): Promise<DeliveryFee[]> => {
        const { data } = await supabase.from('delivery_fees').select('*').eq('store_id', STORE_ID);
        return (data as DbDeliveryFee[] || []).map(Mappers.deliveryFee);
      },
      setAll: () => {},
      create: async (data: Omit<DeliveryFee, 'id'>): Promise<DeliveryFee> => {
          const dbPayload = {
              store_id: STORE_ID,
              neighborhood: data.neighborhood,
              fee: data.fee
          };
          const { data: newFee, error } = await supabase
            .from('delivery_fees')
            .insert([dbPayload])
            .select()
            .single();
          
          if (error) throw error;
          return Mappers.deliveryFee(newFee as DbDeliveryFee);
      },
      update: async () => {},
      remove: async (id: string): Promise<void> => {
          const { error } = await supabase.from('delivery_fees').delete().eq('id', id);
          if (error) throw error;
      }
  }
};