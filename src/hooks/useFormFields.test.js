import { renderHook, act } from '@testing-library/react';
import { expect, test } from 'vitest';
import useFormFields from './useFormFields';

test('updates fields on change', () => {
  const { result } = renderHook(() => useFormFields({ name: '' }));

  act(() => {
    result.current[1]({ target: { name: 'name', value: 'Alice' } });
  });

  expect(result.current[0].name).toBe('Alice');
});
