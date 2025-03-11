
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FilterType } from './types';
import { toast } from "@/hooks/use-sonner";

interface UserFilterDropdownProps {
  filters: FilterType;
  updateFilter: (key: keyof FilterType, value: string[] | boolean | null) => void;
  toggleArrayFilter: (key: keyof FilterType, value: string) => void;
  cityOptions: string[];
  neighborhoodOptions: string[];
  activeFiltersCount: number;
}

const UserFilterDropdown = ({ 
  filters, 
  updateFilter, 
  toggleArrayFilter, 
  cityOptions, 
  neighborhoodOptions,
  activeFiltersCount 
}: UserFilterDropdownProps) => {
  const resetFilters = () => {
    updateFilter('housingType', []);
    updateFilter('hadPetsBefore', null);
    updateFilter('hasAllergies', null);
    updateFilter('hasChildren', null);
    updateFilter('city', []);
    updateFilter('neighborhood', []);
    
    toast.success("Filtros removidos", {
      description: "Todos os filtros foram redefinidos."
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge className="ml-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold">Tipo de moradia</div>
        <DropdownMenuCheckboxItem
          checked={filters.housingType.includes('apartment')}
          onCheckedChange={() => toggleArrayFilter('housingType', 'apartment')}
        >
          Apartamento
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.housingType.includes('house')}
          onCheckedChange={() => toggleArrayFilter('housingType', 'house')}
        >
          Casa
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.housingType.includes('other')}
          onCheckedChange={() => toggleArrayFilter('housingType', 'other')}
        >
          Outro
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Experiência com animais</div>
        <DropdownMenuCheckboxItem
          checked={filters.hadPetsBefore === true}
          onCheckedChange={() => updateFilter('hadPetsBefore', filters.hadPetsBefore === true ? null : true)}
        >
          Já teve animais
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.hadPetsBefore === false}
          onCheckedChange={() => updateFilter('hadPetsBefore', filters.hadPetsBefore === false ? null : false)}
        >
          Nunca teve animais
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Alergias</div>
        <DropdownMenuCheckboxItem
          checked={filters.hasAllergies === true}
          onCheckedChange={() => updateFilter('hasAllergies', filters.hasAllergies === true ? null : true)}
        >
          Possui alergias
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.hasAllergies === false}
          onCheckedChange={() => updateFilter('hasAllergies', filters.hasAllergies === false ? null : false)}
        >
          Não possui alergias
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Crianças</div>
        <DropdownMenuCheckboxItem
          checked={filters.hasChildren === true}
          onCheckedChange={() => updateFilter('hasChildren', filters.hasChildren === true ? null : true)}
        >
          Tem crianças
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.hasChildren === false}
          onCheckedChange={() => updateFilter('hasChildren', filters.hasChildren === false ? null : false)}
        >
          Não tem crianças
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Cidade</div>
        {cityOptions.map(city => (
          <DropdownMenuCheckboxItem
            key={city}
            checked={filters.city.includes(city)}
            onCheckedChange={() => toggleArrayFilter('city', city)}
          >
            {city}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-sm font-semibold">Bairro</div>
        {neighborhoodOptions.map(neighborhood => (
          <DropdownMenuCheckboxItem
            key={neighborhood}
            checked={filters.neighborhood.includes(neighborhood)}
            onCheckedChange={() => toggleArrayFilter('neighborhood', neighborhood)}
          >
            {neighborhood}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={resetFilters}
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserFilterDropdown;
