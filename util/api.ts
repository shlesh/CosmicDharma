// util/api.ts
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
// Normalize: strip trailing slashes, then append /api once
const API_BASE_URL = rawBase.replace(/\/+$/, '') + '/api';

export default function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;
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
    const ct = res.headers.get('content-type');
    let data: any = null;

    if (ct && ct.includes('application/json')) {
      try { data = await res.json(); } catch { throw new Error('Invalid JSON response from server'); }
    } else {
      const text = await res.text();
      throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}...`);
    }

    if (!res.ok) {
      const msg = data?.detail || data?.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(msg);
    }
    return data as T;
  } catch (error) {
    console.error('❌ API Error:', error);
    throw error;
  }
}

// --- Blog helpers (unchanged) ---
export const blogApi = {
  getPosts: async (params: {
    skip?: number; limit?: number; search?: string; tags?: string;
    published_only?: boolean; featured_only?: boolean;
  } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v !== undefined && qs.append(k, String(v)));
    const res = await fetch(`${API_BASE_URL}/posts?${qs}`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  },
  getPostBySlug: async (slug: string) => {
    const res = await fetch(`${API_BASE_URL}/posts/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },
  createPost: async (postData: Partial<{
    title: string; content: string; excerpt: string; published: boolean; featured: boolean; tags: string;
  }>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },
  updatePost: async (id: number, postData: Partial<{
    title: string; content: string; excerpt: string; published: boolean; featured: boolean; tags: string;
  }>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(postData),
    });
    if (!res.ok) throw new Error('Failed to update post');
    return res.json();
  },
  deletePost: async (id: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return true;
  },
  getFeaturedPosts: async (limit = 5) => {
    const res = await fetch(`${API_BASE_URL}/featured?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch featured posts');
    return res.json();
  },
  getTags: async () => {
    const res = await fetch(`${API_BASE_URL}/tags`);
    if (!res.ok) throw new Error('Failed to fetch tags');
    return res.json();
  },
};
