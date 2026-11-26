// util/http.ts
export const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
const API_BASE = `${API_ROOT}/api`;

function formatDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => {
      if (!item || typeof item !== 'object') return String(item);
      const loc = Array.isArray((item as any).loc) ? (item as any).loc.join('.') : '';
      const msg = (item as any).msg || JSON.stringify(item);
      return loc ? `${loc}: ${msg}` : msg;
    }).join('; ');
  }
  if (detail && typeof detail === 'object') return JSON.stringify(detail);
  return String(detail ?? 'Request failed');
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const controller = new AbortController();
  const userSignal = init.signal as AbortSignal | undefined;
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

    // Parse by content, not by header: some proxies mislabel JSON, and a
    // non-JSON 2xx (e.g. an HTML error page) must not be handed back as data.
    const text = await res.text().catch(() => '');
    let body: any = null;
    let parsed = false;
    if (text) {
      try {
        body = JSON.parse(text);
        parsed = true;
      } catch {
        /* not JSON */
      }
    }

    if (!res.ok) {
      const raw = parsed && body ? (body.detail || body.message || body.error) : null;
      throw new Error(raw ? formatDetail(raw) : `${res.status} ${res.statusText}`);
    }

    if (!text) return {} as T; // e.g. 204 No Content
    if (!parsed) throw new Error('Invalid JSON response');
    return body as T;
  } finally {
    if (timeoutId) clearTimeout(timeoutId as any);
  }
}

export const get = <T>(path: string, init?: RequestInit) => http<T>(path, { ...init, method: 'GET' });
export const post = <T, B = unknown>(path: string, body?: B, init?: RequestInit) =>
  http<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const del = <T>(path: string, init?: RequestInit) => http<T>(path, { ...init, method: 'DELETE' });
