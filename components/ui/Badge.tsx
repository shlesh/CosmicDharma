import React from 'react';
import { cn } from '@/util/cn';

type Tone = 'neutral' | 'accent' | 'lunar' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'border-line/15 bg-line/[0.05] text-muted',
  accent: 'border-accent/30 bg-accent/10 text-accent',
  lunar: 'border-lunar/30 bg-lunar/10 text-lunar',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
};

export default function Badge({
  tone = 'neutral',
  className,
  children,
  ...props
}: { tone?: Tone } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Map the API's favourable / mixed / caution vocabulary to a badge tone. */
export function qualityTone(quality?: string): Tone {
  if (quality === 'favorable') return 'success';
  if (quality === 'caution' || quality === 'unfavorable') return 'warning';
  return 'neutral';
}
