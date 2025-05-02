
import { useState } from 'react';
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode } from 'lucide-react';
import PaymentTermsAgreement from './PaymentTermsAgreement';
import CreditCardForm from './CreditCardForm';
import PixPaymentForm from './PixPaymentForm';
import PaymentButton from './PaymentButton';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  isProcessing: boolean;
  pixKey?: string;
  contractText?: string;
  followUpPeriod?: number;
  petName?: string;
  adopterName?: string;
  bankData?: {
    bank?: string;
    agency?: string;
    accountNumber?: string;
    accountHolder?: string;
    documentNumber?: string;
  };
}

const PaymentForm = ({ 
  amount, 
  onSuccess, 
  isProcessing, 
  pixKey = '', 
  bankData,
  contractText = '',
  followUpPeriod = 90,
  petName = 'Pet',
  adopterName = 'Adotante'
}: PaymentFormProps) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!acceptedTerms) {
      return;
    }
    
    if (paymentMethod === 'credit-card') {
      const { cardNumber, cardName, expiryDate, cvv } = cardDetails;
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        return;
      }
    }
    
    // Call the success callback
    onSuccess();
  };
  
  const handleCardDetailsChange = (details: typeof cardDetails) => {
    setCardDetails(details);
  };
  
  const handleTermsChange = (accepted: boolean) => {
    setAcceptedTerms(accepted);
  };
  
  const isFormValid = () => {
    if (!acceptedTerms) return false;
    
    if (paymentMethod === 'credit-card') {
      const { cardNumber, cardName, expiryDate, cvv } = cardDetails;
      return Boolean(cardNumber && cardName && expiryDate && cvv);
    }
    
    return true;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Contract agreement */}
        {contractText && (
          <div className="mb-4">
            <PaymentTermsAgreement
              contractText={contractText}
              followUpPeriod={followUpPeriod}
              petName={petName}
              adopterName={adopterName}
              acceptedTerms={acceptedTerms}
              onTermsChange={handleTermsChange}
            />
          </div>
        )}
        
        <Tabs 
          value={paymentMethod} 
          onValueChange={setPaymentMethod}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="credit-card" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Cartão de Crédito
            </TabsTrigger>
            <TabsTrigger value="pix" className="flex items-center" disabled={!pixKey && !bankData}>
              <QrCode className="h-4 w-4 mr-2" />
              PIX/Transferência
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credit-card">
            <CreditCardForm onCardDetailsChange={handleCardDetailsChange} />
          </TabsContent>
          
          <TabsContent value="pix">
            <PixPaymentForm pixKey={pixKey} bankData={bankData} />
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <PaymentButton 
          isProcessing={isProcessing}
          disabled={!isFormValid()}
          paymentMethod={paymentMethod}
          amount={amount}
        />
      </div>
    </form>
  );
};

export default PaymentForm;
