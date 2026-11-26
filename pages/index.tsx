import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight, Check, CircleDot, Layers, Hourglass, Sparkles, CalendarDays, Gauge, Telescope,
} from 'lucide-react';
import Seo from '@/components/layout/Seo';
import ZodiacWheel from '@/components/home/ZodiacWheel';
import LiveSky from '@/components/home/LiveSky';
import { ButtonLink } from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    icon: CircleDot,
    title: 'Birth chart',
    body: 'Ascendant, planets, nakshatras and whole-sign houses, drawn in North or South Indian style.',
    wide: true,
  },
  {
    icon: Hourglass,
    title: 'Vimshottari dasha',
    body: 'All 120 years of major and sub-periods, with the one you are living in now highlighted.',
  },
  {
    icon: Layers,
    title: 'Divisional charts',
    body: 'The sixteen classical vargas from D1 to D60, including the navamsha, with vargottama planets flagged.',
  },
  {
    icon: Sparkles,
    title: 'Yogas',
    body: 'Pancha Mahapurusha, raja, dhana and lunar yogas, each with the planets that form it.',
  },
  {
    icon: Gauge,
    title: 'Strength',
    body: 'Shadbala for every planet and ashtakavarga points for every house.',
  },
  {
    icon: CalendarDays,
    title: 'Daily panchanga',
    body: 'Tithi, vara, nakshatra, yoga and karana for any date and place, with what the day supports.',
    wide: true,
  },
];

const STEPS = [
  { title: 'Enter your birth details', body: 'Date, time and place of birth. We look up the coordinates and the historical time zone for you.' },
  { title: 'We calculate the chart', body: 'Planetary positions from the Swiss Ephemeris, set in Sri Yukteswar’s sidereal frame.' },
  { title: 'Explore and keep it', body: 'Move between the chart, dashas, vargas and yogas. Print it, or save it to your account.' },
];

const STATS = [
  { value: '0.86″', label: 'largest planetary error against NASA JPL Horizons' },
  { value: '14″', label: 'largest ascendant error against the textbook formula' },
  { value: '16', label: 'divisional charts, from the rashi to the shashtiamsha' },
  { value: '120', label: 'years of Vimshottari periods, down to antardasha' },
];

export default function HomePage() {
  return (
    <>
      <Seo />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container grid items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-6 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-line/10 bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur"
            >
              <Telescope className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span>
                In the sidereal frame of <span className="text-fg">The Holy Science</span>
              </span>
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
              className="mt-6 font-display text-display-xl font-semibold"
            >
              Vedic astrology,
              <br />
              <span className="text-gradient">calculated with care.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              Precise birth charts, dasha periods and a daily panchanga. Every position comes from the Swiss Ephemeris
              and is checked against NASA’s own planetary data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease }}
              className="mt-9 flex flex-col gap-3 sm:flex-row"
            >
              <ButtonLink href="/profile" size="lg" className="group">
                Create your birth chart
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </ButtonLink>
              <ButtonLink href="/panchanga" size="lg" variant="secondary">
                Today’s panchanga
              </ButtonLink>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted"
            >
              {['Free, no sign-up needed', 'Verified against NASA JPL', 'D1–D60 divisional charts'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="relative mx-auto w-full max-w-[min(80vw,400px)] sm:max-w-[480px] lg:max-w-none">
            <ZodiacWheel />
          </div>
        </div>

        <div className="container pb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease }}>
            <LiveSky />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 sm:py-28" aria-labelledby="features-title">
        <SectionHeading
          eyebrow="What you get"
          title={<span id="features-title">A complete Jyotisha workbench</span>}
          description="Everything a practitioner reaches for, laid out so a beginner can follow it too."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease }}
              className={`panel group relative overflow-hidden p-6 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/25 ${f.wide ? 'lg:col-span-2' : ''}`}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container py-20 sm:py-28" aria-labelledby="how-title">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <SectionHeading
            eyebrow="How it works"
            title={<span id="how-title">From a birth moment to a full chart in seconds</span>}
            description="No forms to fill twice and no account needed. Sign in only if you want to keep your chart."
          />
          <ol className="relative space-y-4">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="panel flex gap-5 p-5 sm:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/30 font-display text-lg font-semibold text-accent">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Accuracy */}
      <section className="container py-20 sm:py-28" aria-labelledby="accuracy-title">
        <div className="panel relative overflow-hidden p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-lunar/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow mb-3">Accuracy</p>
              <h2 id="accuracy-title" className="font-display text-display-md font-semibold">
                Tested against the sky, not against itself
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                Our test suite compares every planet with NASA JPL Horizons, the ascendant with the formula in
                Meeus’s <em>Astronomical Algorithms</em>, and birth times against the historical time zone of the birthplace.
                The default ayanamsa is Sri Yukteswar’s; Lahiri, Raman, KP and Fagan/Bradley are one click away.
              </p>
              <Link href="/about" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                Read about the method <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07, ease }}
                  className="rounded-2xl border border-line/10 bg-canvas/40 p-5"
                >
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-4xl font-semibold text-fg sm:text-5xl">{s.value}</dd>
                  <dd className="mt-2 text-xs leading-snug text-muted sm:text-sm">{s.label}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="container pb-8 pt-12 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-3xl text-center"
        >
          <blockquote className="font-display text-display-md font-medium italic leading-snug text-fg/90">
            “A child is born on that day and at that hour when the celestial rays are in mathematical harmony with
            his individual karma.”
          </blockquote>
          <p className="mt-4 text-sm text-subtle">
            Sri Yukteswar, in Paramahansa Yogananda’s <cite>Autobiography of a Yogi</cite> (1946)
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/profile" size="lg">
              Create your birth chart <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/register" size="lg" variant="secondary">
              Create a free account
            </ButtonLink>
          </div>
        </motion.div>
      </section>
    </>
  );
}
