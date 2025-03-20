
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface ContractDetailsProps {
  contractText: string;
  followUpPeriod: number;
}

interface ContractSectionProps {
  initialContractDetails: ContractDetailsProps;
  onContractDetailsChange: (contractDetails: ContractDetailsProps) => void;
}

const ContractSection = ({ initialContractDetails, onContractDetailsChange }: ContractSectionProps) => {
  const [contractText, setContractText] = useState(initialContractDetails.contractText);
  const [followUpPeriod, setFollowUpPeriod] = useState(initialContractDetails.followUpPeriod);

  // Update parent component when values change
  useEffect(() => {
    onContractDetailsChange({
      contractText,
      followUpPeriod
    });
  }, [contractText, followUpPeriod, onContractDetailsChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Termos do Contrato</h3>
      
      <div className="space-y-2">
        <Label htmlFor="contractText">Texto do Contrato de Adoção</Label>
        <Textarea
          id="contractText"
          value={contractText}
          onChange={(e) => setContractText(e.target.value)}
          placeholder="Termos e condições para a adoção..."
          rows={6}
        />
        <p className="text-sm text-muted-foreground">
          Este texto será exibido para os adotantes no momento da confirmação da adoção.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Período de Acompanhamento</Label>
          <span className="text-sm text-muted-foreground">{followUpPeriod} dias</span>
        </div>
        <Slider
          value={[followUpPeriod]}
          onValueChange={(values) => setFollowUpPeriod(values[0])}
          min={30}
          max={180}
          step={15}
        />
        <p className="text-sm text-muted-foreground">
          Período durante o qual a ONG realizará visitas de acompanhamento após a adoção.
        </p>
      </div>
    </div>
  );
};

export default ContractSection;
