
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import { FeesSection, BankDetailsSection, ContractSection } from "./payment-settings";
import { getSystemParameters, updateSystemParameter, createSystemParameter } from '@/services/systemParameterService';

const defaultBankAccount = {
  bank: "",
  agency: "",
  accountNumber: "",
  accountHolder: "",
  documentNumber: ""
};

export const PaymentSettings = () => {
  const [settings, setSettings] = useState({
    fees: {
      adoptionFee: 120,
      enableAdoptionFee: true
    },
    bankDetails: {
      pixKey: '',
      companyBankInfo: '',
      ongBankAccount: defaultBankAccount,
      companyBankAccount: defaultBankAccount
    },
    contractDetails: {
      contractText: '',
      followUpPeriod: 90
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getSystemParameters('payment');
        console.log('Fetched payment settings:', data);
        
        if (data && data.length > 0) {
          const newSettings = { ...settings };
          
          data.forEach(param => {
            if (param.key === 'adoption_fee') {
              newSettings.fees.adoptionFee = param.value.amount || 120;
              newSettings.fees.enableAdoptionFee = param.value.enabled || true;
            } else if (param.key === 'payment_details') {
              newSettings.bankDetails.pixKey = param.value.pixKey || '';
              newSettings.bankDetails.companyBankInfo = param.value.bankInfo || '';
              
              // Carregar informações de conta bancária da ONG
              if (param.value.ongBankAccount) {
                newSettings.bankDetails.ongBankAccount = param.value.ongBankAccount;
              }
              
              // Carregar informações de conta bancária da empresa
              if (param.value.companyBankAccount) {
                newSettings.bankDetails.companyBankAccount = param.value.companyBankAccount;
              }
            } else if (param.key === 'contract_details') {
              newSettings.contractDetails.contractText = param.value.text || '';
              newSettings.contractDetails.followUpPeriod = param.value.followUpPeriod || 90;
            }
          });
          
          setSettings(newSettings);
        }
      } catch (err) {
        console.error('Error loading payment settings:', err);
        setError('Erro ao carregar configurações de pagamento.');
        toast.error('Erro ao carregar configurações de pagamento');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const adoptionFeeParam = {
        amount: settings.fees.adoptionFee,
        enabled: settings.fees.enableAdoptionFee
      };
      
      const paymentDetailsParam = {
        pixKey: settings.bankDetails.pixKey,
        bankInfo: settings.bankDetails.companyBankInfo,
        ongBankAccount: settings.bankDetails.ongBankAccount,
        companyBankAccount: settings.bankDetails.companyBankAccount
      };
      
      const contractDetailsParam = {
        text: settings.contractDetails.contractText,
        followUpPeriod: settings.contractDetails.followUpPeriod
      };
      
      console.log('Saving payment details:', paymentDetailsParam);
      
      const existingParams = await getSystemParameters('payment');
      
      const saveParam = async (key: string, value: any, description: string) => {
        const existingParam = existingParams.find(p => p.key === key);
        
        if (existingParam) {
          await updateSystemParameter(existingParam.id, value, description);
        } else {
          await createSystemParameter('payment', key, value, description);
        }
      };
      
      await saveParam('adoption_fee', adoptionFeeParam, 'Configurações de taxa de adoção');
      await saveParam('payment_details', paymentDetailsParam, 'Detalhes bancários para pagamento');
      await saveParam('contract_details', contractDetailsParam, 'Configurações de contrato');
      
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
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-xl">Configurações de Pagamento</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Gerencie taxas, dados bancários e termos contratuais para adoções
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8 p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
              <AlertTriangle className="h-8 w-8 mb-2 text-red-500" />
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <>
              <FeesSection 
                initialFees={settings.fees} 
                onFeesChange={(fees) => setSettings(prev => ({ ...prev, fees }))}
              />
              
              <div className="border-t pt-6"></div>
              
              <BankDetailsSection 
                initialBankDetails={settings.bankDetails}
                onBankDetailsChange={(bankDetails) => setSettings(prev => ({ ...prev, bankDetails }))}
              />
              
              <div className="border-t pt-6"></div>
              
              <ContractSection 
                initialContractDetails={settings.contractDetails}
                onContractDetailsChange={(contractDetails) => setSettings(prev => ({ ...prev, contractDetails }))}
              />
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
