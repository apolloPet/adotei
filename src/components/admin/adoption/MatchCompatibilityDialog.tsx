
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdoptionMatch } from './types';

interface MatchCompatibilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch | null;
}

const MatchCompatibilityDialog = ({ open, onOpenChange, match }: MatchCompatibilityDialogProps) => {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pontos de Compatibilidade</DialogTitle>
          <DialogDescription>
            Análise de compatibilidade entre o adotante e o animal
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={match.petImage} 
              alt={match.petName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">{match.petName}</p>
              <p className="text-sm text-muted-foreground">Adotante: {match.userName}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Pontos de Compatibilidade</h4>
            {match.matchPoints && match.matchPoints.length > 0 ? (
              <div className="space-y-2">
                {match.matchPoints.map((point, index) => {
                  let badgeClass = "";
                  
                  switch(point.strength) {
                    case "high":
                      badgeClass = "bg-green-100 text-green-800";
                      break;
                    case "medium":
                      badgeClass = "bg-yellow-100 text-yellow-800";
                      break;
                    case "low":
                      badgeClass = "bg-orange-100 text-orange-800";
                      break;
                  }
                  
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center text-lg">
                        {point.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{point.description}</p>
                      </div>
                      <Badge variant="outline" className={badgeClass}>
                        {point.strength === "high" ? "Alto" : point.strength === "medium" ? "Médio" : "Baixo"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum ponto de compatibilidade registrado.</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MatchCompatibilityDialog;
