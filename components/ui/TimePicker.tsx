import { forwardRef } from 'react';
import { Clock } from 'lucide-react';
import { Input, InputProps } from './Input';

interface TimePickerProps extends Omit<InputProps, 'type' | 'leftIcon'> {}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="time"
        leftIcon={<Clock className="w-5 h-5" />}
        {...props}
      />
    );
  }
);

TimePicker.displayName = 'TimePicker';