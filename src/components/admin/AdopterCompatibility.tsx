import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Heart, AlertTriangle, ShieldAlert } from 'lucide-react';
import { generateMockPets } from '@/data/mockPets';
import { mockUsers } from '@/components/admin/users/mockData';
import { AdopterCandidate, rankCandidates } from '@/utils/compatibilityScore';
import { ExtendedProfile } from '@/types/user';

const EXTENDED_KEY = 'user_profile_extended';

const loadAllExtended = (): Record<string, ExtendedProfile> => {
  try {
    return JSON.parse(localStorage.getItem(EXTENDED_KEY) || '{}');
  } catch {
    return {};
  }
};

const buildCandidates = (): AdopterCandidate[] => {
  const ext = loadAllExtended();
  const fromMock: AdopterCandidate[] = mockUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.address?.city,
    housingType: u.housingType,
    hasChildren: u.hasChildren,
    hadPetsBefore: u.hadPetsBefore,
    hasAllergies: u.hasAllergies,
    extended: ext[u.id],
  }));
  // Also include any local profiles not in mockUsers
  Object.keys(ext).forEach((id) => {
    if (!fromMock.find((c) => c.id === id)) {
      fromMock.push({ id, name: `Usuário ${id.slice(0, 6)}`, email: '—', extended: ext[id] });
    }
  });
  return fromMock;
};

const scoreColor = (s: number) =>
  s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-amber-500' : 'bg-destructive';

const AdopterCompatibility = () => {
  const pets = useMemo(() => generateMockPets(8), []);
  const candidates = useMemo(() => buildCandidates(), []);
  const [petId, setPetId] = useState(pets[0]?.id);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedPet = pets.find((p) => p.id === petId) || pets[0];
  const ranked = useMemo(
    () => (selectedPet ? rankCandidates(selectedPet, candidates) : []),
    [selectedPet, candidates]
  );

  if (!selectedPet) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Compatibilidade de adotantes
          </CardTitle>
          <CardDescription>
            Selecione um animal para ver os adotantes mais compatíveis, com pontuação e motivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <img
                src={selectedPet.primaryImage}
                alt={selectedPet.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div>
                <p className="font-semibold">{selectedPet.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedPet.breed} · {selectedPet.size} · {selectedPet.species}
                </p>
              </div>
            </div>
            <div className="md:ml-auto w-full md:w-72">
              <Select value={petId} onValueChange={setPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um animal" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} — {p.breed} ({p.size})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {ranked.length} candidatos avaliados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ranked.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum candidato disponível.</p>
          )}
          {ranked.map((r, i) => {
            const expanded = expandedId === r.candidate.id;
            const blocked = r.reasons.blockers.length > 0;
            return (
              <div
                key={r.candidate.id}
                className="border rounded-lg p-4 space-y-2 hover:border-primary/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold truncate">{r.candidate.name}</p>
                      {blocked && (
                        <Badge variant="destructive" className="gap-1">
                          <ShieldAlert className="h-3 w-3" /> Bloqueado
                        </Badge>
                      )}
                      {!blocked && r.score >= 75 && (
                        <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/20">
                          Alta compatibilidade
                        </Badge>
                      )}
                      {!blocked && r.score < 50 && (
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Baixa compatibilidade
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.candidate.email}
                      {r.candidate.city ? ` · ${r.candidate.city}` : ''}
                    </p>
                  </div>
                  <div className="w-32 text-right">
                    <p className="text-2xl font-bold">{r.score}</p>
                    <p className="text-xs text-muted-foreground">pontos</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setExpandedId(expanded ? null : r.candidate.id)}
                  >
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>
                <Progress value={r.score} className={`h-2 ${scoreColor(r.score)}`} />

                {/* Top reasons (collapsed) */}
                {!expanded && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.reasons.positive.slice(0, 2).map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">+ {p}</Badge>
                    ))}
                    {r.reasons.negative.slice(0, 2).map((n) => (
                      <Badge key={n} variant="outline" className="text-xs text-destructive border-destructive/40">− {n}</Badge>
                    ))}
                  </div>
                )}

                {expanded && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Pontos positivos</p>
                      <ul className="space-y-1 text-xs">
                        {r.reasons.positive.length === 0 && (
                          <li className="text-muted-foreground">—</li>
                        )}
                        {r.reasons.positive.map((p) => (
                          <li key={p}>✓ {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 mb-1">Atenção</p>
                      <ul className="space-y-1 text-xs">
                        {r.reasons.negative.length === 0 && (
                          <li className="text-muted-foreground">—</li>
                        )}
                        {r.reasons.negative.map((n) => (
                          <li key={n}>! {n}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-1">Bloqueios</p>
                      <ul className="space-y-1 text-xs">
                        {r.reasons.blockers.length === 0 && (
                          <li className="text-muted-foreground">—</li>
                        )}
                        {r.reasons.blockers.map((b) => (
                          <li key={b}>✕ {b}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdopterCompatibility;
