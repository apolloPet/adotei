
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CreditCard, Check } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  isProcessing: boolean;
}

const PaymentForm = ({ amount, onSuccess, isProcessing }: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      return;
    }
    
    // Call the success callback
    onSuccess();
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    
    return v;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
            Número do Cartão
          </label>
          <Input
            id="cardNumber"
            placeholder="0000 0000 0000 0000"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            required
            className="font-mono"
          />
        </div>
        
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium mb-1">
            Nome no Cartão
          </label>
          <Input
            id="cardName"
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
              Validade
            </label>
            <Input
              id="expiryDate"
              placeholder="MM/AA"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              maxLength={5}
              required
              className="font-mono"
            />
          </div>
          
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium mb-1">
              CVV
            </label>
            <Input
              id="cvv"
              placeholder="123"
              value={cvv}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCvv(value);
              }}
              maxLength={4}
              required
              className="font-mono"
              type="password"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pagar R$ {amount.toFixed(2)}
              </>
            )}
          </Button>
          
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Ambiente seguro e criptografado
          </p>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
