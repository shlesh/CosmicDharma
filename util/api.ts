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

// Blog API functions
export const blogApi = {
  // Get all posts with pagination and filters
  getPosts: async (params: {
    skip?: number;
    limit?: number;
    search?: string;
    tags?: string;
    published_only?: boolean;
    featured_only?: boolean;
  } = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/posts?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Get single post by slug
  getPostBySlug: async (slug: string) => {
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`);
    if (!response.ok) throw new Error('Post not found');
    return response.json();
  },

  // Get single post by ID
  getPostById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/posts/id/${id}`);
    if (!response.ok) throw new Error('Post not found');
    return response.json();
  },

  // Create new post
  createPost: async (postData: {
    title: string;
    content: string;
    excerpt?: string;
    published?: boolean;
    featured?: boolean;
    tags?: string;
  }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Update post
  updatePost: async (id: number, postData: Partial<{
    title: string;
    content: string;
    excerpt: string;
    published: boolean;
    featured: boolean;
    tags: string;
  }>) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });
    
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },

  // Delete post
  deletePost: async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to delete post');
  },

  // Get featured posts
  getFeaturedPosts: async (limit: number = 5) => {
    const response = await fetch(`${API_BASE_URL}/featured?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch featured posts');
    return response.json();
  },

  // Get all tags
  getTags: async () => {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  },
};
