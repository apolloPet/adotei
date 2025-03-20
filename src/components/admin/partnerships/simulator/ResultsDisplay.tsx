
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CostResults } from "../types";
import { Badge } from "@/components/ui/badge";
import { DownloadCloud, RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ResultsDisplayProps {
  results: CostResults;
  onNewSimulation: () => void;
}

const ResultsDisplay = ({ results, onNewSimulation }: ResultsDisplayProps) => {
  const getAnimalTypeText = (type: string): string => {
    switch (type) {
      case 'dog': return 'Cachorro';
      case 'cat': return 'Gato';
      default: return 'Animal';
    }
  };

  const getSizeText = (size: string): string => {
    switch (size) {
      case 'small': return 'pequeno';
      case 'medium': return 'médio';
      case 'large': return 'grande';
      default: return size;
    }
  };

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Simulação Completa
          </Badge>
        </div>
        
        <CardHeader>
          <CardTitle className="text-xl">Resultados da Simulação</CardTitle>
          <CardDescription>
            Estimativa de custos com base nos parâmetros fornecidos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-medium text-muted-foreground">Custo Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(results.monthlyTotal)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-medium text-muted-foreground">Custo Anual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(results.yearlyTotal)}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-medium text-muted-foreground">Custo ao Longo da Vida</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(results.lifetimeTotal)}</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-3">Detalhamento de Custos Mensais</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Alimentação</span>
                  <span className="font-medium">{formatCurrency(results.monthlyCosts.food)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Saúde</span>
                  <span className="font-medium">{formatCurrency(results.monthlyCosts.medical)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Higiene e Estética</span>
                  <span className="font-medium">{formatCurrency(results.monthlyCosts.grooming)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Itens Diversos</span>
                  <span className="font-medium">{formatCurrency(results.monthlyCosts.supplies)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cuidados Especiais</span>
                  <span className="font-medium">{formatCurrency(results.monthlyCosts.specialCare)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={onNewSimulation}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Nova Simulação
          </Button>
          
          <Button className="w-full sm:w-auto">
            <DownloadCloud className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsDisplay;
