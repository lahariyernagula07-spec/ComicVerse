import { setBaseUrl, setAuthTokenGetter } from '@workspace/api-client-react';

const API_URL = 'http://localhost:3000';

setBaseUrl(`${API_URL}/api`);

let getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn;

  setAuthTokenGetter(async () => (await fn()) ?? '');
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken ? await getToken() : null;

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

export const apiBase = `${API_URL}/api`;