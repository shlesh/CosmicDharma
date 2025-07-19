// util/api.ts - Fixed version
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  // Clean path - remove /api prefix if present since backend doesn't use it
  const cleanPath = path.replace(/^\/api/, '');
  const url = `${API_BASE}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`;
  
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
  });
}

export async function fetchJson<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  try {
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
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}