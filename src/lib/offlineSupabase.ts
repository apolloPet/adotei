type OfflineUser = {
  id: string;
  email?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
};

type OfflineSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: OfflineUser;
};

type Filter = {
  column: string;
  operator: 'eq' | 'neq' | 'in' | 'ilike' | 'gte' | 'lte';
  value: unknown;
};

const storageAvailable = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const getStoredEmail = () => (storageAvailable() ? localStorage.getItem('userEmail') : null);
const getStoredUserId = () => getStoredEmail() || 'offline-user';

const createOfflineUser = (email = getStoredEmail() || 'admin@petmatch.com'): OfflineUser => ({
  id: email,
  email,
  app_metadata: email.includes('@admin') || email.includes('@ong') ? { role: 'admin' } : {},
  user_metadata: email.includes('@admin') || email.includes('@ong') ? { isAdmin: true } : {},
});

const createOfflineSession = (email = getStoredEmail() || 'admin@petmatch.com'): OfflineSession => ({
  access_token: 'offline-access-token',
  refresh_token: 'offline-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  user: createOfflineUser(email),
});

const readTable = (table: string): any[] => {
  if (!storageAvailable()) return [];
  try {
    return JSON.parse(localStorage.getItem(`offline-table-${table}`) || '[]');
  } catch {
    return [];
  }
};

const writeTable = (table: string, rows: any[]) => {
  if (storageAvailable()) {
    localStorage.setItem(`offline-table-${table}`, JSON.stringify(rows));
  }
};

class OfflineQueryBuilder implements PromiseLike<{ data: any; error: null }> {
  private filters: Filter[] = [];
  private operation: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private payload: any = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;
  private limitValue: number | null = null;
  private orderConfig: { column: string; ascending: boolean } | null = null;

  constructor(private table: string) {}

  select() { this.operation = this.operation === 'select' ? 'select' : this.operation; return this; }
  insert(payload: any) { this.operation = 'insert'; this.payload = payload; return this; }
  upsert(payload: any) { this.operation = 'upsert'; this.payload = payload; return this; }
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

  then<TResult1 = { data: any; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
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

  private async execute() {
    const now = new Date().toISOString();
    const existingRows = readTable(this.table);
    let data: any = [];

    if (this.operation === 'insert' || this.operation === 'upsert') {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((row) => ({
        id: row?.id || `offline-${crypto.randomUUID?.() || Date.now()}`,
        created_at: row?.created_at || now,
        updated_at: row?.updated_at || now,
        ...row,
      }));
      writeTable(this.table, [...existingRows, ...rows]);
      data = rows;
    } else if (this.operation === 'update') {
      const updatedRows = existingRows.map((row) => this.matches(row) ? { ...row, ...this.payload, updated_at: now } : row);
      writeTable(this.table, updatedRows);
      data = updatedRows.filter((row) => this.matches(row));
    } else if (this.operation === 'delete') {
      const remainingRows = existingRows.filter((row) => !this.matches(row));
      writeTable(this.table, remainingRows);
      data = [];
    } else {
      data = existingRows.filter((row) => this.matches(row));
    }

    if (this.orderConfig) {
      const { column, ascending } = this.orderConfig;
      data = [...data].sort((a, b) => ascending ? String(a?.[column]).localeCompare(String(b?.[column])) : String(b?.[column]).localeCompare(String(a?.[column])));
    }

    if (this.limitValue !== null) data = data.slice(0, this.limitValue);
    if (this.singleMode) data = data[0] || null;

    return { data, error: null };
  }
}

export const offlineSupabase = {
  auth: {
    getSession: async () => ({ data: { session: storageAvailable() && localStorage.getItem('isLoggedIn') === 'true' ? createOfflineSession() : null }, error: null }),
    getUser: async () => ({ data: { user: storageAvailable() && localStorage.getItem('isLoggedIn') === 'true' ? createOfflineUser() : null }, error: null }),
    refreshSession: async () => ({ data: { session: createOfflineSession() }, error: null }),
    signInWithPassword: async ({ email }: { email: string; password: string }) => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('isAdmin', String(email.includes('@admin') || email.includes('@ong') || email === 'admin@petmatch.com'));
      localStorage.setItem('userEmail', email);
      return { data: { user: createOfflineUser(email), session: createOfflineSession(email) }, error: null };
    },
    signUp: async ({ email }: { email: string; password: string; options?: unknown }) => ({ data: { user: createOfflineUser(email), session: createOfflineSession(email) }, error: null }),
    signOut: async () => ({ error: null }),
    updateUser: async () => ({ data: { user: createOfflineUser() }, error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    resend: async () => ({ data: {}, error: null }),
    verifyOtp: async () => ({ data: { user: createOfflineUser(), session: createOfflineSession() }, error: null }),
    onAuthStateChange: (callback: (event: string, session: OfflineSession | null) => void) => {
      setTimeout(() => callback('INITIAL_SESSION', storageAvailable() && localStorage.getItem('isLoggedIn') === 'true' ? createOfflineSession() : null), 0);
      return { data: { subscription: { unsubscribe: () => undefined } } };
    },
  },
  from: (table: string) => new OfflineQueryBuilder(table),
  functions: {
    invoke: async (name: string, options?: any) => ({
      data: {
        success: true,
        data: name === 'admin-management' && options?.method === 'GET' ? [{
          id: 'admin@petmatch.com',
          user_id: 'admin@petmatch.com',
          email: 'admin@petmatch.com',
          role: 'admin',
          permissions: ['all'],
          created_at: new Date().toISOString(),
        }] : [],
        message: 'Modo local ativo',
      },
      error: null,
    }),
  },
  storage: {
    from: () => ({
      upload: async (path: string) => ({ data: { path }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
      remove: async () => ({ data: [], error: null }),
    }),
  },
  rpc: async () => ({ data: null, error: null }),
};