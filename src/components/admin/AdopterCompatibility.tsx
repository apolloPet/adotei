import { useEffect, useMemo, useState } from 'react';
import AuthedImage from '@/components/ui/authed-image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Heart, AlertTriangle, ShieldAlert, Loader2 } from 'lucide-react';
import { getAnimals, Animal } from '@/services/animalService';
import {
  CompatibilityCandidate,
  fetchCompatibilityCandidates,
  mapQuestionsToReasons,
} from '@/services/compatibilityService';
import { toast } from '@/hooks/use-sonner';

type RankedCandidate = CompatibilityCandidate & {
  reasons: { positive: string[]; negative: string[]; blockers: string[] };
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
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [petId, setPetId] = useState<string>('');
  const [ranked, setRanked] = useState<RankedCandidate[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoadingAnimals(true);
      try {
        const data = await getAnimals();
        const withProfile = data.filter((animal) => animal.adopterProfile);
        setAnimals(withProfile);
        if (withProfile.length > 0) {
          setPetId(withProfile[0].id);
        }
      } catch {
        toast.error('Erro ao carregar animais');
      } finally {
        setIsLoadingAnimals(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!petId) {
      setRanked([]);
      return;
    }

    (async () => {
      setIsLoadingCandidates(true);
      setLoadError(null);
      try {
        const candidates = await fetchCompatibilityCandidates(petId);
        setRanked(
          candidates.map((candidate) => ({
            ...candidate,
            reasons: mapQuestionsToReasons(candidate.questions),
          })),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar candidatos';
        setLoadError(message);
        setRanked([]);
      } finally {
        setIsLoadingCandidates(false);
      }
    })();
  }, [petId]);

  const selectedPet = useMemo(
    () => animals.find((animal) => animal.id === petId) ?? animals[0],
    [animals, petId],
  );

  if (isLoadingAnimals) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Carregando animais...
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhum animal com perfil ideal de adotante cadastrado. Cadastre o perfil ideal no formulário de animais.
        </CardContent>
      </Card>
    );
  }

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
            Selecione um animal para ver os adotantes mais compatíveis com base nos perfis do banco de dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex items-center gap-3 min-w-0">
              <AuthedImage
                src={selectedPet.fotoPrincipal || '/placeholder.svg'}
                alt={selectedPet.nome}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-md object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold truncate">{selectedPet.nome}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedPet.tipo} · {selectedPet.porte}
                </p>
              </div>
            </div>
            <div className="md:ml-auto w-full md:w-72">
              <Select value={petId} onValueChange={setPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.nome} — {animal.tipo} ({animal.porte})
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
            {isLoadingCandidates ? 'Carregando candidatos...' : `${ranked.length} candidatos avaliados`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 sm:p-6 pt-0 sm:pt-0">
          {isLoadingCandidates && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando compatibilidade...
            </div>
          )}

          {!isLoadingCandidates && loadError && (
            <p className="text-sm text-destructive">{loadError}</p>
          )}

          {!isLoadingCandidates && !loadError && ranked.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum adotante com perfil completo encontrado no banco de dados.
            </p>
          )}

          {!isLoadingCandidates &&
            ranked.map((r, i) => {
              const expanded = expandedId === r.userId;
              const blocked = r.reasons.blockers.length > 0;
              return (
                <div
                  key={r.userId}
                  className="border rounded-lg p-3 sm:p-4 space-y-2 hover:border-primary/50 transition"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted text-xs sm:text-sm font-bold shrink-0">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm sm:text-base">{r.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.email}
                        {r.city ? ` · ${r.city}` : ''}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {compatBadge(r.scorePercent, blocked)}
                        <span className="text-xs text-muted-foreground">
                          {r.matchedCount}/{r.totalAnsweredCount} critérios
                        </span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8"
                      onClick={() => setExpandedId(expanded ? null : r.userId)}
                    >
                      {expanded ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </div>

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
