import { supabase } from './supabase';
import { Product, Sale, Customer, Seller, DeliveryFee } from "@/types";

const STORE_ID = '00000000-0000-0000-0000-000000000000';

export const db = {
  products: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, variants:product_variants(*)')
        .eq('store_id', STORE_ID);

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      
      return data.map((p: any) => ({
        ...p,
        basePrice: p.base_price,
        imageUrl: p.image_url
      })) as Product[];
    },

    create: async (newProductData: Omit<Product, 'id'>) => {
      const { variants, ...productInfo } = newProductData;

      const dbPayload = {
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

      if (variants && variants.length > 0) {
        const variantsWithId = variants.map(v => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
          product_id: product.id,
        }));

        const { error: varError } = await supabase
          .from('product_variants')
          .insert(variantsWithId);
        
        if (varError) throw varError;
      }
      return product;
    },

    update: async (updatedProduct: Product) => {
       const { variants, ...productInfo } = updatedProduct;
       
       const dbPayload = {
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

    remove: async (productId: string) => {
      await supabase.from('product_variants').delete().eq('product_id', productId);
      await supabase.from('products').delete().eq('id', productId);
    }
  },

  sales: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('store_id', STORE_ID)
        .order('date', { ascending: false });
      
      if (error) return [];
      
      return data.map((s: any) => ({
        ...s,
        displayId: s.display_id,
        customerName: s.customer_name,
        sellerName: s.seller_name,
        paymentMethod: s.payment_method
      })) as Sale[];
    },

    create: async (saleData: any) => {
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
    getAll: async () => {
      const { data } = await supabase.from('customers').select('*').eq('store_id', STORE_ID);
      return (data as Customer[]) || [];
    },
    create: async (data: any) => {
       const { data: newCustomer, error } = await supabase.from('customers').insert([{ ...data, store_id: STORE_ID }]).select().single();
       if (error) throw error;
       return newCustomer;
    },
    update: async () => {},
    remove: async () => {},
    addAddress: async () => { return null },
  },

  sellers: {
    getAll: async () => {
        const { data } = await supabase.from('sellers').select('*').eq('store_id', STORE_ID);
        return data?.map((s: any) => ({ ...s, pixKey: s.pix_key })) as Seller[] || [];
    },
    create: async (data: Omit<Seller, 'id'>) => {
        const dbPayload = { name: data.name, pix_key: data.pixKey, store_id: STORE_ID };
        const { data: newSeller } = await supabase.from('sellers').insert([dbPayload]).select().single();
        return newSeller;
    },
    update: async () => {},
    remove: async () => {},
  },
  
  deliveryFees: {
      getAll: async () => {
        const { data } = await supabase.from('delivery_fees').select('*').eq('store_id', STORE_ID);
        return (data as DeliveryFee[]) || [];
      },
      setAll: () => {},
      create: async () => null,
      update: async () => {},
      remove: async () => {}
  }
};