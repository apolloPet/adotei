import { ExtendedProfile } from '@/types/user';
import { normalizeEmail } from '@/utils/brMasks';

export const EXTENDED_PROFILE_KEY = 'user_profile_extended';
export const PENDING_ADOPTER_PROFILE_KEY = 'pending_adopter_profile_by_email';

export const loadExtendedProfile = (userId?: string | null): ExtendedProfile | null => {
  if (!userId) return null;
  try {
    const all = JSON.parse(localStorage.getItem(EXTENDED_PROFILE_KEY) || '{}') as Record<string, ExtendedProfile>;
    return all[userId] || null;
  } catch {
    return null;
  }
};

export const saveExtendedProfile = (userId: string, extended: ExtendedProfile): void => {
  const all = JSON.parse(localStorage.getItem(EXTENDED_PROFILE_KEY) || '{}') as Record<string, ExtendedProfile>;
  all[userId] = extended;
  localStorage.setItem(EXTENDED_PROFILE_KEY, JSON.stringify(all));
};

export const savePendingAdopterProfile = (email: string, extended: ExtendedProfile): void => {
  const all = JSON.parse(localStorage.getItem(PENDING_ADOPTER_PROFILE_KEY) || '{}') as Record<string, ExtendedProfile>;
  all[normalizeEmail(email)] = extended;
  localStorage.setItem(PENDING_ADOPTER_PROFILE_KEY, JSON.stringify(all));
};

export const consumePendingAdopterProfile = (email: string): ExtendedProfile | null => {
  try {
    const normalized = normalizeEmail(email);
    const all = JSON.parse(localStorage.getItem(PENDING_ADOPTER_PROFILE_KEY) || '{}') as Record<string, ExtendedProfile>;
    const pending = all[normalized];
    if (!pending) return null;
    delete all[normalized];
    localStorage.setItem(PENDING_ADOPTER_PROFILE_KEY, JSON.stringify(all));
    return pending;
  } catch {
    return null;
  }
};

export const parseHoursAloneDaily = (hoursAlone: string): number | undefined => {
  const value = hoursAlone.trim();
  if (!value) return undefined;
  if (value.includes('8') || value.includes('mais')) return 8;
  if (value.includes('4') && value.includes('8')) return 6;
  if (value.includes('4')) return 4;
  if (value.includes('2')) return 2;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
