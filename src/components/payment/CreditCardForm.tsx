
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreditCardFormProps {
  onCardDetailsChange: (details: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
  }) => void;
}

const CreditCardForm = ({ onCardDetailsChange }: CreditCardFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
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
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
    updateCardDetails(formattedValue, cardName, expiryDate, cvv);
  };
  
  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCardName(value);
    updateCardDetails(cardNumber, value, expiryDate, cvv);
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setExpiryDate(formattedValue);
    updateCardDetails(cardNumber, cardName, formattedValue, cvv);
  };
  
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvv(value);
    updateCardDetails(cardNumber, cardName, expiryDate, value);
  };
  
  const updateCardDetails = (
    cardNumber: string,
    cardName: string,
    expiryDate: string,
    cvv: string
  ) => {
    onCardDetailsChange({
      cardNumber,
      cardName,
      expiryDate,
      cvv
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
          Número do Cartão
        </Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={handleCardNumberChange}
          maxLength={19}
          required
          className="font-mono"
        />
      </div>
      
      <div>
        <Label htmlFor="cardName" className="block text-sm font-medium mb-1">
          Nome no Cartão
        </Label>
        <Input
          id="cardName"
          placeholder="NOME COMO ESTÁ NO CARTÃO"
          value={cardName}
          onChange={handleCardNameChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
            Validade
          </Label>
          <Input
            id="expiryDate"
            placeholder="MM/AA"
            value={expiryDate}
            onChange={handleExpiryDateChange}
            maxLength={5}
            required
            className="font-mono"
          />
        </div>
        
        <div>
          <Label htmlFor="cvv" className="block text-sm font-medium mb-1">
            CVV
          </Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={handleCvvChange}
            maxLength={4}
            required
            className="font-mono"
            type="password"
          />
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
