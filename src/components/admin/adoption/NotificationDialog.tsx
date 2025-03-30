
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

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMessage: string;
  onSend: () => void;
  onMessageChange: (message: string) => void;
  recipient?: string;
  phone?: string;
}

const NotificationDialog = ({ 
  open, 
  onOpenChange, 
  defaultMessage, 
  onSend, 
  onMessageChange, 
  recipient, 
  phone 
}: NotificationDialogProps) => {
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
            <div>
              <p className="font-medium">Destinatário:</p>
              <p className="text-sm text-muted-foreground">{recipient || 'Não especificado'}</p>
              <p className="text-xs text-muted-foreground">{phone || 'Telefone não disponível'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notification-message" className="text-sm font-medium">
              Mensagem
            </label>
            <Textarea
              id="notification-message"
              placeholder="Digite a mensagem para o adotante..."
              value={defaultMessage}
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
