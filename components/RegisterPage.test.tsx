import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import RegisterPage from '../pages/register';
import ToastProvider from './ToastProvider';

vi.mock('next/router', () => ({
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock('../util/api', () => ({
  default: vi.fn()
}));

test('renders labels for register form', () => {
  render(
    <ToastProvider>
      <RegisterPage />
    </ToastProvider>
  );
  expect(screen.getByLabelText(/username/i)).toBeDefined();
  expect(screen.getByLabelText(/email/i)).toBeDefined();
  expect(screen.getByLabelText(/password/i)).toBeDefined();
});
