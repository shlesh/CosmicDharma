import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { LocationSearch } from './LocationSearch';
import { DatePicker } from './ui/DatePicker';
import { TimePicker } from './ui/TimePicker';
import { useForm } from '@/hooks/useForm';
import { cn } from '@/util/cn';

interface ProfileFormData {
  date: string;
  time: string;
  location: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const steps = [
  {
    id: 'date',
    title: 'When were you born?',
    description: 'Your birth date determines planetary positions',
    icon: Calendar,
  },
  {
    id: 'time',
    title: 'What time were you born?',
    description: 'Birth time is crucial for house calculations',
    icon: Clock,
  },
  {
    id: 'location',
    title: 'Where were you born?',
    description: 'Location provides geographical coordinates',
    icon: MapPin,
  },
];

export function ProfileForm({ onSubmit, loading = false, error }: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    isValid,
  } = useForm<ProfileFormData>({
    initialValues: {
      date: '',
      time: '',
      location: '',
    },
    validate: (values) => {
      const errors: Partial<ProfileFormData> = {};
      
      if (!values.date) {
        errors.date = 'Birth date is required';
      } else {
        const birthDate = new Date(values.date);
        const today = new Date();
        if (birthDate > today) {
          errors.date = 'Birth date cannot be in the future';
        }
        if (birthDate.getFullYear() < 1800) {
          errors.date = 'Birth date must be after 1800';
        }
      }
      
      if (!values.time) {
        errors.time = 'Birth time is required';
      }
      
      if (!values.location) {
        errors.location = 'Birth location is required';
      }
      
      return errors;
    },
  });

  const handleNext = async () => {
    const field = steps[currentStep].id as keyof ProfileFormData;
    await validateField(field);
    
    if (!errors[field] && values[field]) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = await validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      await onSubmit(values);
    }
  };

  const handleLocationSelect = useCallback((location: {
    address: string;
    lat: number;
    lng: number;
    timezone: string;
  }) => {
    setFieldValue('location', location.address);
    setFieldValue('latitude', location.lat);
    setFieldValue('longitude', location.lng);
    setFieldValue('timezone', location.timezone);
  }, [setFieldValue]);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Step Header */}
          <div className="text-center mb-8">
            <motion.div
              key={currentStep}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full mb-4"
            >
              <StepIcon className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold mb-2"
            >
              {currentStepData.title}
            </motion.h2>
            
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 dark:text-gray-400"
            >
              {currentStepData.description}
            </motion.p>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="date-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <DatePicker
                  value={values.date}
                  onChange={(date) => setFieldValue('date', date)}
                  onBlur={() => handleBlur('date')}
                  max={new Date().toISOString().split('T')[0]}
                  error={touched.date && errors.date}
                  label="Birth Date"
                  required
                />
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="time-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <TimePicker
                  value={values.time}
                  onChange={(time) => setFieldValue('time', time)}
                  onBlur={() => handleBlur('time')}
                  error={touched.time && errors.time}
                  label="Birth Time"
                  required
                  helpText="If exact time is unknown, use sunrise time (around 6:00 AM)"
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="location-step"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-4"
              >
                <LocationSearch
                  value={values.location}
                  onChange={handleLocationSelect}
                  onBlur={() => handleBlur('location')}
                  error={touched.location && errors.location}
                  label="Birth Location"
                  placeholder="Search for a city..."
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="mt-6"
              >
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-800 dark:text-red-200 font-medium">
                        Calculation Error
                      </h4>
                      <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={cn(
                'transition-opacity',
                currentStep === 0 && 'opacity-0 pointer-events-none'
              )}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-purple-600 to-blue-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  )}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!values[steps[currentStep].id as keyof ProfileFormData]}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !isValid}
                  className="min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    'Generate Chart'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}