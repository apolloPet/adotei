
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Percent } from "lucide-react";

interface PaymentInfoSidebarProps {
  adoption: {
    petName: string;
    fee: number;
    userName?: string;
  };
  fee: number;
  ngoPercentage: number;
  platformPercentage: number;
}

const PaymentInfoSidebar = ({ 
  adoption,
  fee, 
  ngoPercentage, 
  platformPercentage 
}: PaymentInfoSidebarProps) => {
  const ngoAmount = fee * (ngoPercentage / 100);
  const platformFee = fee * (platformPercentage / 100);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Resumo da Adoção</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="mb-6">
            <h3 className="font-semibold text-lg">{adoption.petName}</h3>
            {adoption.userName && (
              <p className="text-muted-foreground">{adoption.userName}</p>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span>Taxa de adoção</span>
              <span>R$ {fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center">
                <Percent className="h-4 w-4 mr-1 inline" />
                Destinado à ONG ({ngoPercentage}%)
              </span>
              <span>R$ {ngoAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center">
                <Percent className="h-4 w-4 mr-1 inline" />
                Taxa de plataforma ({platformPercentage}%)
              </span>
              <span>R$ {platformFee.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              Sua contribuição ajuda a manter os serviços da plataforma e apoiar as ONGs parceiras na continuidade do trabalho de resgate e cuidado animal.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoSidebar;
