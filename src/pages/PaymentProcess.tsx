
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-sonner";
import PaymentForm from "@/components/payment/PaymentForm";
import PaymentSummary from '@/components/payment/PaymentSummary';
import PaymentInfoSidebar from '@/components/payment/PaymentInfoSidebar';
import PaymentNotFound from '@/components/payment/PaymentNotFound';
import { getAdoptionById, getAdminSettings, processPayment } from '@/services/paymentService';

const PaymentProcess = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState(getAdminSettings());
  
  // Find adoption details
  const adoption = matchId ? getAdoptionById(matchId) : null;
  
  // Get admin settings
  useEffect(() => {
    // In a real app, this would be an API call
    setSettings(getAdminSettings());
  }, []);
  
  if (!adoption) {
    return <PaymentNotFound />;
  }
  
  const handlePaymentSuccess = () => {
    setIsProcessing(true);
    
    // Process payment
    processPayment(adoption.id).then(() => {
      setIsProcessing(false);
      setIsPaymentComplete(true);
      
      toast.success("Contribuição confirmada!", {
        description: "Obrigado pelo seu apoio. Sua adoção foi confirmada."
      });
    });
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
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Finalizar Adoção</CardTitle>
              <CardDescription>
                Complete o processo com sua contribuição de apoio
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <PaymentSummary 
                adoption={adoption} 
                settings={settings} 
                isPaymentComplete={isPaymentComplete} 
              />
              
              {!isPaymentComplete && (
                <PaymentForm 
                  amount={adoption.fee} 
                  onSuccess={handlePaymentSuccess}
                  isProcessing={isProcessing}
                  pixKey={settings.pixKey}
                  contractText={settings.contractText}
                  followUpPeriod={settings.followUpPeriod}
                  petName={adoption.petName}
                  adopterName={adoption.userName}
                />
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <PaymentInfoSidebar />
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
