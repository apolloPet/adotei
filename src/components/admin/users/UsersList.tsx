
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from '@/hooks/auth';
import { useUsersData } from './hooks/useUsersData';
import { UserListHeader } from './components/UserListHeader';
import { UserListContent } from './components/UserListContent';
import { NoPermissionView } from './components/NoPermissionView';

const UsersList = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const { user } = useAuth();
  const { 
    users,
    isLoading,
    error,
    filteredUsers,
    filters,
    searchTerm,
    viewMode,
    currentPage,
    setFilters,
    setSearchTerm,
    setViewMode,
    setCurrentPage
  } = useUsersData();

  useEffect(() => {
    const verifyPermissions = async () => {
      try {
        if (!user) {
          setHasPermission(false);
          setIsVerifying(false);
          return;
        }

        const isMainAdmin = user.email === 'admin@petmatch.com';
        const isAdminEmail = isMainAdmin || 
                           (user.email || '').includes('@admin') || 
                           (user.email || '').includes('@ong');

        if (isAdminEmail) {
          setHasPermission(true);
          setIsVerifying(false);
          return;
        }
        setHasPermission(localStorage.getItem('isAdmin') === 'true');
      } catch (err) {
        console.error('Error verifying permissions:', err);
        setHasPermission(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPermissions();
  }, [user]);

  if (isVerifying) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission) {
    return <NoPermissionView />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 mb-2 text-red-500" />
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-xl">Lista de Usuários Cadastrados</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Gerencie e visualize os usuários cadastrados no sistema</CardDescription>
      </CardHeader>
      <UserListHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filters={filters}
        setFilters={setFilters}
        users={users}
      />
      <UserListContent 
        isLoading={isLoading}
        filteredUsers={filteredUsers}
        viewMode={viewMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={users.length}
      />
    </Card>
  );
};

export default UsersList;
