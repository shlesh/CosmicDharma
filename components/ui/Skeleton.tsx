import { cn } from '@/util/cn';

/** A shimmering placeholder block. */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-xl bg-line/[0.06]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-line/[0.07] before:to-transparent',
        className,
      )}
    />
  );
}
