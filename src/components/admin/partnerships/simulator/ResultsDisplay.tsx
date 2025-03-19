
import React from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CostResults } from './types';
import { Separator } from "@/components/ui/separator";

interface ResultsDisplayProps {
  results: CostResults | null;
  isLoading?: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Calculando resultados...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Resultados da Simulação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Custo Mensal</Label>
            <p className="font-medium">R$ {results.monthlyCost.toFixed(2)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Custo Anual</Label>
            <p className="font-medium">R$ {results.yearlyCost.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <Label className="text-muted-foreground text-xs">Custo Estimado ao Longo da Vida</Label>
          <p className="font-medium text-xl text-primary">R$ {results.lifetimeCost.toFixed(2)}</p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Detalhamento Mensal</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Alimentação</Label>
              <p>R$ {results.details.monthlyBreakdown.food.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Saúde</Label>
              <p>R$ {results.details.monthlyBreakdown.healthcare.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-sm">
            <Label className="text-muted-foreground text-xs">Ajustes por Condições de Saúde</Label>
            <p>{results.details.monthlyBreakdown.adjustments.healthConditions}</p>
          </div>

          <div className="text-sm">
            <Label className="text-muted-foreground text-xs">Ajustes por Necessidades Especiais</Label>
            <p>{results.details.monthlyBreakdown.adjustments.specialNeeds}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Custos Iniciais (Únicos)</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <Label className="text-muted-foreground text-xs">Acessórios</Label>
              <p>R$ {results.details.initialCosts.accessories.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Procedimentos (caso necessário)</Label>
              <p>R$ {results.details.initialCosts.procedures.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        {results.id && (
          <div className="text-xs text-muted-foreground mt-4">
            ID da simulação: {results.id}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;
