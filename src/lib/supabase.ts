
import { toast } from '@/hooks/use-sonner';
import { apiRequest, getAuthToken, setAuthToken } from './apiClient';
import { offlineSupabase } from './offlineSupabase';

type Filter = {
  column: string;
  operator: 'eq' | 'neq' | 'in' | 'ilike' | 'gte' | 'lte';
  value: unknown;
};

type BackendUserSession = {
  id: string;
  authSubject: string;
  fullName: string;
  email: string;
  userType: string;
  roles: string[];
};

type BackendAuthResponse = {
  accessToken: string;
  expiresAt: string;
  user: BackendUserSession;
};

const AUTH_USER_KEY = 'authUser';

const getStoredUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw || localStorage.getItem('isLoggedIn') !== 'true') {
    return null;
  }

  try {
    const user = JSON.parse(raw) as BackendUserSession;
    const isAdmin = user.roles.includes('ADMIN');
    return {
      id: user.authSubject,
      email: user.email,
      app_metadata: { role: isAdmin ? 'admin' : 'user' },
      user_metadata: {
        isAdmin,
        fullName: user.fullName,
        userType: user.userType,
        roles: user.roles,
      },
    };
  } catch {
    return null;
  }
};

const parseJwtExpiresAt = (token: string): number => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      return Math.floor(Date.now() / 1000) + 60 * 60;
    }
    const payload = JSON.parse(atob(payloadBase64)) as { exp?: number };
    return payload.exp ?? Math.floor(Date.now() / 1000) + 60 * 60;
  } catch {
    return Math.floor(Date.now() / 1000) + 60 * 60;
  }
};

const getStoredSession = () => {
  const user = getStoredUser();
  const token = getAuthToken();
  if (!user) {
    return null;
  }
  return {
    access_token: token || 'local-dev-token',
    refresh_token: 'local-refresh-token',
    expires_at: token ? parseJwtExpiresAt(token) : Math.floor(Date.now() / 1000) + 60 * 60,
    user,
  };
};

const mapTableToEndpoint = (table: string): string | null => {
  switch (table) {
    case 'animals':
    case 'pets':
      return '/api/animals';
    case 'users':
      return '/api/users';
    case 'shelters':
    case 'organizations':
      return '/api/organizations';
    case 'tutors':
      return '/api/tutors';
    case 'vaccines':
      return '/api/vaccines';
    case 'temperament_trait':
    case 'temperament_traits':
      return '/api/temperament-traits';
    case 'adoption_requirement':
    case 'adoption_requirements':
      return '/api/adoption-requirements';
    case 'system_parameter':
    case 'system_parameters':
      return '/api/system-parameters';
    default:
      return null;
  }
};

class BackendQueryBuilder implements PromiseLike<{ data: any; error: any }> {
  private filters: Filter[] = [];
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private payload: any = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private orderConfig: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;

  constructor(private readonly table: string) {}

  select() { return this; }
  insert(payload: any) { this.operation = 'insert'; this.payload = payload; return this; }
  update(payload: any) { this.operation = 'update'; this.payload = payload; return this; }
  delete() { this.operation = 'delete'; return this; }
  eq(column: string, value: unknown) { this.filters.push({ column, operator: 'eq', value }); return this; }
  neq(column: string, value: unknown) { this.filters.push({ column, operator: 'neq', value }); return this; }
  in(column: string, value: unknown[]) { this.filters.push({ column, operator: 'in', value }); return this; }
  ilike(column: string, value: string) { this.filters.push({ column, operator: 'ilike', value }); return this; }
  gte(column: string, value: unknown) { this.filters.push({ column, operator: 'gte', value }); return this; }
  lte(column: string, value: unknown) { this.filters.push({ column, operator: 'lte', value }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orderConfig = { column, ascending: options?.ascending ?? true }; return this; }
  limit(value: number) { this.limitValue = value; return this; }
  range(_from: number, to: number) { this.limitValue = to + 1; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybeSingle'; return this; }
  or() { return this; }
  upsert(payload: any) { this.operation = 'insert'; this.payload = payload; return this; }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matches(row: any) {
    return this.filters.every(({ column, operator, value }) => {
      const current = row?.[column];
      if (operator === 'eq') return current === value;
      if (operator === 'neq') return current !== value;
      if (operator === 'in') return Array.isArray(value) && value.includes(current);
      if (operator === 'ilike') return String(current || '').toLowerCase().includes(String(value).replace(/%/g, '').toLowerCase());
      if (operator === 'gte') return current >= value;
      if (operator === 'lte') return current <= value;
      return true;
    });
  }

  private normalizePayload(payload: any) {
    if (this.table === 'animals') {
      return {
        name: payload.nome ?? payload.name,
        animalType: payload.tipo ?? payload.animalType,
        ageYears: payload.idade ?? payload.ageYears ?? 0,
        sex: payload.sexo ?? payload.sex ?? 'macho',
        size: payload.porte ?? payload.size ?? 'medio',
        description: payload.descricao ?? payload.description ?? '',
        sterilized: payload.castrado ?? payload.sterilized ?? false,
        vaccinationStatus: Array.isArray(payload.vacinas) ? payload.vacinas[0] : payload.vaccinationStatus,
      };
    }

    return payload;
  }

  private async execute() {
    const endpoint = mapTableToEndpoint(this.table);
    if (!endpoint) {
      return { data: null, error: { message: `Tabela não suportada: ${this.table}` } };
    }

    try {
      if (this.operation === 'insert') {
        const body = Array.isArray(this.payload) ? this.payload[0] : this.payload;
        const response = await apiRequest<any>(endpoint, { method: 'POST', body: this.normalizePayload(body) });
        const data = this.singleMode ? response : [response];
        return { data, error: null };
      }

      if (this.operation === 'update') {
        const idFilter = this.filters.find((filter) => filter.column === 'id' && filter.operator === 'eq');
        if (!idFilter) {
          return { data: null, error: { message: 'Filtro por id é obrigatório para update' } };
        }
        const response = await apiRequest<any>(`${endpoint}/${idFilter.value}`, {
          method: 'PUT',
          body: this.normalizePayload(this.payload),
        });
        return { data: this.singleMode ? response : [response], error: null };
      }

      if (this.operation === 'delete') {
        const idFilter = this.filters.find((filter) => filter.column === 'id' && filter.operator === 'eq');
        if (!idFilter) {
          return { data: null, error: { message: 'Filtro por id é obrigatório para delete' } };
        }
        await apiRequest(`${endpoint}/${idFilter.value}`, { method: 'DELETE' });
        return { data: [], error: null };
      }

      let data = await apiRequest<any[]>(endpoint);
      data = data.filter((row) => this.matches(row));

      if (this.orderConfig) {
        const { column, ascending } = this.orderConfig;
        data = [...data].sort((a, b) =>
          ascending
            ? String(a?.[column] ?? '').localeCompare(String(b?.[column] ?? ''))
            : String(b?.[column] ?? '').localeCompare(String(a?.[column] ?? '')),
        );
      }

      if (this.limitValue !== null) {
        data = data.slice(0, this.limitValue);
      }

      if (this.singleMode) {
        return { data: data[0] || null, error: null };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

const dispatchAuthChange = () => {
  window.dispatchEvent(new Event('authStateChanged'));
  window.dispatchEvent(new Event('storage'));
};

const persistAuth = (token: string, user: BackendUserSession) => {
  const isAdmin = user.roles.includes('ADMIN');
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('isAdmin', String(isAdmin));
  localStorage.setItem('userEmail', user.email);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  setAuthToken(token);
  dispatchAuthChange();
};

export const supabase = {
  auth: {
    getSession: async () => {
      const token = getAuthToken();
      if (!token) {
        return { data: { session: null }, error: null };
      }

      if (!localStorage.getItem(AUTH_USER_KEY)) {
        try {
          const me = await apiRequest<BackendUserSession>('/api/auth/me');
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(me));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('isAdmin', String(me.roles.includes('ADMIN')));
          localStorage.setItem('userEmail', me.email);
        } catch {
          setAuthToken(null);
          localStorage.removeItem(AUTH_USER_KEY);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('userEmail');
          return { data: { session: null }, error: null };
        }
      }

      return { data: { session: getStoredSession() }, error: null };
    },
    getUser: async () => ({ data: { user: getStoredUser() }, error: null }),
    refreshSession: async () => ({ data: { session: getStoredSession() }, error: null }),
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await apiRequest<BackendAuthResponse>('/api/auth/login', {
          method: 'POST',
          body: { email, password },
          skipAuth: true,
        });
        persistAuth(response.accessToken, response.user);
        return { data: { user: getStoredUser(), session: getStoredSession() }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      try {
        const fullName = options?.data?.name || email;
        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: {
            fullName,
            email,
            password,
            phone: '',
            addressLine: '',
            addressNumber: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
          },
          skipAuth: true,
        });

        return {
          data: { user: { id: email, email }, session: null },
          error: null,
        };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    signOut: async (_options?: unknown) => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userEmail');
      localStorage.removeItem(AUTH_USER_KEY);
      setAuthToken(null);
      dispatchAuthChange();
      return { error: null };
    },
    updateUser: async () => ({ data: { user: getStoredUser() }, error: new Error('Operacao nao suportada') }),
    resetPasswordForEmail: async () => ({ data: {}, error: new Error('Recuperacao por email nao implementada') }),
    resend: async () => ({ data: {}, error: null }),
    verifyOtp: async () => ({ data: { user: getStoredUser(), session: getStoredSession() }, error: null }),
    onAuthStateChange: (callback: (event: string, session: any | null) => void) => {
      setTimeout(() => callback('INITIAL_SESSION', getStoredSession()), 0);
      const handler = () => callback('TOKEN_REFRESHED', getStoredSession());
      window.addEventListener('authStateChanged', handler);
      return {
        data: {
          subscription: {
            unsubscribe: () => window.removeEventListener('authStateChanged', handler),
          },
        },
      };
    },
  },
  from: (table: string) => {
    if (!mapTableToEndpoint(table)) {
      return offlineSupabase.from(table);
    }
    return new BackendQueryBuilder(table);
  },
  functions: {
    invoke: async (name: string, options?: any) => {
      try {
        if (name === 'admin-management') {
          if (options?.method === 'GET') {
            const users = await apiRequest<any[]>('/api/users');
            return { data: { success: true, data: users }, error: null };
          }
          if (options?.method === 'POST') {
            const payload = typeof options?.body === 'string' ? JSON.parse(options.body) : options?.body;
            const created = await apiRequest('/api/users', {
              method: 'POST',
              body: {
                authSubject: payload.email,
                fullName: payload.name ?? payload.email,
                email: payload.email,
                userType: 'ADMIN',
                roles: ['ADMIN'],
              },
            });
            return { data: { success: true, data: created, message: 'Administrador criado' }, error: null };
          }
        }

        if (name === 'user-profile' && options?.method === 'GET') {
          const data = await apiRequest('/api/users/me');
          return { data: { success: true, data }, error: null };
        }

        if (name === 'user-profile' && options?.method === 'POST') {
          const payload = typeof options?.body === 'string' ? JSON.parse(options.body) : options?.body;
          const data = await apiRequest('/api/users/me', {
            method: 'PUT',
            body: {
              fullName: payload?.name || '',
              phone: payload?.phone || '',
              addressLine: payload?.address || '',
              addressNumber: '',
              neighborhood: '',
              city: payload?.city || '',
              state: payload?.state || '',
              zipCode: payload?.zip || '',
            },
          });
          return { data: { success: true, data }, error: null };
        }

        if (name === 'animals' && options?.body) {
          const payload = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
          const created = await apiRequest('/api/animals', {
            method: 'POST',
            body: {
              name: payload.nome,
              animalType: payload.tipo,
              ageYears: payload.idade,
              sex: payload.sexo,
              size: payload.porte,
              description: payload.descricao,
              sterilized: payload.castrado,
              vaccinationStatus: payload.vacinas?.[0],
            },
          });
          return { data: created, error: null };
        }
      } catch (error) {
        return { data: null, error };
      }

      return offlineSupabase.functions.invoke(name, options);
    },
  },
  storage: offlineSupabase.storage,
  rpc: offlineSupabase.rpc,
} as any;

export const isSupabaseConfigured = async () => true;

// Handle errors in a standardized way
export const handleSupabaseError = (error: any, defaultMessage: string = 'Ocorreu um erro') => {
  console.error('Erro do Supabase:', error);
  
  // Check for specific authentication errors
  if (error?.name === 'AuthSessionMissingError') {
    toast.error('Sua sessão expirou. Por favor, faça login novamente para continuar.');
    return;
  }
  
  // Handle specific known errors
  if (error?.message?.includes('Email link is invalid or has expired')) {
    toast.error('O link de email é inválido ou expirou. Por favor, solicite um novo link.');
    return;
  }

  if (error?.message?.includes('User already registered')) {
    toast.error('Este email já está cadastrado. Por favor, tente fazer login ou recuperar sua senha.');
    return;
  }
  
  // Handle database error codes
  if (error?.code) {
    switch (error.code) {
      case '23505':
        toast.error('Este registro já existe no sistema.');
        return;
      case '42501':
        toast.error('Você não tem permissão para realizar esta operação.');
        return;
      case '23502':
        toast.error('Dados incompletos. Preencha todos os campos obrigatórios.');
        return;
      case 'PGRST301':
        toast.error('A consulta não retornou resultados.');
        return;
    }
  }
  
  // Handle other errors
  const errorMessage = error?.message || defaultMessage;
  toast.error(errorMessage);
};
