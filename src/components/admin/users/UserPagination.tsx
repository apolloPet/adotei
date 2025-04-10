
import React from 'react';
import { Button } from "@/components/ui/button";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const UserPagination = ({ currentPage, totalPages, setCurrentPage }: UserPaginationProps) => {
  return (
    <div className="flex justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
      >
        Anterior
      </Button>
      <div className="flex items-center">
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
      >
        Próxima
      </Button>
    </div>
  );
};

export default UserPagination;
