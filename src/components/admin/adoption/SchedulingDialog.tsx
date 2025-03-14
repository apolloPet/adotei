
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AdoptionMatch } from './types';

interface SchedulingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch | null;
  type: 'visit' | 'inspection';
  onSubmit: (match: AdoptionMatch, date: Date, time: string, notes: string) => void;
}

const SchedulingDialog = ({ 
  open, 
  onOpenChange, 
  match, 
  type, 
  onSubmit 
}: SchedulingDialogProps) => {
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState("");
  
  if (!match) return null;

  const handleSubmit = () => {
    if (scheduleDate) {
      onSubmit(match, scheduleDate, scheduleTime, scheduleNotes);
    }
  };

  const title = type === 'visit' ? 'Agendar Visita' : 'Agendar Inspeção Domiciliar';
  const description = type === 'visit' 
    ? 'Agende uma visita para que o adotante conheça o animal' 
    : 'Agende uma visita à residência do adotante';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
              <p className="text-sm text-muted-foreground">Para: {match.userName}</p>
            </div>
          </div>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                Data
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !scheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduleDate ? format(scheduleDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduleDate}
                    onSelect={setScheduleDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">
                Horário
              </label>
              <Input
                id="time"
                placeholder="Ex: 14:30"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Observações
              </label>
              <Textarea
                id="notes"
                placeholder={`Adicione informações adicionais sobre a ${type === 'visit' ? 'visita' : 'inspeção'}...`}
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {type === 'visit' ? 'Agendar Visita' : 'Agendar Inspeção'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulingDialog;
