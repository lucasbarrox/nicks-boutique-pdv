import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { toast } from 'sonner';

// Busca todos os clientes
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const data = await db.customers.getAll();
      return data;
    },
  });
}

// Cria um novo cliente
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => db.customers.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente cadastrado com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      toast.error('Erro ao cadastrar cliente.');
    }
  });
}