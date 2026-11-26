import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/util/cn';

export const controlClass =
  'block w-full rounded-xl border border-line/15 bg-surface-2/60 px-4 text-[16px] text-fg placeholder:text-subtle ' +
  'transition-[border-color,box-shadow,background-color] duration-200 ' +
  'hover:border-line/25 focus:border-accent/70 focus:bg-surface-2 focus:outline-none focus:ring-4 focus:ring-accent/15 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'aria-[invalid=true]:border-danger/70 aria-[invalid=true]:focus:ring-danger/15';
// 16px text stops iOS Safari from zooming into a field on focus.

type FieldRenderProps = { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string };

/**
 * Label + control + hint/error, wired together for screen readers. Pass the control as a render
 * function so it receives the generated id and aria attributes.
 */
export function Field({
  label,
  hint,
  error,
  id: givenId,
  optional,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  id?: string;
  optional?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}) {
  const autoId = useId();
  const id = givenId || autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-fg/90">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-subtle">Optional</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlClass, 'h-12', className)} {...props} />,
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(controlClass, 'h-12 appearance-none pr-10', className)} {...props}>
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </div>
  ),
);
Select.displayName = 'Select';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(controlClass, 'py-3 leading-relaxed', className)} {...props} />,
);
Textarea.displayName = 'Textarea';

/** A form-level message (role=alert), e.g. "Incorrect username or password". */
export function FormError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {children}
    </div>
  );
}
