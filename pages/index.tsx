import Head from 'next/head';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Star, Sparkles, Clock, Shield, ArrowRight, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: Star,
    title: 'Whole-sign kundali',
    description: 'Lagna, grahas and bhavas in the Yukteswar Revati frame. Whole-sign houses by default.',
  },
  {
    icon: Clock,
    title: 'Vimshottari daśā',
    description: 'Moon-nakshatra timing with local timezone handling, not a UTC guess.',
  },
  {
    icon: Sparkles,
    title: 'Daily panchanga',
    description: 'Tithi, vaara, nakshatra, yoga and karana with classical notes for the chosen instant.',
  },
  {
    icon: Shield,
    title: 'Yuga clock',
    description: 'Ascending Dwapara of The Holy Science — 24,000-year dual cycle, not the later 4.32 million year count.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Name the moment',
    description: 'Date, time and a real place. The sky is read from that soil, not from a default city.',
  },
  {
    step: '02',
    title: 'Cast the chart',
    description: 'Sidereal longitudes, Revati ayanamsa, panchanga limbs and dasha balance.',
  },
  {
    step: '03',
    title: 'Sit with it',
    description: 'A portrait of probable fruit. Will can outwit the stars.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Cosmic Dharma — night sky, kundali, panchanga</title>
        <meta
          name="description"
          content="Vedic charts in Sri Yukteswar’s Revati frame. Birth kundali, dasha, yogas and daily panchanga."
        />
      </Head>

      <div className="relative page-shell">
        <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6">
                <TreePine className="w-4 h-4 text-amber-200" />
                <span className="text-sm text-amber-100/90">Vanvas under the Dwapara sky</span>
              </div>

              <h1 className="font-display text-white mb-5">
                Sit with the night.
                <br />
                <span className="gradient-text">Read the chart it keeps.</span>
              </h1>

              <p className="text-lg md:text-xl text-amber-50/80 mb-10 max-w-2xl mx-auto leading-relaxed">
                Cosmic Dharma casts Vedic kundalis in the lineage of Sri Yukteswar Giri —
                Revati ayanamsa, whole-sign houses, panchanga and the 24,000-year yuga clock
                of <em>The Holy Science</em>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" onClick={() => router.push('/profile')} className="group">
                  Cast a birth chart
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => router.push('/panchanga')}
                  className="text-amber-50 border border-amber-200/30 hover:bg-white/10"
                >
                  Today&apos;s panchanga
                </Button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border border-amber-100/30 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1 h-3 bg-amber-100/70 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="mb-3 text-amber-50">What the ashram night holds</h2>
              <p className="help-text max-w-2xl mx-auto">
                Not a marketplace of predictions. A working desk for the five limbs,
                the houses, and the age we are actually living in.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Card variant="glass" className="h-full p-6">
                      <div className="w-11 h-11 rounded-xl mb-4 flex items-center justify-center bg-amber-200/10 border border-amber-200/20">
                        <Icon className="w-5 h-5 text-amber-200" />
                      </div>
                      <h3 className="text-xl mb-2 text-amber-50">{feature.title}</h3>
                      <p className="help-text">{feature.description}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-center mb-12 text-amber-50">Three steps, then silence</h2>
            <div className="space-y-8">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-6 items-start glass rounded-2xl p-5"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full border border-amber-200/30 flex items-center justify-center text-amber-200 font-display text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-amber-50 mb-1">{item.title}</h3>
                    <p className="help-text">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card variant="cosmic" className="max-w-3xl mx-auto p-8 md:p-12 text-center">
              <p className="font-display text-2xl md:text-3xl text-amber-50 leading-snug mb-4">
                “The starry vault of heaven is in truth the book of life.”
              </p>
              <p className="help-text mb-8">Sri Yukteswar Giri, The Holy Science</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" onClick={() => router.push('/profile')}>
                  Open the book
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="ghost" onClick={() => router.push('/panchanga')} className="text-amber-50">
                  Read today first
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
