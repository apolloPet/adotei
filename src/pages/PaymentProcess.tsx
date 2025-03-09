
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, CreditCard, DollarSign, ArrowLeft, Info, Percent } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import PaymentForm from "@/components/payment/PaymentForm";

// Mock data for the adoption details
const mockAdoptions = [
  {
    id: "1",
    petName: "Luna",
    petImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1027&q=80",
    shelter: "ONG Amigos dos Animais",
    fee: 120,
    status: 'pending',
  },
  {
    id: "2",
    petName: "Max",
    petImage: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80",
    shelter: "ONG Patinhas Carentes",
    fee: 150,
    status: 'pending',
  },
];

// Mock admin settings
const mockSettings = {
  adoptionFee: 120,
  ngoPercentage: 90,
  platformPercentage: 10,
  pixKey: "ong@example.com",
  contractText: "Eu, adotante, me comprometo a cuidar do animal adotado, fornecendo abrigo, alimentação adequada, cuidados veterinários e carinho. Concordo em permitir visitas de acompanhamento pelo período estabelecido e em não abandonar ou maltratar o animal sob quaisquer circunstâncias. Entendo que o animal é um ser senciente e merece respeito e amor.",
  followUpPeriod: 90
};

const PaymentProcess = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState(mockSettings);
  
  // Find adoption details
  const adoption = mockAdoptions.find(a => a.id === matchId);
  
  // Mock API call to get admin settings
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll just use the mock data
    setSettings(mockSettings);
  }, []);
  
  if (!adoption) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Info className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Adoção não encontrada</h2>
        <p className="text-muted-foreground mb-6">Os detalhes desta adoção não foram encontrados.</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }
  
  const ngoAmount = adoption.fee * (settings.ngoPercentage / 100); 
  const platformFee = adoption.fee * (settings.platformPercentage / 100);
  
  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentComplete(true);
      
      toast.success("Pagamento realizado com sucesso!", {
        description: "Sua adoção foi confirmada. Aguarde contato da ONG."
      });
    }, 2000);
  };
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Payment summary column */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Finalizar Adoção</CardTitle>
              <CardDescription>Pague a taxa de adoção para confirmar o processo</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-20 w-20 overflow-hidden rounded-md">
                  <img 
                    src={adoption.petImage} 
                    alt={adoption.petName} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{adoption.petName}</h3>
                  <p className="text-muted-foreground">{adoption.shelter}</p>
                  {isPaymentComplete ? (
                    <Badge className="mt-1 bg-green-600">Adoção Confirmada</Badge>
                  ) : (
                    <Badge variant="outline" className="mt-1">Aguardando Pagamento</Badge>
                  )}
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Taxa de adoção</span>
                  <span>R$ {adoption.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 inline" />
                    Destinado à ONG ({settings.ngoPercentage}%)
                  </span>
                  <span>R$ {ngoAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 inline" />
                    Taxa de plataforma ({settings.platformPercentage}%)
                  </span>
                  <span>R$ {platformFee.toFixed(2)}</span>
                </div>
              </div>
              
              {isPaymentComplete ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                    <h4 className="font-medium text-green-600 dark:text-green-400">Pagamento confirmado</h4>
                  </div>
                  <p className="mt-2 text-sm text-green-600/80 dark:text-green-400/80">
                    Agradecemos sua contribuição! A ONG entrará em contato para os próximos passos da adoção.
                  </p>
                </div>
              ) : (
                <PaymentForm 
                  amount={adoption.fee} 
                  onSuccess={handlePaymentSuccess}
                  isProcessing={isProcessing}
                  pixKey={settings.pixKey}
                  contractText={settings.contractText}
                  followUpPeriod={settings.followUpPeriod}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Info panel column */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações sobre a Taxa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Para que serve a taxa?
                </h4>
                <p className="text-muted-foreground">
                  A taxa de adoção ajuda a cobrir despesas com vacinas, castração, microchipagem e cuidados médicos que o pet recebeu.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 flex items-center">
                  <Percent className="h-4 w-4 mr-1" />
                  Como o valor é dividido?
                </h4>
                <p className="text-muted-foreground">
                  {settings.ngoPercentage}% do valor vai diretamente para a ONG responsável pelo pet, e {settings.platformPercentage}% ajuda a manter nossa plataforma funcionando.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Pagamento seguro
                </h4>
                <p className="text-muted-foreground">
                  Usamos criptografia e os mais altos padrões de segurança para proteger suas informações de pagamento.
                </p>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={() => window.open('/how-it-works', '_blank')}>
                  Saiba mais sobre o processo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
