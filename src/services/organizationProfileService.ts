import { apiRequest } from '@/lib/apiClient';

export type OrganizationVolunteerPublic = {
  id: string;
  fullName: string;
  phone?: string;
  organizationResponsible: boolean;
};

export type OrganizationPublicSummary = {
  id: string;
  legalName: string;
  tradeName?: string;
  displayName: string;
  city: string;
  state?: string;
  aboutText?: string;
  missionFocus?: string;
  foundedYear?: number;
  logoUrl?: string;
  animalsCount: number;
};

export type OrganizationPublicDetail = OrganizationPublicSummary & {
  cnpj?: string;
  primaryContactName: string;
  secondaryContactName?: string;
  contactPhone1: string;
  contactPhone2?: string;
  contactEmail?: string;
  addressLine?: string;
  storyText?: string;
  structureInfo?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  published: boolean;
  volunteers: OrganizationVolunteerPublic[];
};

export type UpdateOrganizationProfilePayload = {
  legalName: string;
  tradeName?: string | null;
  cnpj?: string | null;
  primaryContactName: string;
  secondaryContactName?: string | null;
  contactPhone1: string;
  contactPhone2?: string | null;
  contactEmail?: string | null;
  addressLine?: string | null;
  city: string;
  state?: string | null;
  aboutText?: string | null;
  storyText?: string | null;
  foundedYear?: number | null;
  missionFocus?: string | null;
  structureInfo?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  published?: boolean;
};

export const fetchPublicOrganizations = async (): Promise<OrganizationPublicSummary[]> =>
  apiRequest<OrganizationPublicSummary[]>('/api/organizations/public', { skipAuth: true });

export const fetchPublicOrganization = async (id: string): Promise<OrganizationPublicDetail> =>
  apiRequest<OrganizationPublicDetail>(`/api/organizations/${id}/public`, { skipAuth: true });

export const updateOrganizationProfile = async (
  id: string,
  payload: UpdateOrganizationProfilePayload,
): Promise<OrganizationPublicDetail> =>
  apiRequest<OrganizationPublicDetail>(`/api/organizations/${id}/profile`, {
    method: 'PUT',
    body: payload,
  });
