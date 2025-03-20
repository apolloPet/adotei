
import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HealthInfoProps {
  healthConditions: string[];
  isSterilized: boolean;
  onConditionAdd: (condition: string) => void;
  onConditionRemove: (condition: string) => void;
  onSterilizedChange: (value: boolean) => void;
}

const HealthInfo = ({
  healthConditions,
  isSterilized,
  onConditionAdd,
  onConditionRemove,
  onSterilizedChange
}: HealthInfoProps) => {
  const [newCondition, setNewCondition] = React.useState("");

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      onConditionAdd(newCondition.trim());
      setNewCondition("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sterilized">Castrado/Esterilizado</Label>
          <Switch
            id="sterilized"
            checked={isSterilized}
            onCheckedChange={onSterilizedChange}
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Condições de Saúde</Label>
          
          <div className="flex gap-2">
            <Input
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Adicionar condição (ex: alergia, diabetes)"
            />
            <Button type="button" onClick={handleAddCondition} variant="outline">
              Adicionar
            </Button>
          </div>
          
          {healthConditions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {healthConditions.map((condition) => (
                <Badge 
                  key={condition} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-2"
                >
                  {condition}
                  <button
                    type="button"
                    onClick={() => onConditionRemove(condition)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthInfo;
