
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

interface FilterOptions {
  species: string;
  gender: string;
  size: string;
  ageRange: number[];
}

interface FilterPanelProps {
  filters: FilterOptions;
  isLoading: boolean;
  onFilterChange: (key: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const FilterPanel = ({ 
  filters, 
  isLoading, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters 
}: FilterPanelProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full h-10 w-10 p-0">
          <Filter className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Personalize sua busca para encontrar o pet ideal
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Tipo de Animal</Label>
            <RadioGroup 
              value={filters.species} 
              onValueChange={value => onFilterChange('species', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-species" />
                <Label htmlFor="all-species">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dog" id="dog" />
                <Label htmlFor="dog">Cachorro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cat" id="cat" />
                <Label htmlFor="cat">Gato</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-base">Gênero</Label>
            <RadioGroup 
              value={filters.gender} 
              onValueChange={value => onFilterChange('gender', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-gender" />
                <Label htmlFor="all-gender">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Macho</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Fêmea</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label className="text-base">Porte</Label>
            <RadioGroup 
              value={filters.size} 
              onValueChange={value => onFilterChange('size', value)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all-size" />
                <Label htmlFor="all-size">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small">Pequeno</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Médio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large">Grande</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base">Idade (anos)</Label>
              <span className="text-sm text-muted-foreground">
                {filters.ageRange[0]} - {filters.ageRange[1]}
              </span>
            </div>
            <Slider
              defaultValue={filters.ageRange}
              min={0}
              max={15}
              step={1}
              onValueChange={value => onFilterChange('ageRange', value)}
              className="py-4"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onApplyFilters}>
            {isLoading ? (
              <span className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Aplicando...
              </span>
            ) : (
              'Aplicar Filtros'
            )}
          </Button>
          <Button variant="outline" onClick={onResetFilters}>
            Limpar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterPanel;
