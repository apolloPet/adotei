
import React from 'react';
import { Label } from "@/components/ui/label";
import { CostResults } from './types';

interface ResultsDisplayProps {
  results: CostResults | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (!results) return null;

  return (
    <div className="mt-6 border rounded-md p-4">
      <h3 className="font-semibold text-lg mb-2">Resultados</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground text-xs">Custo Mensal com Alimentação</Label>
          <p className="font-medium">R$ {results.foodCost.toFixed(2)}</p>
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Custo Mensal com Saúde</Label>
          <p className="font-medium">R$ {results.medicalCost.toFixed(2)}</p>
        </div>
        {results.specialCost > 0 && (
          <div>
            <Label className="text-muted-foreground text-xs">Custo com Necessidades Especiais</Label>
            <p className="font-medium">R$ {results.specialCost.toFixed(2)}</p>
          </div>
        )}
        <div>
          <Label className="text-muted-foreground text-xs">Total Mensal</Label>
          <p className="font-medium text-primary">R$ {results.totalMonthly.toFixed(2)}</p>
        </div>
        <div className="col-span-2">
          <Label className="text-muted-foreground text-xs">Total Anual Estimado</Label>
          <p className="font-medium text-xl text-primary">R$ {results.totalYearly.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
