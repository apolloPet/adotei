
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Check, QrCode } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdoptionTermsPDF from "@/components/adoption/AdoptionTermsPDF";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  isProcessing: boolean;
  pixKey?: string; // Optional PIX key
  contractText?: string; // Optional contract text
  followUpPeriod?: number; // Optional follow-up period
  petName?: string;
  adopterName?: string;
}

const PaymentForm = ({ 
  amount, 
  onSuccess, 
  isProcessing, 
  pixKey = '', 
  contractText = '',
  followUpPeriod = 90,
  petName = 'Pet',
  adopterName = 'Adotante'
}: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!acceptedTerms) {
      return;
    }
    
    if (paymentMethod === 'credit-card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        return;
      }
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
  
  // Generate a PIX QR code
  const generatePixQrCode = () => {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAADkAQMAAAAjexcCAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADZJREFUWIXtzrENACAQw8A8gMT+IzIBVGn4BReZbGXtJJWkywMAAAAAAAAAAAAAAADwgyR99QCVsQQHdjG0KAAAAABJRU5ErkJggg==";
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Contract agreement */}
        {contractText && (
          <div className="mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm mb-4 max-h-40 overflow-auto p-2 bg-muted/30 rounded border">
                  <h4 className="font-semibold mb-2">Termos de Compromisso</h4>
                  <p className="whitespace-pre-line">{contractText}</p>
                  {followUpPeriod > 0 && (
                    <p className="mt-2 font-medium">
                      Período de acompanhamento: {followUpPeriod} dias após a adoção.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Eu li e concordo com os termos de compromisso
                  </Label>
                </div>
                
                <div className="mt-4">
                  <AdoptionTermsPDF 
                    petName={petName}
                    adopterName={adopterName}
                    followUpPeriod={followUpPeriod}
                    contractText={contractText}
                    adoptionDate={new Date()}
                    petType="animal de estimação"
                    adopterDocument=""
                    adopterAddress=""
                  />
                </div>
              </CardContent>
            </Card>
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
            <TabsTrigger value="pix" className="flex items-center" disabled={!pixKey}>
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="credit-card">
            <div>
              <Label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Número do Cartão
              </Label>
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
            
            <div className="mt-4">
              <Label htmlFor="cardName" className="block text-sm font-medium mb-1">
                Nome no Cartão
              </Label>
              <Input
                id="cardName"
                placeholder="NOME COMO ESTÁ NO CARTÃO"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="expiryDate" className="block text-sm font-medium mb-1">
                  Validade
                </Label>
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
                <Label htmlFor="cvv" className="block text-sm font-medium mb-1">
                  CVV
                </Label>
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
          </TabsContent>
          
          <TabsContent value="pix">
            {pixKey && (
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-center mb-4">
                  Escaneie o QR Code abaixo com o aplicativo do seu banco para pagar com PIX:
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <img 
                    src={generatePixQrCode()} 
                    alt="QR Code PIX" 
                    className="w-48 h-48"
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center max-w-xs">
                  <p>Após o pagamento, clique no botão abaixo para confirmar a adoção.</p>
                  <p className="mt-2">Chave PIX: {pixKey}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="mt-6">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !acceptedTerms}
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
      </div>
    </form>
  );
};

export default PaymentForm;
