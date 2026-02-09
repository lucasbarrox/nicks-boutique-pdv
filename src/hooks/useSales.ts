import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Sale } from '@/types';
import { toast } from 'sonner';

// Hook para BUSCAR todas as vendas
export function useSales() {
  return useQuery({
    queryKey: ['sales'], // Chave única do cache
    queryFn: async () => {
      const data = await db.sales.getAll();
      return data;
    },
  });
}

// Hook para BUSCAR uma venda específica pelo ID
export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      if (!id) return null;
      const allSales = await db.sales.getAll();
      return allSales.find(s => s.id === id) || null;
    },
    enabled: !!id, // 
  });
}

// Hook para CRIAR venda 
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => db.sales.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] }); // Atualiza a lista de vendas
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Atualiza o estoque (produtos)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }); // Se tiver cache de dashboard
      toast.success('Venda realizada com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao finalizar venda.');
    }
  });
}