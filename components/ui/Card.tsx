// components/ui/Card.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../util/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'cosmic';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
  rounded = 'xl',
  ...props
}, ref) => {
  const baseStyles = 'relative overflow-hidden transition-all duration-300';

  const variants = {
    default: `
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      shadow-sm
    `,
    glass: `
      glass
      border border-white/10
      shadow-xl
    `,
    gradient: `
      bg-gradient-to-br from-purple-500/10 to-blue-500/10
      backdrop-blur-md
      border border-purple-500/20
      shadow-xl shadow-purple-500/10
    `,
    cosmic: `
      bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-pink-900/50
      backdrop-blur-xl
      border border-purple-500/30
      shadow-2xl shadow-purple-500/20
      before:absolute before:inset-0
      before:bg-gradient-to-br before:from-purple-600/20 before:via-transparent before:to-blue-600/20
      before:opacity-0 hover:before:opacity-100
      before:transition-opacity before:duration-500
    `
  };

  const hoverStyles = hover ? `
    hover:shadow-2xl hover:scale-[1.02]
    hover:border-purple-500/50
  ` : '';

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const roundings = {
    none: '',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]'
  };

  const MotionDiv = motion.div;

  return (
    <MotionDiv
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        paddings[padding],
        roundings[rounded],
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ type: "spring", stiffness: 300 }}
      {...props}
    >
      {children}
    </MotionDiv>
  );
});

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('pb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-2xl font-bold gradient-text', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-gray-600 dark:text-gray-400 mt-2', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('pt-4 mt-4 border-t border-gray-200 dark:border-gray-800', className)} {...props}>
    {children}
  </div>
);

export default Card;
