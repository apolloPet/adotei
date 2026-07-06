import { getApiBaseUrl, getAuthToken } from '@/lib/apiClient';

/**
 * Endpoint autenticado que serve os binários das imagens dos animais.
 * A tag <img> não envia o header Authorization, então no Safari iOS (que
 * bloqueia cookies de terceiros via ITP) o carregamento direto falha.
 * Aqui baixamos o binário com o Bearer token e servimos via object URL,
 * o que funciona em todos os navegadores independentemente de cookies.
 */
const AUTH_IMAGE_PATH = '/api/animals/images/';

const objectUrlCache = new Map<string, Promise<string>>();

export const isAuthApiImage = (src?: string | null): boolean => {
  if (!src) {
    return false;
  }
  return src.includes(AUTH_IMAGE_PATH);
};

export const loadAuthedImage = (src: string): Promise<string> => {
  const cached = objectUrlCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    const token = getAuthToken();
    const response = await fetch(src, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Falha ao carregar imagem (${response.status})`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  })();

  // Evita reprocessar em caso de falha (permite nova tentativa depois).
  promise.catch(() => objectUrlCache.delete(src));
  objectUrlCache.set(src, promise);
  return promise;
};

export { getApiBaseUrl };
