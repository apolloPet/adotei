
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PaymentForm from '../components/payment/PaymentForm';
import PaymentInfoSidebar from '../components/payment/PaymentInfoSidebar';
import PaymentNotFound from '../components/payment/PaymentNotFound';
import { getAdoptionById, getAdminSettings, processPayment } from '../services/payment';
import { toast } from '@/hooks/use-sonner';
import { getSystemParameters } from '@/services/systemParameterService';

const PaymentProcess = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [adoption, setAdoption] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!id) {
          setNotFound(true);
          return;
        }
        
        // Carregar dados da adoção
        const adoptionData = await getAdoptionById(id);
        if (!adoptionData) {
          setNotFound(true);
          return;
        }
        
        setAdoption(adoptionData);
        
        // Carregar configurações do sistema
        const systemParams = await getSystemParameters('payment');
        const settingsData = {
          adoptionFee: 120,
          ngoPercentage: 90,
          platformPercentage: 10,
          pixKey: "",
          contractText: "",
          followUpPeriod: 90,
          bankData: null
        };
        
        if (systemParams && systemParams.length > 0) {
          const feeParam = systemParams.find(p => p.key === 'adoption_fee');
          if (feeParam) {
            settingsData.adoptionFee = feeParam.value.amount || 120;
          }
          
          const paymentDetailsParam = systemParams.find(p => p.key === 'payment_details');
          if (paymentDetailsParam) {
            settingsData.pixKey = paymentDetailsParam.value.pixKey || "";
            
            // Carregar informações da conta bancária se disponível
            if (paymentDetailsParam.value.ongBankAccount) {
              settingsData.bankData = paymentDetailsParam.value.ongBankAccount;
            }
          }
          
          const contractDetailsParam = systemParams.find(p => p.key === 'contract_details');
          if (contractDetailsParam) {
            settingsData.contractText = contractDetailsParam.value.text || "";
            settingsData.followUpPeriod = contractDetailsParam.value.followUpPeriod || 90;
          }
        }
        
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading payment data:', error);
        toast.error('Erro ao carregar informações de pagamento');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handlePaymentSuccess = async () => {
    try {
      setIsProcessing(true);
      
      if (!id) return;
      
      // Processa o pagamento com os parâmetros padrão
      const success = await processPayment(id);
      
      if (success) {
        toast.success('Pagamento processado com sucesso!');
        navigate('/adoption/success');
      } else {
        toast.error('Erro ao processar pagamento');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (notFound) {
    return <PaymentNotFound />;
  }
  
  return (
    <Container className="py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Finalizar Adoção</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Pagamento da Taxa de Adoção</CardTitle>
                  <CardDescription>
                    Realize o pagamento da taxa de adoção para finalizar o processo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentForm 
                    amount={settings?.adoptionFee || 120}
                    pixKey={settings?.pixKey}
                    bankData={settings?.bankData}
                    contractText={settings?.contractText}
                    followUpPeriod={settings?.followUpPeriod}
                    petName={adoption?.petName}
                    adopterName={adoption?.userName}
                    onSuccess={handlePaymentSuccess}
                    isProcessing={isProcessing}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-1">
              {adoption && settings && (
                <PaymentInfoSidebar 
                  adoption={{
                    petName: adoption.petName || "Pet",
                    fee: settings.adoptionFee || 120,
                    userName: adoption.userName
                  }}
                  fee={settings.adoptionFee || 120}
                  ngoPercentage={settings.ngoPercentage || 90}
                  platformPercentage={settings.platformPercentage || 10}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default PaymentProcess;
