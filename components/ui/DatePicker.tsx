import { forwardRef } from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from './Input';

interface DatePickerProps extends Omit<InputProps, 'type' | 'leftIcon'> {
  min?: string;
  max?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        leftIcon={<Calendar className="w-5 h-5" />}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';