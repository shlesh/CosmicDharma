import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest runs without globals, so RTL can't register its auto-cleanup.
afterEach(() => cleanup());

// Components read the Next router (e.g. <Seo> for the canonical URL). Tests have no Next app, so
// provide a quiet stand-in; a test that cares can still vi.mock('next/router') itself.
vi.mock('next/router', () => {
  const router = {
    pathname: '/',
    asPath: '/',
    route: '/',
    query: {},
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(async () => undefined),
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  };
  return { useRouter: () => router, default: router };
});

if (typeof window !== 'undefined') {
  if (!('IntersectionObserver' in window)) {
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    }
    // @ts-ignore
    window.IntersectionObserver = MockIntersectionObserver;
  }
  if (!window.matchMedia) {
    // @ts-ignore
    window.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
  }
  // jsdom's scrollTo only logs "not implemented".
  window.scrollTo = (() => {}) as any;
}
