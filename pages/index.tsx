// pages/index.tsx
import { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { StarryBackground } from '../components/StarryBackground';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useRouter } from 'next/router';

const features = [
  {
    icon: '🌟',
    title: 'Complete Birth Chart Analysis',
    description: 'Detailed Vedic astrology charts with planetary positions, houses, and aspects'
  },
  {
    icon: '📊',
    title: 'Divisional Charts (Vargas)',
    description: 'All 60 divisional charts including Navamsa, Dasamsa, and specialized charts'
  },
  {
    icon: '⏰',
    title: 'Vimshottari Dasha System',
    description: 'Detailed planetary periods with sub-periods and timing predictions'
  },
  {
    icon: '🌙',
    title: 'Nakshatra Analysis',
    description: 'Complete lunar mansion analysis with pada positions and characteristics'
  },
  {
    icon: '🧮',
    title: 'Ashtakavarga & Shadbala',
    description: 'Advanced strength calculations and benefic point systems'
  },
  {
    icon: '🕉️',
    title: 'Yoga Combinations',
    description: 'Detection of over 100+ classical yoga combinations and their effects'
  }
];

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    text: 'The most accurate and detailed Vedic astrology platform I\'ve used. The divisional charts are incredibly precise.',
    rating: 5
  },
  {
    name: 'Dr. Rajesh Kumar',
    location: 'Delhi, India',
    text: 'As a practicing astrologer, I find this tool invaluable for quick calculations and verifications.',
    rating: 5
  },
  {
    name: 'Sarah Johnson',
    location: 'California, USA',
    text: 'Finally found authentic Vedic astrology online. The interpretations are traditional and accurate.',
    rating: 5
  }
];

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGetStarted = () => {
    setIsLoading(true);
    router.push('/profile');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Cosmic Dharma - Authentic Vedic Astrology</title>
        <meta name="description" content="Professional Vedic astrology platform with complete birth chart analysis, divisional charts, dasha calculations, and traditional interpretations." />
        <meta name="keywords" content="vedic astrology, birth chart, jyotish, horoscope, kundali, navamsa, dasha, nakshatra" />
        <link rel="canonical" href="https://cosmicdharma.netlify.app" />
      </Head>

      <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        <StarryBackground />
        
        {/* Hero Section */}
        <section className="relative z-10 pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                Cosmic Dharma
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover your life's path through authentic Vedic astrology. 
                Complete birth chart analysis with traditional interpretations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold rounded-full transform transition-all duration-200 hover:scale-105 shadow-2xl"
                >
                  {isLoading ? 'Loading...' : 'Get Your Chart Free'}
                </Button>
                
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full backdrop-blur-sm"
                >
                  Login
                </Button>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white/80 mb-20"
            >
              <div>
                <div className="text-2xl font-bold text-yellow-300">10,000+</div>
                <div className="text-sm">Charts Generated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">60+</div>
                <div className="text-sm">Divisional Charts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">100%</div>
                <div className="text-sm">Authentic Vedic</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">24/7</div>
                <div className="text-sm">Available</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Complete Vedic Analysis
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform provides the most comprehensive Vedic astrology calculations 
                following traditional Parashara principles.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 h-full hover:bg-white/15 transition-all duration-300">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Trusted by Thousands
              </h2>
              <p className="text-xl text-gray-300">
                Join our community of satisfied users worldwide
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border border-white/20 p-6 h-full">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">★</span>
                      ))}
                    </div>
                    <p className="text-gray-200 mb-4 italic">"{testimonial.text}"</p>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-gray-400 text-sm">{testimonial.location}</div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 bg-gradient-to-r from-orange-600/20 to-pink-600/20 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Discover Your Cosmic Blueprint?
              </h2>
              <p className="text-xl text-gray-200 mb-8">
                Get your complete Vedic birth chart analysis in minutes. 
                No registration required for your first chart.
              </p>
              
              <Button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-12 py-4 text-xl font-bold rounded-full transform transition-all duration-200 hover:scale-105 shadow-2xl"
              >
                {isLoading ? 'Loading...' : 'Start Your Journey'}
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
