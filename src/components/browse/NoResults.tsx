
import { Button } from "@/components/ui/button";

interface NoResultsProps {
  type: 'empty' | 'end';
  onReset: () => void;
}

const NoResults = ({ type, onReset }: NoResultsProps) => {
  return (
    <div className="text-center py-16">
      <h2 className="text-xl font-semibold mb-2">
        {type === 'empty' ? 'Nenhum pet encontrado' : 'Não há mais pets para mostrar'}
      </h2>
      <p className="text-muted-foreground mb-6">
        {type === 'empty' 
          ? 'Tente ajustar seus filtros para ver mais opções.'
          : 'Você viu todos os pets disponíveis com esses filtros.'}
      </p>
      <Button onClick={onReset}>
        {type === 'empty' ? 'Limpar Filtros' : 'Recomeçar'}
      </Button>
    </div>
  );
};

export default NoResults;
