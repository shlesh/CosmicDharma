// components/LandingPage.tsx - IMPROVED VERSION
import React from 'react';
import { motion } from 'framer-motion';
import { Star, BookOpen, Users, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { StarryBackground } from '../ui/StarryBackground';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <StarryBackground />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-2 border-yellow-400 rounded-full flex items-center justify-center"
            >
              <Star className="w-10 h-10 text-yellow-400 fill-current" />
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-300 to-purple-300 mb-6">
            Cosmic Dharma
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Discover your cosmic blueprint through authentic Vedic astrology.
            Get comprehensive birth chart analysis, planetary insights, and life guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              variant="primary"
              className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-xl"
            >
              Get Your Chart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {[
            {
              icon: <BookOpen className="w-8 h-8" />,
              title: "Comprehensive Analysis",
              description: "Complete birth chart with planetary positions, houses, dashas, and yogas"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Expert Interpretations",
              description: "Traditional Vedic principles with modern accessibility and insights"
            },
            {
              icon: <Sparkles className="w-8 h-8" />,
              title: "Personalized Guidance",
              description: "Detailed life predictions and remedial measures for spiritual growth"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              <div className="text-yellow-400 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
};
