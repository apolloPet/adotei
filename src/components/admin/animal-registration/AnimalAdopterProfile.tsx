import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimalFormData } from "./types";

export interface AnimalAdopterProfileProps {
  formData: AnimalFormData;
  onFormChange: (updates: Partial<AnimalFormData>) => void;
}

const housingOptions: { value: 'house' | 'apartment' | 'farm'; label: string }[] = [
  { value: 'house', label: 'Casa' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'farm', label: 'Chácara/Sítio' },
];

const AnimalAdopterProfile = ({ formData, onFormChange }: AnimalAdopterProfileProps) => {
  const toggleHousing = (value: 'house' | 'apartment' | 'farm') => {
    const current = formData.suitableHousing ?? [];
    onFormChange({
      suitableHousing: current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-1">Perfil ideal do adotante</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Estas informações alimentam o match inteligente com o cadastro dos interessados.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tipos de moradia adequados</Label>
        <p className="text-xs text-muted-foreground">
          Define quais perfis de lar combinam com o animal — evita encaminhar para ambientes incompatíveis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {housingOptions.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`housing-${opt.value}`}
                checked={formData.suitableHousing?.includes(opt.value)}
                onCheckedChange={() => toggleHousing(opt.value)}
              />
              <Label htmlFor={`housing-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="requiresYard">Exige quintal</Label>
            <p className="text-xs text-muted-foreground">Animais ativos ou de grande porte precisam de espaço para gastar energia.</p>
          </div>
          <Switch
            id="requiresYard"
            checked={formData.requiresYard}
            onCheckedChange={(c) => onFormChange({ requiresYard: c })}
          />
        </div>
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="requiresWalledYard">Exige quintal murado</Label>
            <p className="text-xs text-muted-foreground">Previne fugas e atropelamentos — fundamental para cães escapistas.</p>
          </div>
          <Switch
            id="requiresWalledYard"
            checked={formData.requiresWalledYard}
            onCheckedChange={(c) => onFormChange({ requiresWalledYard: c })}
          />
        </div>
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="requiresWindowScreens">Exige telas em janelas</Label>
            <p className="text-xs text-muted-foreground">Obrigatório para gatos em apartamentos — evita o "síndrome do gato paraquedista".</p>
          </div>
          <Switch
            id="requiresWindowScreens"
            checked={formData.requiresWindowScreens}
            onCheckedChange={(c) => onFormChange({ requiresWindowScreens: c })}
          />
        </div>
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="allowsRented">Aceita imóvel alugado (com permissão)</Label>
            <p className="text-xs text-muted-foreground">Reduz o risco de devolução por mudança ou exigência do proprietário.</p>
          </div>
          <Switch
            id="allowsRented"
            checked={formData.allowsRented}
            onCheckedChange={(c) => onFormChange({ allowsRented: c })}
          />
        </div>
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="suitableForChildren">Adequado para lares com crianças</Label>
            <p className="text-xs text-muted-foreground">Evita acidentes com animais que não toleram manuseio infantil.</p>
          </div>
          <Switch
            id="suitableForChildren"
            checked={formData.suitableForChildren}
            onCheckedChange={(c) => onFormChange({ suitableForChildren: c })}
          />
        </div>
        <div className="flex items-start justify-between rounded-md border p-3 gap-3">
          <div>
            <Label htmlFor="suitableForFirstTimers">Adequado para iniciantes</Label>
            <p className="text-xs text-muted-foreground">Sinaliza se o animal exige tutor experiente — evita devoluções por inexperiência.</p>
          </div>
          <Switch
            id="suitableForFirstTimers"
            checked={formData.suitableForFirstTimers}
            onCheckedChange={(c) => onFormChange({ suitableForFirstTimers: c })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Experiência mínima recomendada</Label>
        <p className="text-xs text-muted-foreground">
          Animais com traumas ou comportamentos específicos exigem tutores que saibam lidar com a situação.
        </p>
        <RadioGroup
          value={formData.minResidentExperience}
          onValueChange={(v) => onFormChange({ minResidentExperience: v as AnimalFormData['minResidentExperience'] })}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="exp-none" />
            <Label htmlFor="exp-none">Nenhuma</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="some" id="exp-some" />
            <Label htmlFor="exp-some">Alguma</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="experienced" id="exp-exp" />
            <Label htmlFor="exp-exp">Experiente</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="maxHoursAloneDaily">Máx. horas sozinho por dia</Label>
          <Input
            id="maxHoursAloneDaily"
            type="number"
            min={0}
            max={24}
            value={formData.maxHoursAloneDaily}
            onChange={(e) => onFormChange({ maxHoursAloneDaily: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Custo mensal estimado</Label>
          <RadioGroup
            value={formData.estimatedMonthlyCost}
            onValueChange={(v) => onFormChange({ estimatedMonthlyCost: v as AnimalFormData['estimatedMonthlyCost'] })}
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="100-300" id="cost-1" />
              <Label htmlFor="cost-1">R$ 100–300</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="300-600" id="cost-2" />
              <Label htmlFor="cost-2">R$ 300–600</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="600+" id="cost-3" />
              <Label htmlFor="cost-3">R$ 600+</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border p-3">
        <div>
          <Label htmlFor="requiresEmergencyBudget">Exige reserva para emergências veterinárias</Label>
          <p className="text-xs text-muted-foreground">
            Marca o adotante como incompatível se ele declarar que não cobre emergências.
          </p>
        </div>
        <Switch
          id="requiresEmergencyBudget"
          checked={formData.requiresEmergencyBudget}
          onCheckedChange={(c) => onFormChange({ requiresEmergencyBudget: c })}
        />
      </div>
    </div>
  );
};

export default AnimalAdopterProfile;
