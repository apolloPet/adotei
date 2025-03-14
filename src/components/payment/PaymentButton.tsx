
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode } from 'lucide-react';

interface PaymentButtonProps {
  isProcessing: boolean;
  disabled: boolean;
  paymentMethod: string;
  amount: number;
}

const PaymentButton = ({ 
  isProcessing, 
  disabled, 
  paymentMethod, 
  amount 
}: PaymentButtonProps) => {
  return (
    <div className="mt-6">
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isProcessing || disabled}
      >
        {isProcessing ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
            Processando...
          </>
        ) : (
          <>
            {paymentMethod === 'credit-card' ? (
              <CreditCard className="mr-2 h-4 w-4" />
            ) : (
              <QrCode className="mr-2 h-4 w-4" />
            )}
            Contribuir com a Taxa de Apoio: R$ {amount.toFixed(2)}
          </>
        )}
      </Button>
      
      <p className="text-xs text-center mt-2 text-muted-foreground">
        Ambiente seguro e criptografado
      </p>
    </div>
  );
};

export default PaymentButton;
