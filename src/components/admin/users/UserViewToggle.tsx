
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserViewToggleProps {
  viewMode: 'simple' | 'detailed';
  setViewMode: (value: 'simple' | 'detailed') => void;
}

const UserViewToggle = ({ viewMode, setViewMode }: UserViewToggleProps) => {
  return (
    <Select
      value={viewMode}
      onValueChange={(value: 'simple' | 'detailed') => setViewMode(value)}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Visualização" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="simple">Resumida</SelectItem>
        <SelectItem value="detailed">Detalhada</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserViewToggle;
