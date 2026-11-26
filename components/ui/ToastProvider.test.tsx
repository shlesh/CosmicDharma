import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

test('successes are polite; errors are alerts (the default)', () => {
  render(<ToastProvider><Buttons /></ToastProvider>);
  fireEvent.click(screen.getByText('ok'));
  fireEvent.click(screen.getByText('bad'));

  const ok = screen.getByRole('status');
  expect(ok.textContent).toBe('Saved');
  expect(ok.closest('[data-kind]')!.getAttribute('data-kind')).toBe('success');

  const bad = screen.getByRole('alert');
  expect(bad.textContent).toBe('Broke');
  expect(bad.closest('[data-kind]')!.getAttribute('data-kind')).toBe('error');
});

test('two toasts fired at once both show (ids no longer collide)', () => {
  render(<ToastProvider><Buttons /></ToastProvider>);
  fireEvent.click(screen.getByText('bad'));
  fireEvent.click(screen.getByText('bad'));
  expect(screen.getAllByRole('alert')).toHaveLength(2);
});

test('a toast can be dismissed', async () => {
  render(<ToastProvider><Buttons /></ToastProvider>);
  fireEvent.click(screen.getByText('ok'));
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
  await waitFor(() => expect(screen.queryByRole('status')).toBeNull()); // after the exit animation
});
