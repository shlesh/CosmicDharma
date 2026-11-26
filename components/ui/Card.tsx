import React from 'react';
import { cn } from '@/util/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Adds a lift-and-glow on hover, for cards that are links or buttons. */
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'section' | 'article' | 'aside';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, padding = 'md', as: Tag = 'div', ...props }, ref) => (
    <Tag
      ref={ref as any}
      className={cn(
        'panel relative',
        paddings[padding],
        interactive &&
          'transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lift',
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = 'Card';

export function CardHeader({
  title,
  description,
  action,
  eyebrow,
  className,
  as: Heading = 'h2',
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
  as?: 'h2' | 'h3';
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <Heading className="font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">{title}</Heading>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
export { Card };
