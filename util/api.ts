const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // Ensure path starts with /api if not already
  const apiPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : '/' + path}`;
  const url = `${API_BASE}${apiPath}`;
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for CORS
  });
}

export async function fetchJson<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, options);
  
  let data: any;
  const contentType = res.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }
  } else {
    const text = await res.text();
    throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}...`);
  }
  
  if (!res.ok) {
    const errorMessage = data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMessage);
  }
  
  return data;
}

// Helper function for authenticated requests
export async function fetchWithAuth<T = unknown>(
  path: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return fetchJson<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}