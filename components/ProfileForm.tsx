// components/ProfileForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Button from './ui/Button';

export interface ProfileFormState {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}

export interface ProfileFormProps {
  form: ProfileFormState;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  loading?: boolean;
}

const InputField: React.FC<{
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  icon: React.ReactNode;
  hint?: string;
}> = ({ label, name, type = "text", value, onChange, placeholder, icon, hint }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="relative"
  >
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors">
        {icon}
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 
                   bg-white dark:bg-gray-900 
                   focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 
                   transition-all duration-200
                   placeholder:text-gray-400"
      />
      {hint && (
        <p className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          {hint}
        </p>
      )}
    </div>
  </motion.div>
);

export default function ProfileForm({ form, onChange, onSubmit, loading }: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "What's your name?",
      description: "Let's start with how you'd like to be addressed",
      fields: ['name']
    },
    {
      title: "When were you born?",
      description: "Your birth date and time are crucial for accurate calculations",
      fields: ['birthDate', 'birthTime']
    },
    {
      title: "Where were you born?",
      description: "Your birthplace determines the celestial positions",
      fields: ['location']
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < steps.length - 1) {
      e.preventDefault();
      nextStep();
    }
  };

  return (
    <Card variant="cosmic" className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit} onKeyDown={handleKeyDown}>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${index <= currentStep 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500'
                  }
                  transition-all duration-300
                `}>
                  {index + 1}
                </div>
                {index !== steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2 rounded
                    ${index < currentStep 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-700'
                    }
                    transition-all duration-300
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {steps[currentStep].description}
          </p>

          <div className="space-y-6">
            {currentStep === 0 && (
              <InputField
                label="Full Name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="John Doe"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
            )}

            {currentStep === 1 && (
              <>
                <InputField
                  label="Date of Birth"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={onChange}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <InputField
                  label="Time of Birth"
                  name="birthTime"
                  type="time"
                  value={form.birthTime}
                  onChange={onChange}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                  hint="24-hour format"
                />
              </>
            )}

            {currentStep === 2 && (
              <InputField
                label="Place of Birth"
                name="location"
                value={form.location}
                onChange={onChange}
                placeholder="New York, USA"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            )}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={currentStep === 0 ? 'invisible' : ''}
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="cosmic"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Generate Chart'}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}