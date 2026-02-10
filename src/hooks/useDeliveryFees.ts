import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { toast } from 'sonner';

// Busca taxas (Cache)
export function useDeliveryFees() {
  return useQuery({
    queryKey: ['deliveryFees'],
    queryFn: async () => {
      const data = await db.deliveryFees.getAll();
      return data;
    },
  });
}

// Cria/Atualiza taxa
export function useCreateDeliveryFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => db.deliveryFees.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryFees'] });
      toast.success('Taxa salva com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao salvar taxa.');
    }
  });
}

// Hook para remover taxa
export function useDeleteDeliveryFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => db.deliveryFees.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryFees'] });
      toast.success('Taxa removida.');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao remover taxa.');
    }
  });
}