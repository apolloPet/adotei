import { useEffect, useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, Loader2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';
import {
  createPersonality,
  listPersonalities,
  type Personality,
} from '@/services/personalityService';

export interface PersonalitySelectProps {
  organizationId?: string;
  value: string;
  onChange: (personalityId: string, personality?: Personality) => void;
  disabled?: boolean;
}

const EMPTY_FORM = { name: '', description: '' };

const PersonalitySelect = ({
  organizationId,
  value,
  onChange,
  disabled = false,
}: PersonalitySelectProps) => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const handleCreate = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    if (!name) {
      toast.error('Informe o nome da personalidade.');
      return;
    }
    if (!description) {
      toast.error('Informe a descrição da personalidade.');
      return;
    }
    if (description.length > 200) {
      toast.error('A descrição deve ter no máximo 200 caracteres.');
      return;
    }
    if (!organizationId) {
      toast.error('Selecione uma ONG antes de cadastrar personalidade.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPersonality({ name, description, active: true }, organizationId);
      setPersonalities((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      onChange(created.id, created);
      setForm(EMPTY_FORM);
      setDialogOpen(false);
      toast.success('Personalidade cadastrada com sucesso.');
    } catch (error) {
      console.error('Erro ao cadastrar personalidade:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar personalidade.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPersonality = personalities.find((p) => p.id === value);

  return (
    <div className="space-y-2 min-w-0">
      <Label className="flex flex-wrap items-center gap-x-1 gap-y-0.5">
        Personalidade & temperamento*
        {!value && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
      </Label>

      {!organizationId ? (
        <p className="text-sm text-muted-foreground break-words">
          Vincule o cadastro a uma ONG para selecionar ou criar personalidades.
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 min-w-0">
          <Select
            value={value || undefined}
            onValueChange={(id) => {
              const personality = personalities.find((p) => p.id === id);
              onChange(id, personality);
            }}
            disabled={disabled || isLoading || !organizationId}
          >
            <SelectTrigger className={`w-full min-w-0 sm:flex-1 ${!value ? 'border-destructive' : ''}`}>
              <SelectValue placeholder={isLoading ? 'Carregando...' : 'Selecione uma personalidade'} />
            </SelectTrigger>
            <SelectContent>
              {personalities.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  Nenhuma personalidade cadastrada
                </SelectItem>
              ) : (
                personalities.map((personality) => (
                  <SelectItem key={personality.id} value={personality.id}>
                    {personality.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" disabled={disabled || !organizationId} className="w-full sm:w-auto shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Nova
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar personalidade</DialogTitle>
                <DialogDescription>
                  Crie uma personalidade reutilizável para os animais da sua ONG.
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
                    Descrição* (máx. 200 caracteres)
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
                <Button type="button" onClick={handleCreate} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
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
        <p className="text-sm text-destructive">Personalidade é obrigatória</p>
      )}
      {selectedPersonality && (
        <p className="text-sm text-muted-foreground break-words">{selectedPersonality.description}</p>
      )}
    </div>
  );
};

export default PersonalitySelect;
