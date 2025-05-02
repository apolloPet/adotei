
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BanknoteIcon, CreditCard, QrCode } from "lucide-react";

interface BankAccount {
  bank: string;
  agency: string;
  accountNumber: string;
  accountHolder: string;
  documentNumber: string; // CPF/CNPJ
}

interface BankDetailsProps {
  pixKey: string;
  companyBankInfo: string;
  ongBankAccount: BankAccount;
  companyBankAccount: BankAccount;
}

interface BankDetailsSectionProps {
  initialBankDetails: BankDetailsProps;
  onBankDetailsChange: (bankDetails: BankDetailsProps) => void;
}

const defaultBankAccount = {
  bank: "",
  agency: "",
  accountNumber: "",
  accountHolder: "",
  documentNumber: ""
};

const BankDetailsSection = ({ initialBankDetails, onBankDetailsChange }: BankDetailsSectionProps) => {
  const [pixKey, setPixKey] = useState(initialBankDetails.pixKey || "");
  const [companyBankInfo, setCompanyBankInfo] = useState(initialBankDetails.companyBankInfo || "");
  const [ongBankAccount, setOngBankAccount] = useState<BankAccount>(
    initialBankDetails.ongBankAccount || defaultBankAccount
  );
  const [companyBankAccount, setCompanyBankAccount] = useState<BankAccount>(
    initialBankDetails.companyBankAccount || defaultBankAccount
  );
  const [ongPaymentMethod, setOngPaymentMethod] = useState("pix");
  const [companyPaymentMethod, setCompanyPaymentMethod] = useState("pix");

  // Update parent component when values change
  useEffect(() => {
    onBankDetailsChange({
      pixKey,
      companyBankInfo,
      ongBankAccount,
      companyBankAccount
    });
  }, [pixKey, companyBankInfo, ongBankAccount, companyBankAccount, onBankDetailsChange]);

  const handleOngBankAccountChange = (field: keyof BankAccount, value: string) => {
    setOngBankAccount({
      ...ongBankAccount,
      [field]: value
    });
  };

  const handleCompanyBankAccountChange = (field: keyof BankAccount, value: string) => {
    setCompanyBankAccount({
      ...companyBankAccount,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Dados Bancários</h3>
      
      {/* ONG Payment Information */}
      <div className="space-y-4">
        <h4 className="font-medium">Recebimento pela ONG</h4>
        <Tabs value={ongPaymentMethod} onValueChange={setOngPaymentMethod} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pix" className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center">
              <BanknoteIcon className="h-4 w-4 mr-2" />
              Conta Bancária
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pix">
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX da ONG</Label>
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
          </TabsContent>
          
          <TabsContent value="bank">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="ong-bank">Nome do Banco</Label>
                  <Input
                    id="ong-bank"
                    value={ongBankAccount.bank}
                    onChange={(e) => handleOngBankAccountChange('bank', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ong-agency">Agência</Label>
                    <Input
                      id="ong-agency"
                      value={ongBankAccount.agency}
                      onChange={(e) => handleOngBankAccountChange('agency', e.target.value)}
                      placeholder="Sem dígito"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ong-account">Conta</Label>
                    <Input
                      id="ong-account"
                      value={ongBankAccount.accountNumber}
                      onChange={(e) => handleOngBankAccountChange('accountNumber', e.target.value)}
                      placeholder="Com dígito"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ong-holder">Nome do Titular</Label>
                  <Input
                    id="ong-holder"
                    value={ongBankAccount.accountHolder}
                    onChange={(e) => handleOngBankAccountChange('accountHolder', e.target.value)}
                    placeholder="Nome conforme aparece no banco"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ong-document">CPF/CNPJ do Titular</Label>
                  <Input
                    id="ong-document"
                    value={ongBankAccount.documentNumber}
                    onChange={(e) => handleOngBankAccountChange('documentNumber', e.target.value)}
                    placeholder="Apenas números"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Company Payment Information */}
      <div className="space-y-4 pt-4">
        <h4 className="font-medium">Recebimento pela Empresa (Plataforma)</h4>
        <Tabs value={companyPaymentMethod} onValueChange={setCompanyPaymentMethod} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="pix" className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              PIX
            </TabsTrigger>
            <TabsTrigger value="bank" className="flex items-center">
              <BanknoteIcon className="h-4 w-4 mr-2" />
              Conta Bancária
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pix">
            <div className="space-y-2">
              <Label htmlFor="companyBankInfo">Informações de PIX da Empresa</Label>
              <Textarea
                id="companyBankInfo"
                value={companyBankInfo}
                onChange={(e) => setCompanyBankInfo(e.target.value)}
                placeholder="Chave PIX da empresa"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Estas informações serão utilizadas para a porcentagem da empresa sobre as taxas de adoção.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="bank">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="company-bank">Nome do Banco</Label>
                  <Input
                    id="company-bank"
                    value={companyBankAccount.bank}
                    onChange={(e) => handleCompanyBankAccountChange('bank', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-agency">Agência</Label>
                    <Input
                      id="company-agency"
                      value={companyBankAccount.agency}
                      onChange={(e) => handleCompanyBankAccountChange('agency', e.target.value)}
                      placeholder="Sem dígito"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-account">Conta</Label>
                    <Input
                      id="company-account"
                      value={companyBankAccount.accountNumber}
                      onChange={(e) => handleCompanyBankAccountChange('accountNumber', e.target.value)}
                      placeholder="Com dígito"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-holder">Nome do Titular</Label>
                  <Input
                    id="company-holder"
                    value={companyBankAccount.accountHolder}
                    onChange={(e) => handleCompanyBankAccountChange('accountHolder', e.target.value)}
                    placeholder="Nome conforme aparece no banco"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-document">CPF/CNPJ do Titular</Label>
                  <Input
                    id="company-document"
                    value={companyBankAccount.documentNumber}
                    onChange={(e) => handleCompanyBankAccountChange('documentNumber', e.target.value)}
                    placeholder="Apenas números"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BankDetailsSection;
