
import { CardContent } from "@/components/ui/card";
import { User } from '../types';
import UserSimpleView from '../UserSimpleView';
import UserDetailedView from '../UserDetailedView';
import UserPagination from '../UserPagination';
import { format } from 'date-fns';

interface UserListContentProps {
  isLoading: boolean;
  filteredUsers: User[];
  viewMode: 'simple' | 'detailed';
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
}

const ITEMS_PER_PAGE = 10;

export const UserListContent = ({
  isLoading,
  filteredUsers,
  viewMode,
  currentPage,
  setCurrentPage,
  totalItems,
}: UserListContentProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <CardContent className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </CardContent>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <CardContent className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado com os critérios de busca.
      </CardContent>
    );
  }

  return (
    <CardContent>
      {viewMode === 'simple' ? (
        <UserSimpleView users={paginatedUsers} formatDate={formatDate} />
      ) : (
        <UserDetailedView users={paginatedUsers} formatDate={formatDate} />
      )}
      
      {totalPages > 1 && (
        <UserPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        Exibindo {paginatedUsers.length} de {filteredUsers.length} usuários cadastrados 
        {totalItems > filteredUsers.length ? ` (total: ${totalItems})` : ''}.
      </p>
    </CardContent>
  );
};
