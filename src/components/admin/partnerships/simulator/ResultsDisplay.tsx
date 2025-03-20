
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { CostResults } from "./types";

interface ResultsDisplayProps {
  results: CostResults;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Custo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(results.monthlyTotal)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Custo Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(results.yearlyTotal)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center">Custo Estimado Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(results.lifetimeTotal)}
            </p>
            <p className="text-xs text-center text-muted-foreground mt-1">
              (Baseado na expectativa de vida)
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Detalhamento Mensal</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium mb-2">Alimentação</h4>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyCosts.food)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium mb-2">Saúde</h4>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyCosts.medical)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium mb-2">Higiene</h4>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyCosts.grooming)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium mb-2">Suprimentos</h4>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyCosts.supplies)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-sm font-medium mb-2">Cuidados Especiais</h4>
                <p className="text-xl font-bold">{formatCurrency(results.monthlyCosts.specialCare)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {results.details && (
        <>
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Custos Iniciais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium mb-2">Acessórios Iniciais</h4>
                    <p className="text-xl font-bold">{formatCurrency(results.details.initialCosts.accessories)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Cama, brinquedos, comedouros, etc)
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="text-sm font-medium mb-2">Procedimentos Iniciais</h4>
                    <p className="text-xl font-bold">{formatCurrency(results.details.initialCosts.procedures)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {results.details.initialCosts.procedures > 0 
                        ? "(Castração, vacinação inicial, etc)" 
                        : "(Animal já castrado e vacinado)"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {(results.details.monthlyBreakdown.adjustments.healthConditions || 
            results.details.monthlyBreakdown.adjustments.specialNeeds) && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Observações</h3>
                
                {results.details.monthlyBreakdown.adjustments.healthConditions && (
                  <p className="text-sm">
                    <span className="font-medium">Condições de saúde:</span> {results.details.monthlyBreakdown.adjustments.healthConditions}
                  </p>
                )}
                
                {results.details.monthlyBreakdown.adjustments.specialNeeds && (
                  <p className="text-sm">
                    <span className="font-medium">Necessidades especiais:</span> {results.details.monthlyBreakdown.adjustments.specialNeeds}
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ResultsDisplay;
