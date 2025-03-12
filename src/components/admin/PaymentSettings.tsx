import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentSettingsType } from './AdminTabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Percent, CreditCard, FileText, Clock, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-sonner";

interface PaymentSettingsProps {
  settings: PaymentSettingsType;
  onSave: (settings: PaymentSettingsType) => void;
}

const PaymentSettings = ({ settings, onSave }: PaymentSettingsProps) => {
  const [adoptionFee, setAdoptionFee] = useState(settings.adoptionFee.toString());
  const [ngoPercentage, setNgoPercentage] = useState(settings.ngoPercentage.toString());
  const [platformPercentage, setPlatformPercentage] = useState(settings.platformPercentage.toString());
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const [contractText, setContractText] = useState(settings.contractText);
  const [followUpPeriod, setFollowUpPeriod] = useState(settings.followUpPeriod.toString());
  const [companyBankInfo, setCompanyBankInfo] = useState(settings.companyBankInfo || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate percentages add up to 100%
    const ngoPercent = parseFloat(ngoPercentage);
    const platformPercent = parseFloat(platformPercentage);
    
    if (ngoPercent + platformPercent !== 100) {
      toast("Porcentagens devem somar 100%", {
        description: "Ajuste os valores para que o total seja 100%."
      });
      return;
    }
    
    // Save settings
    onSave({
      adoptionFee: parseFloat(adoptionFee),
      ngoPercentage: ngoPercent,
      platformPercentage: platformPercent,
      pixKey,
      contractText,
      followUpPeriod: parseInt(followUpPeriod),
      companyBankInfo
    });
    
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Configurações de Pagamento
          </CardTitle>
          <CardDescription>
            Configure os valores, percentuais e dados bancários para taxas de adoção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adoptionFee">Taxa de Adoção Base (R$)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground">R$</span>
                  <Input
                    id="adoptionFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={adoptionFee}
                    onChange={(e) => setAdoptionFee(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ngoPercentage">Porcentagem para ONG (%)</Label>
                <div className="flex">
                  <Input
                    id="ngoPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={ngoPercentage}
                    onChange={(e) => {
                      setNgoPercentage(e.target.value);
                      // Auto-calculate platform percentage
                      const newNgoPercent = parseFloat(e.target.value) || 0;
                      setPlatformPercentage((100 - newNgoPercent).toString());
                    }}
                  />
                  <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformPercentage">Porcentagem para Plataforma (%)</Label>
                <div className="flex">
                  <Input
                    id="platformPercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={platformPercentage}
                    onChange={(e) => {
                      setPlatformPercentage(e.target.value);
                      // Auto-calculate NGO percentage
                      const newPlatformPercent = parseFloat(e.target.value) || 0;
                      setNgoPercentage((100 - newPlatformPercent).toString());
                    }}
                  />
                  <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
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
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="followUpPeriod" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Período de Acompanhamento (dias)
                </Label>
                <Input
                  id="followUpPeriod"
                  type="number"
                  min="0"
                  step="1"
                  value={followUpPeriod}
                  onChange={(e) => setFollowUpPeriod(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Por quanto tempo a ONG acompanhará o animal após a adoção.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contractText" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Texto do Contrato de Compromisso
                </Label>
                <Textarea
                  id="contractText"
                  placeholder="Digite o texto do contrato de compromisso..."
                  value={contractText}
                  onChange={(e) => setContractText(e.target.value)}
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  Este texto será exibido para o adotante antes da confirmação do pagamento.
                </p>
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-6">
              Salvar Configurações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
