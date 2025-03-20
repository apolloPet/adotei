
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BankDetailsProps {
  pixKey: string;
  companyBankInfo: string;
}

interface BankDetailsSectionProps {
  initialBankDetails: BankDetailsProps;
  onBankDetailsChange: (bankDetails: BankDetailsProps) => void;
}

const BankDetailsSection = ({ initialBankDetails, onBankDetailsChange }: BankDetailsSectionProps) => {
  const [pixKey, setPixKey] = useState(initialBankDetails.pixKey);
  const [companyBankInfo, setCompanyBankInfo] = useState(initialBankDetails.companyBankInfo);

  // Update parent component when values change
  useEffect(() => {
    onBankDetailsChange({
      pixKey,
      companyBankInfo
    });
  }, [pixKey, companyBankInfo, onBankDetailsChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Dados Bancários</h3>
      
      <div className="space-y-2">
        <Label htmlFor="pixKey">Chave PIX</Label>
        <Input
          id="pixKey"
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          placeholder="CPF, CNPJ, telefone, e-mail ou chave aleatória"
        />
        <p className="text-sm text-muted-foreground">
          A chave PIX será utilizada para receber os pagamentos das taxas de adoção.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyBankInfo">Informações Bancárias Adicionais</Label>
        <Textarea
          id="companyBankInfo"
          value={companyBankInfo}
          onChange={(e) => setCompanyBankInfo(e.target.value)}
          placeholder="Banco, agência, conta, etc."
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Estas informações serão utilizadas como alternativa para pagamentos que não são realizados via PIX.
        </p>
      </div>
    </div>
  );
};

export default BankDetailsSection;
