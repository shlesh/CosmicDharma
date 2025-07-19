// components/LandingPage.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import Card from './ui/Card';

const features = [
  {
    icon: '🌟',
    title: 'Vedic Astrology',
    description: 'Get detailed insights into your birth chart with authentic Vedic calculations.'
  },
  {
    icon: '📚',
    title: 'Spiritual Blog',
    description: 'Explore articles on astrology, spirituality, and cosmic wisdom.'
  },
  {
    icon: '🔮',
    title: 'Personalized Reports',
    description: 'Receive custom astrological reports tailored to your unique cosmic blueprint.'
  },
  {
    icon: '✨',
    title: 'Daily Panchanga',
    description: 'Stay aligned with cosmic rhythms through daily planetary positions.'
  }
];

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Spiritual Seeker',
    content: 'The accuracy of the Vedic calculations blew my mind. This has become my go-to resource for astrological guidance.',
    avatar: '👩'
  },
  {
    name: 'Raj K.',
    role: 'Yoga Teacher',
    content: 'Finally, an authentic Vedic astrology platform that respects the traditional wisdom while being modern and accessible.',
    avatar: '🧘‍♂️'
  },
  {
    name: 'Elena P.',
    role: 'Life Coach',
    content: 'The insights I\'ve gained have transformed how I understand myself and guide my clients. Truly revolutionary!',
    avatar: '👩‍💼'
  }
];

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl opacity-10 animate-float" style={{ animationDelay: '6s' }} />
        </div>

        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              Cosmic
              <span className="block">Dharma</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Unlock the mysteries of your cosmic blueprint through authentic Vedic astrology 
              and embark on a journey of self-discovery.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/profile">
              <Button variant="cosmic" size="lg" className="min-w-[200px]">
                Get Your Chart
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Link href="/posts">
              <Button variant="glass" size="lg" className="min-w-[200px]">
                Explore Blog
              </Button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <a href="#features" className="block p-2 animate-bounce">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Cosmic Path
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Combine ancient wisdom with modern technology for profound astrological insights
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="glass" hover className="h-full">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl mx-4">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands discovering their true potential through Vedic wisdom
            </p>
            <Link href="/register">
              <Button variant="cosmic" size="lg">
                Start Free Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            What People Are Saying
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="gradient" className="h-full">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
