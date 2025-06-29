import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchJson } from './api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchJson', () => {
  it('throws error when response JSON is invalid', async () => {
    const res = new Response('invalid', { status: 200 });
    vi.spyOn(global, 'fetch').mockResolvedValue(res as any);
    await expect(fetchJson('/test')).rejects.toThrow('Invalid JSON response');
  });

  it('uses detail message from non-ok response', async () => {
    const body = JSON.stringify({ detail: 'bad' });
    const res = new Response(body, { status: 400, statusText: 'Bad' });
    vi.spyOn(global, 'fetch').mockResolvedValue(res as any);
    await expect(fetchJson('/test')).rejects.toThrow('bad');
  });
});
