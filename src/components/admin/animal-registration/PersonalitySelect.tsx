import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Loader2, Pencil, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import {
  createPersonality,
  listPersonalities,
  updatePersonality,
  type Personality,
} from '@/services/personalityService';
import {
  DRAFT_PERSONALITY_ID,
  type PendingPersonalityDraft,
} from './types';

export interface PersonalitySelectProps {
  organizationId?: string;
  /** Quando true, a ONG já está definida (ex.: voluntário) e não há seletor de ONG. */
  organizationLocked?: boolean;
  value: string;
  /** Texto legado recebido da API quando o animal ainda não possui personalityId. */
  fallbackPersonalityText?: string;
  onChange: (personalityId: string, personality?: Personality) => void;
  /** Quando true, "Nova" só cria rascunho local; a API só é chamada no submit do animal. */
  deferCreateUntilAnimalSubmit?: boolean;
  pendingPersonality?: PendingPersonalityDraft | null;
  onPendingPersonalityChange?: (draft: PendingPersonalityDraft | null) => void;
  disabled?: boolean;
}

const EMPTY_FORM = { name: '', description: '' };

const PersonalitySelect = ({
  organizationId,
  organizationLocked = false,
  value,
  fallbackPersonalityText,
  onChange,
  deferCreateUntilAnimalSubmit = false,
  pendingPersonality = null,
  onPendingPersonalityChange,
  disabled = false,
}: PersonalitySelectProps) => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadPersonalities = async () => {
    if (!organizationId) {
      setPersonalities([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listPersonalities(organizationId);
      setPersonalities(data);
    } catch (error) {
      console.error('Erro ao carregar personalidades:', error);
      toast.error('Não foi possível carregar as personalidades.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPersonalities();
  }, [organizationId]);

  useEffect(() => {
    if (value || !fallbackPersonalityText || personalities.length === 0) {
      return;
    }
    const normalize = (text: string) => text.trim().toLocaleLowerCase('pt-BR');
    const fallback = normalize(fallbackPersonalityText);
    const matched = personalities.find((personality) =>
      normalize(personality.name) === fallback || normalize(personality.description) === fallback,
    );
    if (matched) {
      onChange(matched.id, matched);
    }
  }, [fallbackPersonalityText, onChange, personalities, value]);

  const selectablePersonalities = useMemo(() => {
    if (!pendingPersonality) return personalities;
    const draft: Personality = {
      id: DRAFT_PERSONALITY_ID,
      organizationId: organizationId || '',
      name: `${pendingPersonality.name} (nova — salva com o animal)`,
      description: pendingPersonality.description,
      active: true,
    };
    return [draft, ...personalities];
  }, [personalities, pendingPersonality, organizationId]);

  const selectedPersonality = selectablePersonalities.find((p) => p.id === value);

  const validateDraftForm = (): PendingPersonalityDraft | null => {
    const name = form.name.trim();
    const description = form.description.trim();
    if (!name) {
      toast.error('Informe o nome da personalidade.');
      return null;
    }
    if (!description) {
      toast.error('Informe a descrição da personalidade e temperamento.');
      return null;
    }
    if (description.length > 200) {
      toast.error('A descrição deve ter no máximo 200 caracteres.');
      return null;
    }
    if (!organizationId) {
      toast.error(
        organizationLocked
          ? 'Vínculo com a ONG é necessário para cadastrar personalidade.'
          : 'Selecione uma ONG antes de cadastrar personalidade.'
      );
      return null;
    }
    return { name, description };
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedPersonality) return;
    setEditingId(selectedPersonality.id);
    const isDraft = selectedPersonality.id === DRAFT_PERSONALITY_ID;
    setForm({
      name: isDraft && pendingPersonality ? pendingPersonality.name : selectedPersonality.name,
      description: selectedPersonality.description,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const draft = validateDraftForm();
    if (!draft) return;

    if (editingId && editingId !== DRAFT_PERSONALITY_ID) {
      setIsSaving(true);
      try {
        const updated = await updatePersonality(editingId, { ...draft, active: true });
        setPersonalities((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => a.name.localeCompare(b.name)),
        );
        onChange(updated.id, updated);
        setForm(EMPTY_FORM);
        setEditingId(null);
        setDialogOpen(false);
        toast.success('Personalidade atualizada com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar personalidade:', error);
        toast.error(error instanceof Error ? error.message : 'Erro ao atualizar personalidade.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (deferCreateUntilAnimalSubmit) {
      onPendingPersonalityChange?.(draft);
      onChange(DRAFT_PERSONALITY_ID, {
        id: DRAFT_PERSONALITY_ID,
        organizationId: organizationId!,
        name: draft.name,
        description: draft.description,
        active: true,
      });
      setForm(EMPTY_FORM);
      setEditingId(null);
      setDialogOpen(false);
      toast.success('Personalidade e temperamento prontos. Serão salvos ao cadastrar o animal.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPersonality({ ...draft, active: true }, organizationId);
      setPersonalities((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(created.id, created);
      setForm(EMPTY_FORM);
      setEditingId(null);
      setDialogOpen(false);
      toast.success('Personalidade cadastrada com sucesso.');
    } catch (error) {
      console.error('Erro ao cadastrar personalidade:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar personalidade.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-2 min-w-0">
      <Label className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        Personalidade & temperamento*
        {!value && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
      </Label>

      {!organizationId ? (
        <p className="text-sm text-muted-foreground break-words">
          {organizationLocked
            ? 'Aguarde o carregamento da sua ONG para visualizar e criar personalidade e temperamento.'
            : 'Selecione a ONG no início do cadastro para visualizar e criar personalidade e temperamento.'}
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <Select
            value={value || undefined}
            onValueChange={(id) => {
              if (id !== DRAFT_PERSONALITY_ID) {
                onPendingPersonalityChange?.(null);
              }
              const personality = selectablePersonalities.find((p) => p.id === id);
              onChange(id, personality);
            }}
            disabled={disabled || isLoading || !organizationId}
          >
            <SelectTrigger className={`w-full min-w-0 sm:flex-1 ${!value ? 'border-destructive' : ''}`}>
              <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione uma personalidade'} />
            </SelectTrigger>
            <SelectContent>
              {selectablePersonalities.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  Nenhuma personalidade cadastrada
                </SelectItem>
              ) : (
                selectablePersonalities.map((personality) => (
                  <SelectItem key={personality.id} value={personality.id}>
                    {personality.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            onClick={openEditDialog}
            disabled={disabled || !organizationId || !selectedPersonality}
            className="w-full sm:w-auto shrink-0"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button
              type="button"
              variant="outline"
              onClick={openCreateDialog}
              disabled={disabled || !organizationId}
              className="w-full sm:w-auto shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova
            </Button>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar personalidade e temperamento' : 'Cadastrar personalidade e temperamento'}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? 'As alterações valem para todos os animais que usam esta personalidade.'
                    : deferCreateUntilAnimalSubmit
                      ? 'Preencha os dados agora. Eles só serão salvos no servidor quando você cadastrar o animal.'
                      : 'Crie uma personalidade reutilizável para os animais da sua ONG.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="personality-name">Nome*</Label>
                  <Input
                    id="personality-name"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Brincalhão e dócil"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="personality-description" className="leading-snug">
                    Descrição do temperamento* (máx. 200 caracteres)
                  </Label>
                  <Textarea
                    id="personality-description"
                    value={form.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setForm((prev) => ({ ...prev, description: e.target.value }));
                      }
                    }}
                    placeholder="Descreva o comportamento e temperamento"
                    rows={4}
                    maxLength={200}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {form.description.length}/200 caracteres
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : editingId ? (
                    'Salvar alterações'
                  ) : deferCreateUntilAnimalSubmit ? (
                    'Usar no cadastro'
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {!value && organizationId && (
        <p className="text-sm text-destructive">Personalidade e temperamento são obrigatórios</p>
      )}
      {!value && fallbackPersonalityText && personalities.length > 0 && (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          A personalidade antiga “{fallbackPersonalityText}” não foi encontrada no catálogo desta ONG. Selecione uma opção para atualizar o cadastro.
        </p>
      )}
      {selectedPersonality && (
        <p className="text-sm text-muted-foreground break-words">{selectedPersonality.description}</p>
      )}
      {value === DRAFT_PERSONALITY_ID && pendingPersonality && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Esta personalidade será registrada junto com o animal.
        </p>
      )}
    </div>
  );
};

export default PersonalitySelect;
