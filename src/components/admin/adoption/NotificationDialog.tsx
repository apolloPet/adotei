
import React from 'react';
import { 
  Dialog, 
  DialogClose, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from 'lucide-react';
import { AdoptionMatch } from './types';

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch | null;
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
}

const NotificationDialog = ({ 
  open, 
  onOpenChange, 
  match, 
  message, 
  onMessageChange, 
  onSend 
}: NotificationDialogProps) => {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>
            Envie uma notificação por WhatsApp para o adotante
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
              <p className="text-sm text-muted-foreground">Para: {match.userName}</p>
              <p className="text-xs text-muted-foreground">{match.userPhone}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notification-message" className="text-sm font-medium">
              Mensagem
            </label>
            <Textarea
              id="notification-message"
              placeholder="Digite a mensagem para o adotante..."
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={5}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSend} className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Enviar WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
