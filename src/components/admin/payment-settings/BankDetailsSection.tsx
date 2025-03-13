
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Building2 } from "lucide-react";

interface BankDetailsSectionProps {
  initialBankDetails: {
    pixKey: string;
    companyBankInfo: string;
  };
  onBankDetailsChange: (bankDetails: {
    pixKey: string;
    companyBankInfo: string;
  }) => void;
}

const BankDetailsSection = ({ initialBankDetails, onBankDetailsChange }: BankDetailsSectionProps) => {
  const [pixKey, setPixKey] = useState(initialBankDetails.pixKey);
  const [companyBankInfo, setCompanyBankInfo] = useState(initialBankDetails.companyBankInfo);

  useEffect(() => {
    onBankDetailsChange({
      pixKey,
      companyBankInfo
    });
  }, [pixKey, companyBankInfo, onBankDetailsChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyBankInfo" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Dados Bancários da Empresa
        </Label>
        <Textarea
          id="companyBankInfo"
          placeholder="Digite os dados bancários da empresa para transferências automáticas..."
          value={companyBankInfo}
          onChange={(e) => setCompanyBankInfo(e.target.value)}
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Estas informações serão usadas para transferências automáticas da porcentagem da plataforma.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pixKey" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Chave PIX da ONG
        </Label>
        <Input
          id="pixKey"
          placeholder="CPF, CNPJ, email ou chave aleatória"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Esta chave será usada para transferências via PIX para a ONG.
        </p>
      </div>
    </div>
  );
};

export default BankDetailsSection;
