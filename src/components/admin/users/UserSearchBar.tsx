
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  handleSearch: (value: string) => void;
}

const UserSearchBar = ({ searchTerm, handleSearch }: UserSearchBarProps) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nome, email, telefone..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};

export default UserSearchBar;
