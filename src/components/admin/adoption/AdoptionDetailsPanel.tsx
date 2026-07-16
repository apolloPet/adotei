import { useMemo } from 'react';
import AuthedImage from '@/components/ui/authed-image';
import {
  PawPrint,
  User,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { AdoptionMatch } from './types';
import { Pet, PetSpecies } from '@/types/pets';

/** Derive a synthetic Pet object from the match for basic display fields. */
const buildPetFromMatch = (match: AdoptionMatch): Pet => {
  const lowerName = (match.petName || '').toLowerCase();
  const guessSpecies: PetSpecies =
    /(mia|simba|frida|nala|tom|felix|oliver|gato)/.test(lowerName) ? 'cat' : 'dog';
  return {
    id: match.petId,
    name: match.petName,
    breed: 'SRD',
    gender: 'male',
    size: 'medium',
    species: guessSpecies,
    age: '2',
    weight: 10,
    shelterTime: '—',
    medicalInfo: '',
    images: [match.petImage],
    primaryImage: match.petImage,
    shelter: '—',
    traits: [],
    description: '',
    location: '—',
  };
};

interface Props {
  match: AdoptionMatch;
}

const Section = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border bg-card p-3 sm:p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-primary">{icon}</div>
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-3 text-sm py-1.5 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground text-xs sm:text-sm">{label}</span>
    <span className="font-medium sm:text-right break-words">{value ?? '—'}</span>
  </div>
);

const AdoptionDetailsPanel = ({ match }: Props) => {
  const pet = useMemo(() => buildPetFromMatch(match), [match]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section icon={<PawPrint className="h-4 w-4" />} title="Dados do Animal">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold">{match.petName}</p>
              <span className="text-xs text-muted-foreground capitalize">
                · {pet.species === 'cat' ? 'Gato' : pet.species === 'dog' ? 'Cão' : 'Outro'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(() => {
                const photos = (pet.images || []).filter(Boolean).slice(0, 3);
                while (photos.length < 3) photos.push(match.petImage);
                return photos.slice(0, 3).map((src, i) => (
                  <AuthedImage
                    key={i}
                    src={src}
                    alt={`${match.petName} foto ${i + 1}`}
                    className="w-full h-16 sm:h-20 rounded-md object-cover border"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ));
              })()}
            </div>
          </div>
          <Row label="ID" value={match.petId} />
          {match.animal_id && <Row label="ID importado" value={match.animal_id} />}
          <Row label="Espécie" value={pet.species === 'cat' ? 'Gato' : 'Cão'} />
          <Row label="Porte estimado" value={pet.size} />
        </Section>

        <Section icon={<User className="h-4 w-4" />} title="Dados do Adotante">
          <Row label="Nome" value={match.userName} />
          <Row
            label="Email"
            value={
              <span className="flex items-center gap-1 justify-end">
                <Mail className="h-3 w-3" /> {match.userEmail}
              </span>
            }
          />
          <Row
            label="Telefone"
            value={
              match.userPhone ? (
                <span className="flex items-center gap-1 justify-end">
                  <Phone className="h-3 w-3" /> {match.userPhone}
                </span>
              ) : (
                '—'
              )
            }
          />
          <Row label="ID" value={match.userId} />
        </Section>
      </div>

      <div className="rounded-lg border p-4 bg-muted/20">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> Histórico da Solicitação
        </h4>
        <Row label="Criada em" value={new Date(match.createdAt).toLocaleString('pt-BR')} />
        <Row label="Atualizada em" value={new Date(match.updatedAt).toLocaleString('pt-BR')} />
        <Row label="Responsável" value={match.responsibleName || 'Não atribuído'} />
        {match.notes && <Row label="Observações" value={match.notes} />}
      </div>
    </div>
  );
};

export default AdoptionDetailsPanel;
