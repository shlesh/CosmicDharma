import { forwardRef } from 'react';
import { cn } from '@/util/cn';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-700',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${props.id}-error` : helpText ? `${props.id}-help` : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <div id={`${props.id}-error`} className="mt-1 flex items-center text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
        
        {helpText && !error && (
          <p id={`${props.id}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';