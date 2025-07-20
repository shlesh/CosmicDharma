import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../util/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'cosmic';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center font-medium
    transition-all duration-300 ease-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
    whitespace-nowrap
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 to-blue-600 text-white
      hover:from-purple-700 hover:to-blue-700
      shadow-lg hover:shadow-xl hover:shadow-purple-500/25
      focus-visible:ring-purple-500
      border-0
    `,
    secondary: `
      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
      border border-gray-300 dark:border-gray-600
      hover:bg-gray-50 dark:hover:bg-gray-700
      shadow-sm hover:shadow-md
      focus-visible:ring-gray-500
    `,
    ghost: `
      text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-800
      focus-visible:ring-gray-500
      border-0
    `,
    glass: `
      glass text-gray-900 dark:text-white
      hover:bg-white/20 dark:hover:bg-white/10
      border border-white/20
      focus-visible:ring-white/50
    `,
    cosmic: `
      bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500
      text-white font-semibold
      shadow-lg hover:shadow-2xl hover:shadow-purple-500/50
      transform hover:scale-105
      focus-visible:ring-purple-500
      border-0
      before:absolute before:inset-0
      before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
      before:translate-x-[-200%] hover:before:translate-x-[200%]
      before:transition-transform before:duration-700
    `
  };

  Button.displayName = 'Button';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5 min-h-[2rem]',
    md: 'px-4 py-2 text-base rounded-xl gap-2 min-h-[2.5rem] sm:px-5 sm:py-2.5',
    lg: 'px-6 py-3 text-lg rounded-2xl gap-3 min-h-[3rem] sm:px-7 sm:py-3.5'
  };

  return (
    <motion.button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      whileHover={{ scale: variant === 'cosmic' ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 flex-shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="truncate">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
export { Button };