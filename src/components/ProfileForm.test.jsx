import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ProfileForm from './ProfileForm';

const filled = { name: 'Test', birthDate: '2000-01-01', birthTime: '12:00', location: 'Delhi' };

test('handles input and submit', () => {
  const handleChange = vi.fn();
  const handleSubmit = vi.fn(e => e.preventDefault());
  render(<ProfileForm form={filled} onChange={handleChange} onSubmit={handleSubmit} loading={false} />);
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New' } });
  expect(handleChange).toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(handleSubmit).toHaveBeenCalled();
});
