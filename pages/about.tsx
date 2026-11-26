import { motion } from 'framer-motion';
import { ArrowRight, Telescope, Orbit, ShieldCheck, ScrollText } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import { ButtonLink } from '@/components/ui/Button';

const ease = [0.16, 1, 0.3, 1] as const;

const SECTIONS = [
  {
    icon: ScrollText,
    title: 'Why Sri Yukteswar’s frame',
    body: [
      'Vedic astrology measures the zodiac against the fixed stars, so every chart depends on where that zodiac begins. The offset from the tropical zodiac is called the ayanamsa, and the schools disagree about it by a degree or more.',
      'Cosmic Dharma follows Swami Sri Yukteswar Giri, who in The Holy Science (1894) placed the start of the zodiac near the star Revati and gave a precession rate of 54 arcseconds a year. Lahiri, Raman, Krishnamurti and Fagan/Bradley are available too, so you can compare.',
    ],
  },
  {
    icon: Orbit,
    title: 'The yuga cycle',
    body: [
      'Sri Yukteswar described the ages as a 24,000-year cycle of ascending and descending yugas, rather than the millions of years of later texts. By his reckoning we entered the ascending Dwapara Yuga around 1700 CE.',
      'Every chart shows where its year falls in that cycle.',
    ],
  },
  {
    icon: Telescope,
    title: 'How positions are calculated',
    body: [
      'Planetary positions come from the Swiss Ephemeris, the same engine used by most professional astrology software. Birth times are converted to Universal Time with the historical time-zone rules of the birthplace, not today’s offset.',
      'Houses default to whole signs counted from the ascendant, and the lunar nodes to their mean position. Both can be changed under “Advanced options”.',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'How accuracy is checked',
    body: [
      'An automated test suite compares our planets with NASA JPL Horizons, the ephemeris used to fly spacecraft. The largest difference is under one arcsecond. The ascendant is checked against the formula in Jean Meeus’s Astronomical Algorithms, to within 14 arcseconds.',
      'Nakshatras, padas and the birth dasha are derived independently from the JPL Moon in more than one ayanamsa, so a change that shifts results is caught before it ships.',
    ],
  },
];

const FAQ = [
  ['Is it free?', 'Yes. Charts, dashas and the panchanga are free, and you don’t need an account to cast a chart.'],
  ['What if I don’t know my birth time?', 'Use 12:00. The slower planets will be right, but the Moon moves about 13° a day, so its nakshatra (and the dashas that follow from it) may change, and the ascendant and houses will be unreliable.'],
  ['Why is my chart different from another website?', 'Most sites use the Lahiri ayanamsa, which differs from Sri Yukteswar’s. Choose Lahiri under “Advanced options” to compare like with like.'],
  ['What happens to my birth details?', 'They are used to calculate the chart and are never stored in a database. The finished chart is saved in your browser so you can come back to it.'],
];

export default function AboutPage() {
  return (
    <div className="container py-10 sm:py-14">
      <Seo title="About & method" description="How Cosmic Dharma calculates charts: Sri Yukteswar’s ayanamsa, the Swiss Ephemeris, and accuracy tests against NASA JPL." />
      <SectionHeading
        as="h1"
        eyebrow="About"
        title="Traditional astrology, modern astronomy"
        description="Cosmic Dharma is a free Jyotisha workbench. It pairs a classical school of Vedic astrology with planetary data you can check."
      />

      <div className="mt-14 grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s, i) => (
          <motion.section
            key={s.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease }}
            className="panel p-6 sm:p-8"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
              <s.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold">{s.title}</h2>
            {s.body.map((p) => <p key={p.slice(0, 20)} className="mt-3 text-sm leading-relaxed text-muted">{p}</p>)}
          </motion.section>
        ))}
      </div>

      <section className="mt-20 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]" aria-labelledby="faq-title">
        <SectionHeading eyebrow="Questions" title={<span id="faq-title">Frequently asked</span>} />
        <div className="space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="panel group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg">
                {q}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line/15 text-subtle transition-transform duration-300 group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <Card padding="lg" className="mt-20 flex flex-col items-start justify-between gap-6 overflow-hidden sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-3xl font-semibold">See it for yourself</h2>
          <p className="mt-1 text-muted">Cast a chart in under a minute.</p>
        </div>
        <ButtonLink href="/profile" size="lg">Create your birth chart <ArrowRight className="h-4 w-4" /></ButtonLink>
      </Card>
    </div>
  );
}
