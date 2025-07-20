// components/ProfileForm.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Button } from './ui';
import { Card } from './ui';
import { api } from '../util/api';

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  loading?: boolean;
  error?: string | null;
}

interface ProfileData {
  date: string;
  time: string;
  location: string;
  timezone?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export function ProfileForm({ onSubmit, loading = false, error }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileData>({
    date: '',
    time: '',
    location: '',
  });
  
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
            );
            const data = await response.json();
            if (data.display_name) {
              const city = data.address?.city || data.address?.town || data.address?.village || '';
              const state = data.address?.state || '';
              const country = data.address?.country || '';
              const detectedLocation = [city, state, country].filter(Boolean).join(', ');
              
              setFormData(prev => ({ ...prev, location: detectedLocation }));
            }
          } catch (err) {
            console.log('Could not detect location');
          }
        },
        (err) => console.log('Location access denied')
      );
    }
  }, []);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Location search failed:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
    searchLocations(value);
    
    // Clear location error when user starts typing
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const selectLocation = (suggestion: LocationSuggestion) => {
    setFormData(prev => ({ ...prev, location: suggestion.display_name }));
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Birth date is required';
    } else {
      const birthDate = new Date(formData.date);
      const today = new Date();
      if (birthDate > today) {
        newErrors.date = 'Birth date cannot be in the future';
      }
      if (birthDate.getFullYear() < 1800) {
        newErrors.date = 'Birth date must be after 1800';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Birth time is required';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Please enter time in HH:MM format';
    }

    if (!formData.location || formData.location.length < 2) {
      newErrors.location = 'Birth location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.date) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.time) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const getTodayDate = () => {
    return format(new Date(), 'yyyy-MM-dd');
  };

  const stepTitles = [
    'When were you born?',
    'What time were you born?',
    'Where were you born?'
  ];

  const stepDescriptions = [
    'Your birth date is essential for accurate planetary positions',
    'Birth time determines your ascendant and house cusps',
    'Birth location is needed for precise geographical calculations'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
            initial={{ width: '33%' }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          {/* Step Header */}
          <div className="text-center mb-8">
            <motion.h2
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-gray-800 mb-2"
            >
              {stepTitles[currentStep - 1]}
            </motion.h2>
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600"
            >
              {stepDescriptions[currentStep - 1]}
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      max={getTodayDate()}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      autoFocus
                    />
                    {errors.date && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.date}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                        errors.time ? 'border-red-500' : 'border-gray-300'
                      }`}
                      autoFocus
                    />
                    {errors.time && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.time}
                      </motion.p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      💡 If exact time is unknown, sunrise time often works well
                    </p>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Location *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        onFocus={() => setShowSuggestions(locationSuggestions.length > 0)}
                        placeholder="e.g., Mumbai, Maharashtra, India"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                        autoFocus
                      />
                      {locationLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Location Suggestions */}
                    <AnimatePresence>
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto"
                        >
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectLocation(suggestion)}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-800">
                                {suggestion.display_name}
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {errors.location && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.location}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex">
                  <div className="text-red-600 mr-3">⚠️</div>
                  <div>
                    <h4 className="text-red-800 font-medium">Calculation Error</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2"
              >
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !formData.date) ||
                      (currentStep === 2 && !formData.time)
                    }
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-2"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading || !formData.date || !formData.time || !formData.location}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-2 min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Calculating...
                      </div>
                    ) : (
                      'Generate Chart'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
