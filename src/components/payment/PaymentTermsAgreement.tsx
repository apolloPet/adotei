
import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import AdoptionTermsPDF from "@/components/adoption/AdoptionTermsPDF";

interface PaymentTermsAgreementProps {
  contractText: string;
  followUpPeriod: number;
  petName: string;
  adopterName: string;
  acceptedTerms: boolean;
  onTermsChange: (accepted: boolean) => void;
}

const PaymentTermsAgreement = ({ 
  contractText, 
  followUpPeriod, 
  petName, 
  adopterName, 
  acceptedTerms, 
  onTermsChange 
}: PaymentTermsAgreementProps) => {
  if (!contractText) return null;
  
  return (
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
            onCheckedChange={(checked) => onTermsChange(checked === true)}
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
  );
};

export default PaymentTermsAgreement;
