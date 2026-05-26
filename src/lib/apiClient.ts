import { toast } from '@/hooks/use-sonner';

export const getApiBaseUrl = (): string => {
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '');
  if (envBaseUrl) {
    return envBaseUrl;
  }

  // When Vite runs on :8080 locally, backend usually runs on :8081.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '8080') {
    return 'http://localhost:8081';
  }

  return 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_TOKEN_KEY = 'authToken';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return;
  }
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options;

  const token = getAuthToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (!skipAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const errorBody = await response.json() as { message?: string };
      if (errorBody?.message) {
        message = errorBody.message;
      }
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const responseText = await response.text();

  if (!responseText.trim()) {
    return undefined as T;
  }

  if (contentType.includes('text/html')) {
    throw new Error(`Resposta invalida da API em ${API_BASE_URL}${path}. Configure VITE_API_BASE_URL corretamente.`);
  }

  return JSON.parse(responseText) as T;
};

export const handleApiError = (error: unknown, fallbackMessage: string) => {
  const message = error instanceof Error ? error.message : fallbackMessage;
  toast.error(message || fallbackMessage);
};
