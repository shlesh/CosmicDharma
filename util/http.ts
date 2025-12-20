// util/http.ts
export const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_BASE = `${API_ROOT}/api`;

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const controller = new AbortController();
  const userSignal = init.signal as AbortSignal | undefined;

  // 45s safety timeout unless a signal is provided
  const timeoutId = userSignal ? null : setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(`${API_BASE}${clean}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(typeof window !== 'undefined' && localStorage.getItem('token')
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}),
        ...(init.headers || {}),
      },
      credentials: 'include',
      mode: 'cors',
      signal: userSignal ?? controller.signal,
    });

    const ctype = res.headers.get('content-type') || '';
    const isJSON = ctype.includes('application/json');

    const body = isJSON
      ? await res.json().catch(() => null)
      : await res.text().catch(() => '');

    if (!res.ok) {
      const detail = (isJSON && body && (body.detail || body.message || body.error)) || `${res.status} ${res.statusText}`;
      throw new Error(detail);
    }

    return (body ?? ({} as unknown)) as T;
  } finally {
    if (timeoutId) clearTimeout(timeoutId as any);
  }
}

export const get = <T>(path: string, init?: RequestInit) => http<T>(path, { ...init, method: 'GET' });
export const post = <T, B = unknown>(path: string, body?: B, init?: RequestInit) =>
  http<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const del = <T>(path: string, init?: RequestInit) => http<T>(path, { ...init, method: 'DELETE' });