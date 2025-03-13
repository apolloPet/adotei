
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Clock } from "lucide-react";

interface ContractSectionProps {
  initialContractDetails: {
    contractText: string;
    followUpPeriod: number;
  };
  onContractDetailsChange: (contractDetails: {
    contractText: string;
    followUpPeriod: number;
  }) => void;
}

const ContractSection = ({ initialContractDetails, onContractDetailsChange }: ContractSectionProps) => {
  const [contractText, setContractText] = useState(initialContractDetails.contractText);
  const [followUpPeriod, setFollowUpPeriod] = useState(initialContractDetails.followUpPeriod.toString());

  useEffect(() => {
    onContractDetailsChange({
      contractText,
      followUpPeriod: parseInt(followUpPeriod) || 0
    });
  }, [contractText, followUpPeriod, onContractDetailsChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="followUpPeriod" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Período de Acompanhamento (dias)
        </Label>
        <Input
          id="followUpPeriod"
          type="number"
          min="0"
          step="1"
          value={followUpPeriod}
          onChange={(e) => setFollowUpPeriod(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Por quanto tempo a ONG acompanhará o animal após a adoção.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="contractText" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Texto do Contrato de Compromisso
        </Label>
        <Textarea
          id="contractText"
          placeholder="Digite o texto do contrato de compromisso..."
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          rows={8}
        />
        <p className="text-sm text-muted-foreground">
          Este texto será exibido para o adotante antes da confirmação do pagamento.
        </p>
      </div>
    </div>
  );
};

export default ContractSection;
