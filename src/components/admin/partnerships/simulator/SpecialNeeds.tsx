
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";

interface SpecialNeedsProps {
  specialCareNeeds: string[];
  notes: string;
  onSpecialCareNeedsChange: (value: string[]) => void;
  onNotesChange: (value: string) => void;
}

const SpecialNeeds = ({
  specialCareNeeds,
  notes,
  onSpecialCareNeedsChange,
  onNotesChange
}: SpecialNeedsProps) => {
  const [newNeed, setNewNeed] = useState("");
  
  const commonNeeds = [
    "Medicação diária",
    "Dieta especial",
    "Fisioterapia",
    "Atenção constante",
    "Exercícios específicos",
    "Ambiente adaptado",
    "Intervenções médicas frequentes"
  ];
  
  const addNeed = (need: string) => {
    if (need && !specialCareNeeds.includes(need)) {
      onSpecialCareNeedsChange([...specialCareNeeds, need]);
    }
  };
  
  const handleAddCommonNeed = (need: string) => {
    addNeed(need);
  };
  
  const handleAddCustomNeed = () => {
    if (newNeed.trim()) {
      addNeed(newNeed.trim());
      setNewNeed("");
    }
  };
  
  const removeNeed = (need: string) => {
    onSpecialCareNeedsChange(specialCareNeeds.filter(n => n !== need));
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Necessidades de cuidados especiais</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {specialCareNeeds.map((need) => (
              <Badge key={need} variant="secondary" className="flex items-center gap-1">
                {need}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeNeed(need)}
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {commonNeeds
              .filter(need => !specialCareNeeds.includes(need))
              .map((need) => (
                <Badge 
                  key={need} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => handleAddCommonNeed(need)}
                >
                  + {need}
                </Badge>
              ))}
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <div className="grid flex-1 gap-2">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Adicionar outra necessidade especial"
                value={newNeed}
                onChange={(e) => setNewNeed(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomNeed();
                  }
                }}
              />
            </div>
            <Button type="button" onClick={handleAddCustomNeed}>
              Adicionar
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Observações adicionais</Label>
          <Textarea 
            placeholder="Adicione informações relevantes sobre o animal e seus cuidados especiais"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default SpecialNeeds;
