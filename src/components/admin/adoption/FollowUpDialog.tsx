
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdoptionMatch } from "./types";

interface FollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch | null;
  onSubmit: (matchId: string, status: string, notes: string, nextDate: Date | null) => void;
}

const FollowUpDialog = ({
  open,
  onOpenChange,
  match,
  onSubmit
}: FollowUpDialogProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("completed");

  const handleSubmit = () => {
    if (!match) return;
    onSubmit(match.id, status, notes, date || null);
    onOpenChange(false);
  };

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Acompanhamento</DialogTitle>
          <DialogDescription>
            Agende um acompanhamento para a adoção de {match.petName} por {match.userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium">Data do Acompanhamento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="notes" className="text-sm font-medium">Observações</label>
            <Textarea
              id="notes"
              placeholder="Adicione informações relevantes sobre o acompanhamento..."
              className="min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!date}>Agendar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FollowUpDialog;
