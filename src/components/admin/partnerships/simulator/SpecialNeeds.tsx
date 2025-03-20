
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface SpecialNeedsProps {
  specialCareNeeds: string[];
  notes: string;
  onSpecialNeedsAdd: (need: string) => void;
  onSpecialNeedsRemove: (need: string) => void;
  onNotesChange: (notes: string) => void;
}

const SpecialNeeds = ({
  specialCareNeeds,
  notes,
  onSpecialNeedsAdd,
  onSpecialNeedsRemove,
  onNotesChange
}: SpecialNeedsProps) => {
  const [newNeed, setNewNeed] = React.useState("");

  const handleAddNeed = () => {
    if (newNeed.trim()) {
      onSpecialNeedsAdd(newNeed.trim());
      setNewNeed("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Necessidades Especiais</Label>
          
          <div className="flex gap-2">
            <Input
              value={newNeed}
              onChange={(e) => setNewNeed(e.target.value)}
              placeholder="Adicionar necessidade especial"
            />
            <Button type="button" onClick={handleAddNeed} variant="outline">
              Adicionar
            </Button>
          </div>
          
          {specialCareNeeds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {specialCareNeeds.map((need) => (
                <Badge 
                  key={need} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-2"
                >
                  {need}
                  <button
                    type="button"
                    onClick={() => onSpecialNeedsRemove(need)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Observações Adicionais</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Outras informações relevantes..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default SpecialNeeds;
