import { ProfileData, BlogPost, User } from '@/types';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new ApiError(error.detail || response.statusText, response.status);
    }

    return response.json();
  }

  // Authentication
  async login(username: string, password: string) {
    const formData = new URLSearchParams({ username, password });
    const response = await fetch(`${this.baseURL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.detail || 'Login failed', response.status);
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    is_donor?: boolean;
  }) {
    const data = await this.request<{ access_token: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.access_token);
    return data;
  }

  async logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Profile/Astrology
  async generateProfile(data: {
    date: string;
    time: string;
    location: string;
    ayanamsa?: string;
    house_system?: string;
  }): Promise<ProfileData> {
    return this.request<ProfileData>('/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateProfileJob(data: {
    date: string;
    time: string;
    location: string;
  }): Promise<{ job_id: string }> {
    return this.request<{ job_id: string }>('/profile/job', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJobStatus(jobId: string): Promise<{
    status: string;
    result?: ProfileData;
    error?: string;
  }> {
    return this.request(`/jobs/${jobId}`);
  }

  // Blog
  async getBlogPosts(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    tags?: string;
    published_only?: boolean;
    featured_only?: boolean;
  }): Promise<BlogPost[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    return this.request<BlogPost[]>(`/posts?${searchParams}`);
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    return this.request<BlogPost>(`/posts/${slug}`);
  }

  async createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    return this.request<BlogPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async updateBlogPost(id: number, post: Partial<BlogPost>): Promise<BlogPost> {
    return this.request<BlogPost>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
  }

  async deleteBlogPost(id: number): Promise<void> {
    await this.request(`/posts/${id}`, { method: 'DELETE' });
  }

  // User
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/admin/users');
  }
}

export class ApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();