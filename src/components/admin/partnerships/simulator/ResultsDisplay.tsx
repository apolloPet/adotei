
import { Card, CardContent } from '@/components/ui/card';
import { CostResults } from './types';

interface ResultsDisplayProps {
  results: CostResults;
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const { monthlyCosts, monthlyTotal, yearlyTotal, lifetimeTotal, details } = results;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center">Custo Mensal</h3>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(monthlyTotal)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center">Custo Anual</h3>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(yearlyTotal)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold text-center">Custo de Vida Estimado</h3>
            <p className="text-2xl font-bold text-center text-primary">
              {formatCurrency(lifetimeTotal)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Detalhamento de Custos Mensais</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Alimentação</span>
            <span className="font-medium">{formatCurrency(monthlyCosts.food)}</span>
          </div>
          <div className="flex justify-between">
            <span>Saúde/Veterinário</span>
            <span className="font-medium">{formatCurrency(monthlyCosts.medical)}</span>
          </div>
          <div className="flex justify-between">
            <span>Higiene e Estética</span>
            <span className="font-medium">{formatCurrency(monthlyCosts.grooming)}</span>
          </div>
          <div className="flex justify-between">
            <span>Suprimentos</span>
            <span className="font-medium">{formatCurrency(monthlyCosts.supplies)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cuidados Especiais</span>
            <span className="font-medium">{formatCurrency(monthlyCosts.specialCare)}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Total Mensal</span>
            <span>{formatCurrency(monthlyTotal)}</span>
          </div>
        </div>
      </div>
      
      {details && (
        <>
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Detalhes da Alimentação</h3>
            <p className="text-sm text-gray-600 mb-2">
              Baseado no tipo de alimentação {details.monthlyBreakdown.food} e nas características do animal.
            </p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Condições de Saúde e Necessidades Especiais</h3>
            {details.monthlyBreakdown.adjustments.healthConditions && (
              <div className="mb-3">
                <h4 className="font-medium">Condições de Saúde:</h4>
                <p className="text-sm text-gray-600">{details.monthlyBreakdown.adjustments.healthConditions}</p>
              </div>
            )}
            {details.monthlyBreakdown.adjustments.specialNeeds && (
              <div>
                <h4 className="font-medium">Necessidades Especiais:</h4>
                <p className="text-sm text-gray-600">{details.monthlyBreakdown.adjustments.specialNeeds}</p>
              </div>
            )}
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Custos Iniciais Estimados</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Acessórios e Equipamentos</span>
                <span className="font-medium">{formatCurrency(details.initialCosts.accessories)}</span>
              </div>
              <div className="flex justify-between">
                <span>Procedimentos Médicos Iniciais</span>
                <span className="font-medium">{formatCurrency(details.initialCosts.procedures)}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total Inicial</span>
                <span>{formatCurrency(details.initialCosts.accessories + details.initialCosts.procedures)}</span>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Dicas para Economizar</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>Considere adquirir ração em maior quantidade para obter descontos</li>
          <li>Planos de saúde veterinários podem reduzir os custos de consultas e procedimentos</li>
          <li>Aprenda a fazer a higiene básica do animal em casa</li>
          <li>Procure promoções em lojas online para acessórios e brinquedos</li>
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;
