import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test } from 'vitest';
import ToastProvider, { useToast } from './ToastProvider';

function Buttons() {
  const toast = useToast();
  return (
    <>
      <button onClick={() => toast('Saved', 'success')}>ok</button>
      <button onClick={() => toast('Broke')}>bad</button>
    </>
  );
}

test('successes are polite and green; errors are alerts and red (the default)', () => {
  render(<ToastProvider><Buttons /></ToastProvider>);
  fireEvent.click(screen.getByText('ok'));
  fireEvent.click(screen.getByText('bad'));

  const ok = screen.getByRole('status');
  expect(ok.textContent).toBe('Saved');
  expect(ok.className).toContain('bg-emerald-600');

  const bad = screen.getByRole('alert');
  expect(bad.textContent).toBe('Broke');
  expect(bad.className).toContain('bg-red-600');
});

test('two toasts fired at once both show (ids no longer collide)', () => {
  render(<ToastProvider><Buttons /></ToastProvider>);
  fireEvent.click(screen.getByText('bad'));
  fireEvent.click(screen.getByText('bad'));
  expect(screen.getAllByRole('alert')).toHaveLength(2);
});
