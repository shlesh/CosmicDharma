// util/api.ts (compat wrapper around util/http)
import { get, post, del, http } from './http';

export const fetchJson = async <T>(path: string, init?: RequestInit) => http<T>(path, init);
export const apiFetch = http;

// ---- Typed endpoints used across the app ----
export type JobStatus = 'queued' | 'pending' | 'running' | 'complete' | 'error';

export interface StartProfileJobRequest {
  name?: string;
  birthDate: string;   // UI value, e.g., "2000-06-23"
  birthTime: string;   // UI value, e.g., "04:26"
  location: string;
  lat?: number;
  lon?: number;
}

type BackendProfilePayload = {
  name?: string;
  date: string;
  time: string;
  location: string;
  lat?: number;
  lon?: number;
};

export interface StartProfileJobResponse { job_id: string; status?: JobStatus; message?: string; }

export interface BirthInfo {
  date?: string;
  time?: string;
  location?: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ProfileResult {
  birthInfo: BirthInfo;
  analysis?: Record<string, any>;
  coreElements?: Record<string, any>;
  planetaryPositions?: any[];
  houses?: Record<string, any>;
  vimshottariDasha?: any[];
  nakshatra?: Record<string, any>;
  divisionalCharts?: Record<string, any>;
  yogas?: Record<string, any>;
  shadbala?: Record<string, any>;
  bhavaBala?: Record<string, any>;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  progress?: number;
  result?: ProfileResult;
  error?: string;
}

export interface PanchangaRequest { date: string; time: string; location: string; }
export interface PanchangaResponse {
  vaara?: string;
  tithi?: { name: string };
  nakshatra?: { nakshatra: string };
  yoga?: { name: string };
  karana?: { name: string };
}

export const profileApi = {
  startJob: (body: StartProfileJobRequest) =>
    post<StartProfileJobResponse>('/profile/job', {
      name: body.name,
      date: body.birthDate,     // <-- mapped
      time: body.birthTime,     // <-- mapped
      location: body.location,
      lat: body.lat,
      lon: body.lon,
    } as BackendProfilePayload),

  jobStatus: (jobId: string) => get<JobStatusResponse>(`/jobs/${jobId}`),
};

export const panchangaApi = {
  compute: (body: PanchangaRequest) => post<PanchangaResponse>('/panchanga', body),
};

// blog endpoints kept for compatibility if you use them elsewhere
export const blogApi = {
  // Public
  getPosts: (qs: string = '') => get<BlogPostMeta[]>(`/posts${qs ? `?${qs}` : ''}`),
  getPostBySlug: (slug: string) => get<BlogPost>(`/posts/${slug}`),
  getFeaturedPosts: (limit = 5) => get<BlogPostMeta[]>(`/featured?limit=${limit}`),
  getTags: () => get<BlogTag[]>(`/tags`),
  // Admin
  createPost: (data: PostInput) => post<BlogPostMeta>('/posts', data),
  updatePost: (id: number, data: PostInput) => http<BlogPostMeta>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id: number) => del<boolean>(`/posts/${id}`),
  publishPost: (id: number) => post<BlogPostMeta>(`/posts/${id}/publish`, {}),
  unpublishPost: (id: number) => post<BlogPostMeta>(`/posts/${id}/unpublish`, {}),
};

// util/api.ts (additions)
export interface BlogTag { id: number; name: string; slug: string }
export interface BlogPostMeta { id: number; slug: string; title: string; summary?: string; published: boolean; tags?: BlogTag[]; created_at?: string; updated_at?: string }
export interface BlogPost extends BlogPostMeta { content: string }
export interface PostInput { title: string; slug?: string; summary?: string; content: string; tag_ids?: number[]; published?: boolean }


