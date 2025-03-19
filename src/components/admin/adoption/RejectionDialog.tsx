
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-sonner";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  petName: string;
}

const RejectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  petName
}: RejectionDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error("É necessário informar o motivo da rejeição");
      return;
    }

    onConfirm(reason);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rejeitar Adoção</DialogTitle>
          <DialogDescription>
            Por favor, informe o motivo da rejeição da adoção de {petName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="reason" className="text-sm font-medium">Motivo da Rejeição</label>
            <Textarea
              id="reason"
              placeholder="Descreva o motivo da rejeição da adoção..."
              className="min-h-[100px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Confirmar Rejeição
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;
