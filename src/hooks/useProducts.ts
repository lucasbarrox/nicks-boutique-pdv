import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { toast } from 'sonner';

// Hook para BUSCAR produtos (Cache)
export function useProducts() {
  return useQuery({
    queryKey: ['products'], // Chave única do cache
    queryFn: async () => {
      const data = await db.products.getAll();
      return data;
    },
  });
}

// Hook para CRIAR produto
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Product, 'id'>) => db.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao criar produto.');
    }
  });
}

// Hook para ATUALIZAR produto
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Product) => db.products.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao atualizar produto.');
    }
  });
}

// Hook para DELETAR produto
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.products.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto removido.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao remover produto.');
    }
  });
}