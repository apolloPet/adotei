
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { FeesSection, BankDetailsSection, ContractSection } from "./payment-settings";
import type { PaymentSettingsProps } from "./payment-settings";

export const PaymentSettings = ({ settings, onSaveSettings }: PaymentSettingsProps) => {
  const [fees, setFees] = useState(settings.fees);
  const [bankDetails, setBankDetails] = useState(settings.bankDetails);
  const [contractDetails, setContractDetails] = useState(settings.contractDetails);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // In a real app, you would save the settings to your backend here
      // Simulating a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSettings = {
        fees,
        bankDetails,
        contractDetails
      };
      
      onSaveSettings(newSettings);
      toast.success("Configurações de pagamento salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações de pagamento. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Configurações de Pagamento</CardTitle>
              <CardDescription>
                Gerencie taxas, dados bancários e termos contratuais para adoções
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <FeesSection 
            initialFees={fees} 
            onFeesChange={setFees}
          />
          
          <div className="border-t pt-6"></div>
          
          <BankDetailsSection 
            initialBankDetails={bankDetails}
            onBankDetailsChange={setBankDetails}
          />
          
          <div className="border-t pt-6"></div>
          
          <ContractSection 
            initialContractDetails={contractDetails}
            onContractDetailsChange={setContractDetails}
          />
          
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
