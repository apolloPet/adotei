import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type VolunteerPermissions = {
  manageAnimals: boolean;
  approveAdoptions: boolean;
  manageUsers: boolean;
};

export const DEFAULT_VOLUNTEER_PERMISSIONS: VolunteerPermissions = {
  manageAnimals: true,
  approveAdoptions: true,
  manageUsers: false,
};

const LABELS: Array<{ key: keyof VolunteerPermissions; label: string; hint: string }> = [
  { key: 'manageAnimals', label: 'Animais', hint: 'Cadastrar e editar animais da ONG' },
  { key: 'approveAdoptions', label: 'Adoções', hint: 'Acompanhar e aprovar adoções' },
  { key: 'manageUsers', label: 'Usuários', hint: 'Cadastrar e editar usuários da ONG' },
];

export const readVolunteerPermissions = (
  permissions?: Partial<VolunteerPermissions> | null
): VolunteerPermissions => ({
  manageAnimals: permissions ? Boolean(permissions.manageAnimals) : DEFAULT_VOLUNTEER_PERMISSIONS.manageAnimals,
  approveAdoptions: permissions ? Boolean(permissions.approveAdoptions) : DEFAULT_VOLUNTEER_PERMISSIONS.approveAdoptions,
  manageUsers: permissions ? Boolean(permissions.manageUsers) : DEFAULT_VOLUNTEER_PERMISSIONS.manageUsers,
});

export const VolunteerPermissionBadges = ({ permissions }: { permissions?: Partial<VolunteerPermissions> | null }) => {
  const value = readVolunteerPermissions(permissions);
  const active = LABELS.filter(({ key }) => value[key]);

  if (active.length === 0) {
    return <span className="text-xs text-muted-foreground">Sem permissões</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {active.map(({ key, label }) => (
        <span key={key} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {label}
        </span>
      ))}
    </div>
  );
};

interface FieldsProps {
  value: VolunteerPermissions;
  onChange: (permissions: VolunteerPermissions) => void;
  disabled?: boolean;
}

export const VolunteerPermissionFields = ({ value, onChange, disabled }: FieldsProps) => (
  <div className="space-y-2">
    <Label>Permissões do voluntário</Label>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {LABELS.map(({ key, label, hint }) => (
        <label
          key={key}
          className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer"
        >
          <Checkbox
            checked={value[key]}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ ...value, [key]: checked === true })}
          />
          <span>
            <span className="block font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{hint}</span>
          </span>
        </label>
      ))}
    </div>
  </div>
);
