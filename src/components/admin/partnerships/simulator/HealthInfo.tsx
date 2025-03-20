
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface HealthInfoProps {
  healthConditions: string[];
  groomingFrequency: 'rarely' | 'monthly' | 'biweekly';
  isSterilized: boolean;
  onHealthConditionsChange: (value: string[]) => void;
  onGroomingFrequencyChange: (value: string) => void;
  onIsSterilizedChange: (value: boolean) => void;
}

const HealthInfo = ({
  healthConditions,
  groomingFrequency,
  isSterilized,
  onHealthConditionsChange,
  onGroomingFrequencyChange,
  onIsSterilizedChange
}: HealthInfoProps) => {
  const [newCondition, setNewCondition] = useState("");
  
  const commonConditions = [
    "Alergias",
    "Artrite",
    "Diabetes",
    "Problemas cardíacos",
    "Problemas renais",
    "Problemas respiratórios",
    "Obesidade"
  ];
  
  const addCondition = (condition: string) => {
    if (condition && !healthConditions.includes(condition)) {
      onHealthConditionsChange([...healthConditions, condition]);
    }
  };
  
  const handleAddCommonCondition = (condition: string) => {
    addCondition(condition);
  };
  
  const handleAddCustomCondition = () => {
    if (newCondition.trim()) {
      addCondition(newCondition.trim());
      setNewCondition("");
    }
  };
  
  const removeCondition = (condition: string) => {
    onHealthConditionsChange(healthConditions.filter(c => c !== condition));
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Frequência de banho/tosa</Label>
          <Select value={groomingFrequency} onValueChange={onGroomingFrequencyChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarely">Raramente (a cada 3 meses)</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="biweekly">Quinzenal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>O animal é castrado?</Label>
          <div className="flex items-center space-x-2 pt-1">
            <Checkbox 
              id="isSterilized" 
              checked={isSterilized} 
              onCheckedChange={(checked) => onIsSterilizedChange(checked as boolean)}
            />
            <label
              htmlFor="isSterilized"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Sim, o animal é castrado
            </label>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Condições de saúde</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {healthConditions.map((condition) => (
              <Badge key={condition} variant="secondary" className="flex items-center gap-1">
                {condition}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeCondition(condition)}
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {commonConditions
              .filter(condition => !healthConditions.includes(condition))
              .map((condition) => (
                <Badge 
                  key={condition} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => handleAddCommonCondition(condition)}
                >
                  + {condition}
                </Badge>
              ))}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="grid flex-1 gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Adicionar outra condição"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCondition();
                  }
                }}
              />
            </div>
            <Button type="button" onClick={handleAddCustomCondition}>
              Adicionar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;
