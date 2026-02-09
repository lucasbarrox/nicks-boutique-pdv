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
       
       // 1. Atualiza dados do Produto Pai
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

       // 2. Lógica Enterprise para Variações (Upsert & Prune)
       if (variants) {
         // A. Upsert (Atualiza existentes, Cria novos)
         // A. Upsert (Atualiza existentes, Cria novos)
         const variantsPayload = variants.map(v => {
           // Preparamos o objeto base
           const payload: any = {
             sku: v.sku,
             size: v.size,
             color: v.color,
             stock: v.stock,
             product_id: updatedProduct.id
           };
           
           // Só adicionamos o ID se ele REALMENTE existir (não for nulo/vazio)
           // Isso força o banco a criar um novo ID se este campo não for enviado
           if (v.id) {
             payload.id = v.id;
           }
           
           return payload;
         });

         const { error: upsertError } = await supabase
            .from('product_variants')
            .upsert(variantsPayload);
         
         if (upsertError) throw upsertError;

         // B. Prune (Apagar apenas os que foram removidos do form)
         // Filtramos apenas os IDs válidos que permaneceram no formulário
         const keptIds = variants
            .filter(v => v.id) // Pega só quem tem ID
            .map(v => v.id);

         // Deleta do banco tudo o que é deste produto MAS não está na lista de mantidos
         if (keptIds.length > 0) {
            await supabase
                .from('product_variants')
                .delete()
                .eq('product_id', updatedProduct.id)
                .not('id', 'in', `(${keptIds.join(',')})`);
         } else {
             // Se o usuário removeu TODAS as variações no form (mas ainda existe o produto)
             // Deletamos tudo que já tinha ID (ou seja, tudo que estava no banco)
             // Nota: É raro um produto sem variações no seu modelo, mas é bom tratar
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
    // ... (Mantenha o resto igual, getAll, create, etc.)
    getAll: async () => {
      const { data, error } = await supabase.from('sales').select('*').eq('store_id', STORE_ID).order('date', { ascending: false });
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
            customer_id: saleData.customer_id,
            customer_name: saleData.customerName,
            seller_id: saleData.seller_id,
            seller_name: saleData.sellerName,
            total: saleData.total,
            payment_method: saleData.payment_method || saleData.paymentMethod,
            status: saleData.status,
            items: saleData.items,
            date: saleData.date
        };
        const { data, error } = await supabase.from('sales').insert([dbPayload]).select().single();
        if (error) throw error;
        for (const item of saleData.items) {
            const { data: variant } = await supabase.from('product_variants').select('id, stock').eq('sku', item.sku).maybeSingle();
            if (variant) {
              await supabase.from('product_variants').update({ stock: variant.stock - item.quantity }).eq('id', variant.id);
            }
        }
        return data as Sale;
    },
    update: async () => {},
    remove: async () => {},
  },
  // ... (Mantenha customers, sellers, deliveryFees iguais ao anterior)
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