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

const compatBadge = (score: number, blocked: boolean) => {
  if (blocked) {
    return (
      <Badge variant="destructive" className="gap-1">
        <ShieldAlert className="h-3 w-3" /> Bloqueado
      </Badge>
    );
  }
  if (score >= 75) {
    return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/20 border border-green-500/30">Alta compatibilidade</Badge>;
  }
  if (score >= 50) {
    return <Badge variant="outline" className="bg-amber-500/15 text-amber-700 border-amber-500/30">Média compatibilidade</Badge>;
  }
  return (
    <Badge variant="outline" className="gap-1 bg-red-500/10 text-red-700 border-red-500/30">
      <AlertTriangle className="h-3 w-3" /> Baixa compatibilidade
    </Badge>
  );
};

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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Heart className="h-5 w-5 text-primary" />
            Compatibilidade de adotantes
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Selecione um animal para ver os adotantes mais compatíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={selectedPet.primaryImage}
                alt={selectedPet.name}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">{selectedPet.name}</p>
                <p className="text-xs text-muted-foreground truncate">
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
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">
            {ranked.length} candidatos avaliados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
          {ranked.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum candidato disponível.</p>
          )}
          {ranked.map((r, i) => {
            const expanded = expandedId === r.candidate.id;
            const blocked = r.reasons.blockers.length > 0;
            return (
              <div
                key={r.candidate.id}
                className="border rounded-lg p-3 sm:p-4 space-y-2 hover:border-primary/50 transition"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted text-xs sm:text-sm font-bold shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm sm:text-base">{r.candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.candidate.email}
                      {r.candidate.city ? ` · ${r.candidate.city}` : ''}
                    </p>
                    <div className="mt-1.5">
                      {compatBadge(r.score, blocked)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-8 w-8"
                    onClick={() => setExpandedId(expanded ? null : r.candidate.id)}
                  >
                    {expanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>

                {/* Top reasons (collapsed) */}
                {!expanded && (r.reasons.positive.length > 0 || r.reasons.negative.length > 0) && (
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
                          <li key={p} className="break-words">✓ {p}</li>
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
                          <li key={n} className="break-words">! {n}</li>
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
                          <li key={b} className="break-words">✕ {b}</li>
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
