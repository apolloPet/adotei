
import React from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AnimalHealthOptionsProps {
  healthConditions: string[];
  specialCareNeeds: string[];
  onAddHealthCondition: (condition: string) => void;
  onRemoveHealthCondition: (condition: string) => void;
  onAddSpecialNeed: (need: string) => void;
  onRemoveSpecialNeed: (need: string) => void;
  isSterilized: boolean;
  onSterilizedChange: (value: boolean) => void;
}

const AnimalHealthOptions: React.FC<AnimalHealthOptionsProps> = ({
  healthConditions,
  specialCareNeeds,
  onAddHealthCondition,
  onRemoveHealthCondition,
  onAddSpecialNeed,
  onRemoveSpecialNeed,
  isSterilized,
  onSterilizedChange
}) => {
  const [newCondition, setNewCondition] = React.useState('');
  const [newSpecialNeed, setNewSpecialNeed] = React.useState('');

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      onAddHealthCondition(newCondition.trim());
      setNewCondition('');
    }
  };

  const handleAddSpecialNeed = () => {
    if (newSpecialNeed.trim()) {
      onAddSpecialNeed(newSpecialNeed.trim());
      setNewSpecialNeed('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="sterilized">Já Castrado/Esterilizado</Label>
          <p className="text-muted-foreground text-xs">Animal já passou por procedimento de castração</p>
        </div>
        <Switch
          checked={isSterilized}
          onCheckedChange={onSterilizedChange}
          id="sterilized"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Condições de Saúde</Label>
        <p className="text-muted-foreground text-xs">Adicione condições de saúde que requerem cuidados especiais</p>
        
        <div className="flex space-x-2">
          <Input
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="Ex: Diabetes, Alergia, etc"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddCondition}
          >
            Adicionar
          </Button>
        </div>
        
        {healthConditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {healthConditions.map((condition) => (
              <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                {condition}
                <button 
                  type="button" 
                  onClick={() => onRemoveHealthCondition(condition)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label>Necessidades Especiais</Label>
        <p className="text-muted-foreground text-xs">Adicione necessidades especiais que impactam os custos</p>
        
        <div className="flex space-x-2">
          <Input
            value={newSpecialNeed}
            onChange={(e) => setNewSpecialNeed(e.target.value)}
            placeholder="Ex: Dieta especial, Fisioterapia, etc"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddSpecialNeed}
          >
            Adicionar
          </Button>
        </div>
        
        {specialCareNeeds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {specialCareNeeds.map((need) => (
              <Badge key={need} variant="secondary" className="flex items-center gap-1">
                {need}
                <button 
                  type="button" 
                  onClick={() => onRemoveSpecialNeed(need)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalHealthOptions;
