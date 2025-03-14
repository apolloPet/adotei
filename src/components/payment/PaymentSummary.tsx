
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Percent } from "lucide-react";

interface PaymentSummaryProps {
  adoption: {
    id: string;
    petName: string;
    petImage: string;
    shelter: string;
    fee: number;
    status: string;
    userName: string;
  };
  settings: {
    ngoPercentage: number;
    platformPercentage: number;
  };
  isPaymentComplete: boolean;
}

const PaymentSummary = ({ adoption, settings, isPaymentComplete }: PaymentSummaryProps) => {
  const ngoAmount = adoption.fee * (settings.ngoPercentage / 100);
  const platformFee = adoption.fee * (settings.platformPercentage / 100);

  return (
    <div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-20 w-20 overflow-hidden rounded-md">
          <img 
            src={adoption.petImage} 
            alt={adoption.petName} 
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{adoption.petName}</h3>
          <p className="text-muted-foreground">{adoption.shelter}</p>
          {isPaymentComplete ? (
            <Badge className="mt-1 bg-green-600">Adoção Confirmada</Badge>
          ) : (
            <Badge variant="outline" className="mt-1">Aguardando Pagamento</Badge>
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Taxa de adoção</span>
          <span>R$ {adoption.fee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center">
            <Percent className="h-4 w-4 mr-1 inline" />
            Destinado à ONG ({settings.ngoPercentage}%)
          </span>
          <span>R$ {ngoAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span className="flex items-center">
            <Percent className="h-4 w-4 mr-1 inline" />
            Taxa de plataforma ({settings.platformPercentage}%)
          </span>
          <span>R$ {platformFee.toFixed(2)}</span>
        </div>
      </div>
      
      {isPaymentComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <h4 className="font-medium text-green-600 dark:text-green-400">Contribuição confirmada</h4>
          </div>
          <p className="mt-2 text-sm text-green-600/80 dark:text-green-400/80">
            Agradecemos seu apoio! A ONG entrará em contato para os próximos passos da adoção.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentSummary;
