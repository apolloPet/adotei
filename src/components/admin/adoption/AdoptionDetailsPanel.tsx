import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PawPrint,
  User,
  Home,
  Heart,
  AlertTriangle,
  ShieldAlert,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';
import { AdoptionMatch } from './types';
import { ExtendedProfile, UserProfile } from '@/types/user';
import { Pet, PetSpecies } from '@/types/pets';
import { scoreCandidate, AdopterCandidate } from '@/utils/compatibilityScore';
import { getProfileAlerts } from '@/utils/profileAlerts';

const EXTENDED_KEY = 'user_profile_extended';

const loadExtendedFor = (userId: string): ExtendedProfile | undefined => {
  try {
    const all = JSON.parse(localStorage.getItem(EXTENDED_KEY) || '{}');
    return all[userId];
  } catch {
    return undefined;
  }
};

/** Derive a synthetic Pet object from the match so we can score compatibility. */
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

const scoreColor = (s: number) =>
  s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-amber-500' : 'bg-destructive';

const scoreText = (s: number) =>
  s >= 75 ? 'Alta compatibilidade' : s >= 50 ? 'Compatibilidade média' : 'Baixa compatibilidade';

const housingLabel = (t?: string) =>
  t === 'apartment' ? 'Apartamento' : t === 'farm' ? 'Sítio/Chácara' : t === 'house' ? 'Casa' : '—';

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
  <div className="rounded-lg border bg-card p-4">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-primary">{icon}</div>
      <h4 className="text-sm font-semibold">{title}</h4>
    </div>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-3 text-sm py-1 border-b border-border/40 last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right">{value ?? '—'}</span>
  </div>
);

const AdoptionDetailsPanel = ({ match }: Props) => {
  const extended = useMemo(() => loadExtendedFor(match.userId), [match.userId]);
  const pet = useMemo(() => buildPetFromMatch(match), [match]);

  const candidate: AdopterCandidate = {
    id: match.userId,
    name: match.userName,
    email: match.userEmail,
    phone: match.userPhone,
    hasChildren: extended?.housing?.hasChildren,
    hadPetsBefore: extended?.experience?.hadPetsBefore,
    extended,
  };

  const compat = useMemo(() => scoreCandidate(pet, candidate), [pet, candidate]);

  const profile: UserProfile = {
    id: match.userId,
    email: match.userEmail,
    extended,
  };
  const alerts = getProfileAlerts(profile);

  const sevColor = (s: string) =>
    s === 'critical'
      ? 'bg-red-100 text-red-800 border-red-200'
      : s === 'warning'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';

  const housing = extended?.housing;
  const exp = extended?.experience;
  const fin = extended?.financial;
  const intent = extended?.intention;

  return (
    <div className="space-y-4">
      {/* Compatibility summary */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-sm">Compatibilidade</h4>
            {compat.reasons.blockers.length > 0 ? (
              <Badge variant="destructive" className="gap-1">
                <ShieldAlert className="h-3 w-3" /> Bloqueado
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={
                  compat.score >= 75
                    ? 'bg-green-500/15 text-green-700 border-green-500/30'
                    : compat.score >= 50
                    ? 'bg-amber-500/15 text-amber-700 border-amber-500/30'
                    : 'bg-red-500/15 text-red-700 border-red-500/30'
                }
              >
                {scoreText(compat.score)}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold leading-none">{compat.score}</p>
            <p className="text-[10px] text-muted-foreground uppercase">pontos</p>
          </div>
        </div>
        <Progress value={compat.score} className={`h-2 ${scoreColor(compat.score)}`} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div
            className="rounded-md border-l-4 p-2"
            style={{ borderLeftColor: '#00EA7C', backgroundColor: 'rgba(0, 234, 124, 0.08)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#00A856' }}>
              ✓ Match perfeito
            </p>
            <ul className="space-y-1 text-xs">
              {compat.reasons.positive.length === 0 && <li className="text-muted-foreground">—</li>}
              {compat.reasons.positive.map((p) => (
                <li key={p} className="flex gap-1">
                  <span style={{ color: '#00A856' }}>✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-md border-l-4 p-2"
            style={{ borderLeftColor: '#3F3D91', backgroundColor: 'rgba(63, 61, 145, 0.08)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: '#3F3D91' }}>
              ⚠ Divergência
            </p>
            <ul className="space-y-1 text-xs">
              {compat.reasons.negative.length === 0 && <li className="text-muted-foreground">—</li>}
              {compat.reasons.negative.map((n) => (
                <li key={n} className="flex gap-1">
                  <span style={{ color: '#3F3D91' }}>!</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-md border-l-4 border-destructive bg-destructive/5 p-2">
            <p className="text-xs font-semibold text-destructive mb-1">✕ Bloqueios</p>
            <ul className="space-y-1 text-xs">
              {compat.reasons.blockers.length === 0 && <li className="text-muted-foreground">—</li>}
              {compat.reasons.blockers.map((b) => (
                <li key={b} className="flex gap-1 text-destructive">
                  <span>✕</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {match.matchPoints && match.matchPoints.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-semibold mb-2">Pontos registrados pela equipe</p>
            <div className="flex flex-wrap gap-2">
              {match.matchPoints.map((p, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className={
                    p.strength === 'high'
                      ? 'bg-green-100 text-green-800'
                      : p.strength === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-orange-100 text-orange-800'
                  }
                >
                  <span className="mr-1">{p.icon}</span>
                  {p.description}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs font-semibold mb-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Alertas do perfil
            </p>
            <div className="flex flex-wrap gap-2">
              {alerts.map((a, i) => (
                <Badge key={i} variant="outline" className={sevColor(a.severity)}>
                  ⚠ {a.message}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Animal info */}
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
                  <img
                    key={i}
                    src={src}
                    alt={`${match.petName} foto ${i + 1}`}
                    className="w-full h-20 rounded-md object-cover border"
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

        {/* Adopter info */}
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

        {/* Housing profile */}
        <Section icon={<Home className="h-4 w-4" />} title="Moradia">
          <Row label="Tipo" value={housingLabel(housing?.type)} />
          <Row
            label="Posse"
            value={
              housing?.ownership === 'rented'
                ? 'Alugada'
                : housing?.ownership === 'owned'
                ? 'Própria'
                : '—'
            }
          />
          {housing?.ownership === 'rented' && (
            <Row
              label="Aluguel permite pets"
              value={housing?.rentAllowsPets ? 'Sim' : 'Não'}
            />
          )}
          <Row label="Possui quintal" value={housing?.hasYard ? 'Sim' : 'Não'} />
          {housing?.hasYard && (
            <Row label="Quintal murado" value={housing?.yardWalled ? 'Sim' : 'Não'} />
          )}
          <Row label="Janelas teladas" value={housing?.hasWindowScreens ? 'Sim' : 'Não'} />
          <Row label="Nº de moradores" value={housing?.numResidents ?? '—'} />
          <Row
            label="Possui crianças"
            value={
              housing?.hasChildren
                ? `Sim${
                    housing?.childrenAges
                      ? ` (${housing?.childrenAges})`
                      : ''
                  }`
                : 'Não'
            }
          />
        </Section>

        {/* Experience + finance + intention */}
        <Section icon={<Heart className="h-4 w-4" />} title="Experiência & Compromisso">
          <Row
            label="Já teve pets"
            value={exp?.hadPetsBefore ? 'Sim' : 'Não'}
          />
          <Row label="Tem pets atualmente" value={exp?.currentlyHasPets ? 'Sim' : 'Não'} />
          {exp?.currentlyHasPets && (
            <Row
              label="Pets atuais"
              value={`${exp?.currentPetsCount ?? '—'} ${
                exp?.currentPetsTypes ? `(${exp.currentPetsTypes})` : ''
              }`}
            />
          )}
          <Row label="Já devolveu animal" value={exp?.returnedAnimal ? 'Sim' : 'Não'} />
          <Row
            label="Possui alergia"
            value="—"
          />
          <Row label="Orçamento mensal" value={fin?.monthlyBudget ?? '—'} />
          <Row label="Cobre emergências" value={fin?.willCoverEmergencies ? 'Sim' : 'Não'} />
          <Row label="Cobre vacinas" value={fin?.willCoverVaccines ? 'Sim' : 'Não'} />
          <Row label="Cobre castração" value={fin?.willCoverNeutering ? 'Sim' : 'Não'} />
          {intent?.hoursAloneDaily !== undefined && (
            <Row label="Horas sozinho/dia" value={`${intent.hoursAloneDaily}h`} />
          )}
          {intent?.reasonToAdopt && <Row label="Motivo da adoção" value={intent.reasonToAdopt} />}
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
