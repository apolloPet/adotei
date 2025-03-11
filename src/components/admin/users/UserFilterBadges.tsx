
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { FilterType } from './types';

interface UserFilterBadgesProps {
  filters: FilterType;
  updateFilter: (key: keyof FilterType, value: string[] | boolean | null) => void;
}

const UserFilterBadges = ({ filters, updateFilter }: UserFilterBadgesProps) => {
  if (Object.values(filters).every(value => 
    value === null || (Array.isArray(value) && value.length === 0)
  )) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-1">
      {filters.housingType.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          Moradia: {filters.housingType.map(type => 
            type === 'apartment' ? 'Apartamento' : 
            type === 'house' ? 'Casa' : 'Outro'
          ).join(', ')}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('housingType', [])} 
          />
        </Badge>
      )}
      {filters.hadPetsBefore !== null && (
        <Badge variant="outline" className="flex items-center gap-1">
          {filters.hadPetsBefore ? 'Já teve animais' : 'Nunca teve animais'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('hadPetsBefore', null)} 
          />
        </Badge>
      )}
      {filters.hasAllergies !== null && (
        <Badge variant="outline" className="flex items-center gap-1">
          {filters.hasAllergies ? 'Possui alergias' : 'Não possui alergias'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('hasAllergies', null)} 
          />
        </Badge>
      )}
      {filters.hasChildren !== null && (
        <Badge variant="outline" className="flex items-center gap-1">
          {filters.hasChildren ? 'Tem crianças' : 'Não tem crianças'}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('hasChildren', null)} 
          />
        </Badge>
      )}
      {filters.city.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          Cidade: {filters.city.join(', ')}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('city', [])} 
          />
        </Badge>
      )}
      {filters.neighborhood.length > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          Bairro: {filters.neighborhood.join(', ')}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => updateFilter('neighborhood', [])} 
          />
        </Badge>
      )}
    </div>
  );
};

export default UserFilterBadges;
