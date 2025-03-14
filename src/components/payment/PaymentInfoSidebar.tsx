
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Percent, CreditCard } from "lucide-react";

const PaymentInfoSidebar = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sobre a Contribuição</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h4 className="font-medium mb-1 flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            Para que serve?
          </h4>
          <p className="text-muted-foreground">
            Sua contribuição ajuda a cobrir despesas com vacinas, castração, microchipagem e cuidados médicos que o pet recebeu.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1 flex items-center">
            <Percent className="h-4 w-4 mr-1" />
            Como o valor é dividido?
          </h4>
          <p className="text-muted-foreground">
            90% do valor vai diretamente para a ONG responsável pelo pet, e 10% ajuda a manter nossa plataforma funcionando.
          </p>
        </div>
        
        <div>
          <h4 className="font-medium mb-1 flex items-center">
            <CreditCard className="h-4 w-4 mr-1" />
            Pagamento seguro
          </h4>
          <p className="text-muted-foreground">
            Usamos criptografia e os mais altos padrões de segurança para proteger suas informações de pagamento.
          </p>
        </div>
        
        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={() => window.open('/how-it-works', '_blank')}>
            Saiba mais sobre o processo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoSidebar;
