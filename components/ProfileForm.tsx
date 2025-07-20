// components/ProfileForm.tsx - IMPROVED VERSION
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Settings, Loader } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ProfileFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    location: '',
    ayanamsa: 'lahiri',
    lunar_node: 'mean',
    house_system: 'whole_sign'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Birth date is required';
    if (!formData.time) newErrors.time = 'Birth time is required';
    if (!formData.location) newErrors.location = 'Birth location is required';
    
    // Validate date is not in future
    if (formData.date && new Date(formData.date) > new Date()) {
      newErrors.date = 'Birth date cannot be in the future';
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Birth Chart Analysis</h2>
          <p className="text-gray-300">Enter your birth details for a comprehensive Vedic astrology reading</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="flex items-center space-x-2 text-white font-medium mb-2">
              <Calendar className="w-4 h-4" />
              <span>Birth Date</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-lg border ${
                errors.date ? 'border-red-400' : 'border-white/30'
              } text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200`}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.date && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.date}
              </motion.p>
            )}
          </motion.div>

          {/* Time Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="flex items-center space-x-2 text-white font-medium mb-2">
              <Clock className="w-4 h-4" />
              <span>Birth Time</span>
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-lg border ${
                errors.time ? 'border-red-400' : 'border-white/30'
              } text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200`}
            />
            {errors.time && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.time}
              </motion.p>
            )}
          </motion.div>

          {/* Location Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="flex items-center space-x-2 text-white font-medium mb-2">
              <MapPin className="w-4 h-4" />
              <span>Birth Location</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Mumbai, India or New York, USA"
              className={`w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-lg border ${
                errors.location ? 'border-red-400' : 'border-white/30'
              } text-white placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200`}
            />
            {errors.location && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-1"
              >
                {errors.location}
              </motion.p>
            )}
          </motion.div>

          {/* Advanced Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="border-t border-white/20 pt-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300 font-medium">Advanced Settings</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Ayanamsa</label>
                <select
                  value={formData.ayanamsa}
                  onChange={(e) => handleChange('ayanamsa', e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/30 text-white text-sm focus:border-purple-400 transition-colors"
                >
                  <option value="lahiri">Lahiri</option>
                  <option value="raman">Raman</option>
                  <option value="kp">Krishnamurti</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">Lunar Node</label>
                <select
                  value={formData.lunar_node}
                  onChange={(e) => handleChange('lunar_node', e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/30 text-white text-sm focus:border-purple-400 transition-colors"
                >
                  <option value="mean">Mean Node</option>
                  <option value="true">True Node</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-300 mb-2 block">House System</label>
                <select
                  value={formData.house_system}
                  onChange={(e) => handleChange('house_system', e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/30 text-white text-sm focus:border-purple-400 transition-colors"
                >
                  <option value="whole_sign">Whole Sign</option>
                  <option value="equal">Equal House</option>
                  <option value="sripati">Sripati</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                'Generate Birth Chart'
              )}
            </Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  );
};
