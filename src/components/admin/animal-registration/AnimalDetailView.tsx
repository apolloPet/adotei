
import React from 'react';
import { Animal } from '@/services/animalService';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  CalendarIcon, 
  RulerIcon, 
  InfoIcon, 
  MapPinIcon, 
  ClipboardIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import AuthedImage from '@/components/ui/authed-image';

interface AnimalDetailViewProps {
  animal: Animal;
  onClose: () => void;
}

const AnimalDetailView: React.FC<AnimalDetailViewProps> = ({ animal, onClose }) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações básicas */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <InfoIcon className="w-5 h-5 text-primary" />
              Informações Básicas
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{animal.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {animal.tipo === 'cachorro' ? 'Cachorro' : 
                   animal.tipo === 'gato' ? 'Gato' : 'Outro'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-medium">{animal.idade} {animal.idade === 1 ? 'ano' : 'anos'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sexo</p>
                <p className="font-medium">{animal.sexo === 'macho' ? 'Macho' : 'Fêmea'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Porte</p>
                <p className="font-medium">
                  {animal.porte === 'pequeno' ? 'Pequeno' : 
                   animal.porte === 'medio' ? 'Médio' : 'Grande'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Castrado</p>
                <p className="font-medium">{animal.castrado ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de saúde */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ClipboardIcon className="w-5 h-5 text-primary" />
              Informações de Saúde
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Vacinas</p>
                <div className="mt-1">
                  {Array.isArray(animal.vacinas) && animal.vacinas.length > 0 ? (
                    animal.vacinas.map((vacina, index) => (
                      <Badge key={index} variant="secondary" className="mr-2 mb-2">
                        {vacina}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm">Nenhuma vacina registrada</p>
                  )}
                </div>
              </div>
              {animal.vaccinationStatus && (
                <div>
                  <p className="text-sm text-muted-foreground">Status de vacinação</p>
                  <p className="font-medium">{animal.vaccinationStatus}</p>
                </div>
              )}
              {animal.veterinaryInfo && (
                <div>
                  <p className="text-sm text-muted-foreground">Informações veterinárias</p>
                  <p className="font-medium whitespace-pre-line">{animal.veterinaryInfo}</p>
                </div>
              )}
              {animal.healthConditions && (
                <div>
                  <p className="text-sm text-muted-foreground">Condições de saúde</p>
                  <p className="font-medium whitespace-pre-line">{animal.healthConditions}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Necessidades especiais</p>
                <p className="font-medium">
                  {animal.specialNeeds
                    ? animal.specialNeedsDescription || 'Sim, sem descrição informada.'
                    : 'Não'}
                </p>
              </div>
              {animal.additionalInfo && (
                <div>
                  <p className="text-sm text-muted-foreground">Informações complementares</p>
                  <p className="font-medium whitespace-pre-line">{animal.additionalInfo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Descrição */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Descrição</h3>
          <p>{animal.descricao || 'Nenhuma descrição disponível.'}</p>
        </CardContent>
      </Card>

      {/* Fotos */}
      {animal.fotos && Array.isArray(animal.fotos) && animal.fotos.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Fotos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {animal.fotos.map((foto, index) => (
                <AuthedImage
                  key={index}
                  src={foto} 
                  alt={`${animal.nome} - Foto ${index + 1}`} 
                  className="rounded-md w-full aspect-square object-cover"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data de cadastro */}
      <div className="text-sm text-muted-foreground flex items-center">
        <CalendarIcon className="w-4 h-4 mr-1" />
        Data de cadastro: {formatDate(animal.data_cadastro)}
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </div>
  );
};

export default AnimalDetailView;
