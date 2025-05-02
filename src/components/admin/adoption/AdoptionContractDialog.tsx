
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getAdminSettings } from '@/services/paymentService';
import { AdoptionMatch } from './types';

interface AdoptionContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: AdoptionMatch;
  onComplete: (matchId: string, contractSigned: boolean, paymentComplete: boolean) => void;
}

const AdoptionContractDialog = ({
  open,
  onOpenChange,
  match,
  onComplete
}: AdoptionContractDialogProps) => {
  const [contractSigned, setContractSigned] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [settings, setSettings] = useState({
    adoptionFee: 120,
    ngoPercentage: 90,
    platformPercentage: 10,
    pixKey: "",
    contractText: "Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.",
    followUpPeriod: 90
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await getAdminSettings();
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleConfirm = () => {
    onComplete(match.id, contractSigned, paymentComplete);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Finalizar Adoção</DialogTitle>
          <DialogDescription>
            Confirme os detalhes finais da adoção de {match.petName} por {match.userName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-base font-medium">Termos de Adoção</h3>
            <div className="p-4 bg-muted rounded-md text-sm max-h-[150px] overflow-y-auto">
              {settings.contractText}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="contract" 
                checked={contractSigned} 
                onCheckedChange={(checked) => setContractSigned(!!checked)} 
              />
              <label htmlFor="contract" className="text-sm font-medium">
                Contrato assinado pelo adotante
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-base font-medium">Taxa de Adoção</h3>
            <div className="p-4 bg-muted rounded-md text-sm">
              <p>Taxa de adoção: R$ {settings.adoptionFee.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {settings.ngoPercentage}% para a ONG, {settings.platformPercentage}% para a plataforma
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="payment" 
                checked={paymentComplete} 
                onCheckedChange={(checked) => setPaymentComplete(!!checked)} 
              />
              <label htmlFor="payment" className="text-sm font-medium">
                Pagamento da taxa de adoção realizado
              </label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirm}
            disabled={!contractSigned}
          >
            Finalizar Adoção
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdoptionContractDialog;
