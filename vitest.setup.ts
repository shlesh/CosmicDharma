import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest runs without globals, so RTL can't register its auto-cleanup.
afterEach(() => cleanup());

if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // @ts-ignore
  window.IntersectionObserver = MockIntersectionObserver;
}
