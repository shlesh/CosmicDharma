import { cn } from '@/util/cn';

/** The mark: a ring (the zodiac) with an eight-pointed star at its centre. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14.25" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
      <path
        d="M16 5 L17.61 12.12 L21.09 10.91 L19.88 14.39 L27 16 L19.88 17.61 L21.09 21.09 L17.61 19.88 L16 27 L14.39 19.88 L10.91 21.09 L12.12 17.61 L5 16 L12.12 14.39 L10.91 10.91 L14.39 12.12Z"
        fill="currentColor"
      />
      <circle cx="16" cy="16" r="1.6" fill="rgb(var(--canvas))" />
    </svg>
  );
}

export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="h-8 w-8 text-accent" />
      <span className="font-display text-[1.35rem] font-semibold leading-none tracking-tight text-fg">
        Cosmic Dharma
      </span>
    </span>
  );
}
