
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { PaymentSettingsType } from './AdminTabs';
import { FeesSection, BankDetailsSection, ContractSection } from './payment-settings';

interface PaymentSettingsProps {
  settings: PaymentSettingsType;
  onSave: (settings: PaymentSettingsType) => void;
}

const PaymentSettings = ({ settings, onSave }: PaymentSettingsProps) => {
  const [formData, setFormData] = useState<PaymentSettingsType>({
    ...settings,
    companyBankInfo: settings.companyBankInfo || ''
  });
  
  const handleFeesChange = (fees: {
    adoptionFee: number;
    ngoPercentage: number;
    platformPercentage: number;
  }) => {
    setFormData(prev => ({ ...prev, ...fees }));
  };

  const handleBankDetailsChange = (bankDetails: {
    pixKey: string;
    companyBankInfo: string;
  }) => {
    setFormData(prev => ({ ...prev, ...bankDetails }));
  };

  const handleContractDetailsChange = (contractDetails: {
    contractText: string;
    followUpPeriod: number;
  }) => {
    setFormData(prev => ({ ...prev, ...contractDetails }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate percentages add up to 100%
    const { ngoPercentage, platformPercentage } = formData;
    
    if (ngoPercentage + platformPercentage !== 100) {
      toast("Porcentagens devem somar 100%", {
        description: "Ajuste os valores para que o total seja 100%."
      });
      return;
    }
    
    // Save settings
    onSave(formData);
    
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configurações de Pagamento
          </CardTitle>
          <CardDescription>
            Configure os valores, percentuais e dados bancários para taxas de adoção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FeesSection 
              initialFees={{
                adoptionFee: settings.adoptionFee,
                ngoPercentage: settings.ngoPercentage,
                platformPercentage: settings.platformPercentage
              }}
              onFeesChange={handleFeesChange}
            />
            
            <Separator className="my-4" />
            
            <BankDetailsSection 
              initialBankDetails={{
                pixKey: settings.pixKey,
                companyBankInfo: settings.companyBankInfo || ''
              }}
              onBankDetailsChange={handleBankDetailsChange}
            />
            
            <Separator className="my-4" />
            
            <ContractSection 
              initialContractDetails={{
                contractText: settings.contractText,
                followUpPeriod: settings.followUpPeriod
              }}
              onContractDetailsChange={handleContractDetailsChange}
            />
            
            <Button type="submit" className="w-full mt-6">
              Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
