
import { QrCode, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PixPaymentFormProps {
  pixKey?: string;
  bankData?: {
    bank?: string;
    agency?: string;
    accountNumber?: string;
    accountHolder?: string;
    documentNumber?: string;
  };
}

const PixPaymentForm = ({ pixKey, bankData }: PixPaymentFormProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={pixKey ? "pix" : "bank"} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="pix" disabled={!pixKey} className="flex items-center">
            <QrCode className="h-4 w-4 mr-2" />
            PIX
          </TabsTrigger>
          <TabsTrigger value="bank" disabled={!bankData} className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Transferência
          </TabsTrigger>
        </TabsList>
        
        {pixKey && (
          <TabsContent value="pix">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="bg-gray-100 rounded-md p-4 mx-auto w-48 h-48 flex items-center justify-center">
                    <QrCode className="h-32 w-32 text-gray-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Chave PIX:</p>
                    <div className="bg-gray-100 rounded p-2 flex items-center justify-between">
                      <code className="text-sm">{pixKey}</code>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(pixKey);
                          // Feedback de cópia
                          const button = document.activeElement as HTMLButtonElement;
                          const originalText = button.innerText;
                          button.innerText = "Copiado!";
                          setTimeout(() => {
                            button.innerText = originalText;
                          }, 2000);
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Abra o aplicativo do seu banco, selecione PIX, e use o código acima para fazer o pagamento.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        
        {bankData && (
          <TabsContent value="bank">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">Banco:</p>
                    <p className="bg-gray-100 rounded p-2">{bankData.bank}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="font-medium">Agência:</p>
                      <p className="bg-gray-100 rounded p-2">{bankData.agency}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">Conta:</p>
                      <p className="bg-gray-100 rounded p-2">{bankData.accountNumber}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium">Titular:</p>
                    <p className="bg-gray-100 rounded p-2">{bankData.accountHolder}</p>
                  </div>
                  
                  {bankData.documentNumber && (
                    <div className="space-y-2">
                      <p className="font-medium">CPF/CNPJ:</p>
                      <p className="bg-gray-100 rounded p-2">{bankData.documentNumber}</p>
                    </div>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Realize uma transferência bancária para a conta acima e envie o comprovante.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Após realizar o pagamento, favor enviar o comprovante para o e-mail da instituição.
          <br />
          O processo de adoção só será finalizado após a confirmação do pagamento.
        </p>
      </div>
    </div>
  );
};

export default PixPaymentForm;
