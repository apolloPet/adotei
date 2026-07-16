import { apiRequest } from '@/lib/apiClient';
import { toast } from '@/hooks/use-sonner';

export const removeAdminRole = async (userId: string): Promise<boolean> => {
  try {
    await apiRequest(`/api/users/${userId}`, {
      method: 'DELETE',
    });

    toast.success('Administrador removido com sucesso');
    return true;
  } catch (error) {
    console.error('Error in removeAdminRole:', error);
    const message = error instanceof Error ? error.message : 'Erro ao remover administrador';
    toast.error(message.includes('permissao') || message.includes('permissão')
      ? 'Você não tem permissão para remover administradores'
      : 'Erro ao remover administrador');
    return false;
  }
};
