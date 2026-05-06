import { UserProfile } from '@/types/user';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface ProfileAlert {
  severity: AlertSeverity;
  message: string;
}

export const getProfileAlerts = (profile?: UserProfile | null): ProfileAlert[] => {
  if (!profile) return [];
  const alerts: ProfileAlert[] = [];
  const h = profile.extended?.housing;
  const e = profile.extended?.experience;
  const f = profile.extended?.financial;

  if (h?.ownership === 'rented' && h.rentAllowsPets === false) {
    alerts.push({ severity: 'critical', message: 'Mora em aluguel que não permite pets' });
  }
  if (e?.returnedAnimal) {
    alerts.push({ severity: 'warning', message: 'Já devolveu um animal' });
  }
  if (f && (!f.willCoverVaccines || !f.willCoverNeutering || !f.willCoverEmergencies)) {
    alerts.push({ severity: 'warning', message: 'Não aceita arcar com custos veterinários' });
  }
  if (profile.hasAllergies) {
    alerts.push({ severity: 'info', message: 'Possui alergia a animais' });
  }
  return alerts;
};
