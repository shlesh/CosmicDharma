import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    },
    []
  );

  const handleBlur = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const validateField = useCallback(
    async (name: keyof T) => {
      if (validate) {
        const validationErrors = validate(values);
        setFieldError(name, validationErrors[name]);
        return validationErrors[name];
      }
    },
    [values, validate, setFieldError]
  );

  const validateForm = useCallback(async () => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      return validationErrors;
    }
    return {};
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);

      const validationErrors = await validateForm();
      
      if (Object.keys(validationErrors).length === 0 && onSubmit) {
        try {
          await onSubmit(values);
          resetForm();
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      setIsSubmitting(false);
    },
    [values, validateForm, onSubmit, resetForm]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    resetForm,
    handleSubmit,
  };
}