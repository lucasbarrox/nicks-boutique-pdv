import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Seller } from '@/types';
import { toast } from 'sonner';

// Busca todos os vendedores
export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const data = await db.sellers.getAll();
      return data;
    },
  });
}

// Cria um novo vendedor
export function useCreateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Seller, 'id'>) => db.sellers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast.success('Vendedor cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao cadastrar vendedor.');
    }
  });
}