import { useState } from 'react';
import Head from 'next/head';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  Star, 
  ChevronRight, 
  Check, 
  Sparkles,
  Users,
  Clock,
  Shield,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/util/cn';

const features = [
  {
    icon: Star,
    title: 'Complete Birth Chart',
    description: 'Detailed Vedic astrology analysis with all divisional charts',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Clock,
    title: 'Dasha Predictions',
    description: 'Accurate timing predictions with Vimshottari Dasha system',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Sparkles,
    title: 'Yoga Analysis',
    description: 'Identify powerful combinations and their effects',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Traditional Methods',
    description: 'Authentic calculations based on classical texts',
    gradient: 'from-green-500 to-emerald-500',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Yoga Teacher',
    avatar: 'PS',
    content: 'The most accurate Vedic astrology platform I\'ve used. The insights have been life-changing.',
    rating: 5,
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Astrologer',
    content: 'Professional-grade calculations that I trust for my clients. Exceptional accuracy.',
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'Spiritual Seeker',
    content: 'Finally found authentic Vedic wisdom online. The depth of analysis is remarkable.',
    rating: 5,
  },
];

const stats = [
  { value: '50K+', label: 'Charts Generated' },
  { value: '98%', label: 'Accuracy Rate' },
  { value: '60+', label: 'Divisional Charts' },
  { value: '24/7', label: 'Available' },
];

export default function LandingPage() {
  const router = useRouter();
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <>
      <Head>
        <title>Cosmic Dharma - Professional Vedic Astrology Platform</title>
        <meta 
          name="description" 
          content="Get your complete Vedic birth chart with detailed analysis, divisional charts, dasha predictions, and yoga combinations. 100% authentic calculations." 
        />
      </Head>

      <div className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <motion.div 
            style={{ scale }}
            className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
          />
          
          {/* Floating Elements */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/90">Traditional Vedic Astrology</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-white">Discover Your</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
                  Cosmic Blueprint
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Professional Vedic astrology platform with authentic calculations, 
                comprehensive analysis, and traditional interpretations.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button
                  size="lg"
                  onClick={() => router.push('/profile')}
                  className="group"
                >
                  Generate Your Birth Chart
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => setVideoModalOpen(true)}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-white/80">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-yellow-400">{stat.value}</div>
                    <div className="text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Everything You Need for
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {' '}Complete Analysis
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Our platform provides the most comprehensive Vedic astrology calculations 
                following traditional Parashara principles.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full p-6 hover:shadow-xl transition-all">
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                        'bg-gradient-to-br',
                        feature.gradient
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Get your complete birth chart in 3 simple steps
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {[
                {
                  step: '01',
                  title: 'Enter Birth Details',
                  description: 'Provide your date, time, and place of birth',
                },
                {
                  step: '02',
                  title: 'Instant Calculations',
                  description: 'Our system performs complex Vedic calculations',
                },
                {
                  step: '03',
                  title: 'Get Your Analysis',
                  description: 'Receive comprehensive insights and predictions',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="flex items-center gap-8 mb-12"
                >
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <ChevronRight className="w-8 h-8 text-gray-400 hidden md:block" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => router.push('/profile')}
                className="mx-auto"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Join our community of satisfied users worldwide
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Unlock Your Cosmic Potential?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Get instant access to your complete Vedic birth chart with 
                detailed analysis and lifetime predictions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => router.push('/profile')}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  Get Started Free
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-white border-white/30 hover:bg-white/10"
                >
                  Sign In
                </Button>
              </div>

              <p className="text-sm text-white/70 mt-6">
                No credit card required • 100% Free
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}