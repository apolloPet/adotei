
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdoptionTermsPDF from '@/components/adoption/AdoptionTermsPDF';
import { AdoptionMatch } from './types';
import { toast } from '@/hooks/use-sonner';

interface AdoptionContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch | null;
}

const AdoptionContractDialog = ({ open, onOpenChange, match }: AdoptionContractDialogProps) => {
  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Contrato de Adoção</DialogTitle>
          <DialogDescription>
            Termo de responsabilidade para adoção de animal
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
          
          <div className="border p-4 rounded bg-muted/20 max-h-[300px] overflow-y-auto">
            <h3 className="text-sm font-medium mb-2">Visualização do Contrato:</h3>
            <p className="text-xs text-muted-foreground italic mb-4">
              Este contrato será enviado para o email do adotante após a finalização do processo.
            </p>
            
            <div className="space-y-2 text-sm">
              <p className="font-semibold">TERMO DE RESPONSABILIDADE E COMPROMISSO DE ADOÇÃO</p>
              <p>Data: {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p>Nome do Adotante: {match.userName}</p>
              <p>Email: {match.userEmail}</p>
              <p>Telefone: {match.userPhone}</p>
              <p>Nome do Animal: {match.petName}</p>
              
              <p className="mt-4">
                O adotante se compromete a cuidar do animal adotado, fornecendo abrigo, 
                alimentação adequada, cuidados veterinários e carinho. Concordo em permitir 
                visitas de acompanhamento pelo período estabelecido e em não abandonar ou 
                maltratar o animal sob quaisquer circunstâncias.
              </p>
              
              <div className="mt-4 p-3 bg-primary-50 rounded border border-primary-100">
                <p className="font-medium text-xs">Valor da Taxa de Adoção: R$ 50,00</p>
                <p className="text-xs text-muted-foreground">
                  A taxa de adoção ajuda a cobrir custos de cuidados veterinários e manutenção da ONG.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <AdoptionTermsPDF 
              petName={match.petName}
              adopterName={match.userName}
              adopterDocument="000.000.000-00"
              adopterAddress="Endereço do adotante"
              followUpPeriod={90}
              adoptionDate={new Date()}
              petType="animal de estimação"
              contractText={`Eu, ${match.userName}, me comprometo a cuidar do animal ${match.petName} adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período de 90 dias estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias.`}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => {
            toast.success("Adoção finalizada! Contrato enviado por email.");
            onOpenChange(false);
          }}>
            Finalizar Adoção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdoptionContractDialog;
