import { apiRequest } from '@/lib/apiClient';

export type Personality = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  active: boolean;
};

export type PersonalityPayload = {
  name: string;
  description: string;
  active: boolean;
};

const buildUrl = (path: string, organizationId?: string) => {
  if (!organizationId) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}organizationId=${organizationId}`;
};

export const listPersonalities = async (organizationId?: string): Promise<Personality[]> => {
  return apiRequest<Personality[]>(buildUrl('/api/personalities', organizationId));
};

export const createPersonality = async (
  payload: PersonalityPayload,
  organizationId?: string,
): Promise<Personality> => {
  return apiRequest<Personality>(buildUrl('/api/personalities', organizationId), {
    method: 'POST',
    body: payload,
  });
};

export const updatePersonality = async (
  id: string,
  payload: PersonalityPayload,
): Promise<Personality> => {
  return apiRequest<Personality>(`/api/personalities/${id}`, {
    method: 'PUT',
    body: payload,
  });
};

export const deletePersonality = async (id: string): Promise<void> => {
  await apiRequest(`/api/personalities/${id}`, { method: 'DELETE' });
};
