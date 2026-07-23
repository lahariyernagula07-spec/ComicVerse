import { useAuth } from '@clerk/react';
import { useCallback } from 'react';

export function useAuthFetch() {
  const { getToken } = useAuth();

  return useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getToken();
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      },
    });
  }, [getToken]);
}
