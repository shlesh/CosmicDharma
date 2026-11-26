import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import Card from '@/components/ui/Card';
import SectionHeading from '@/components/ui/SectionHeading';
import { useToast } from '@/components/ui/ToastProvider';
import ProfileForm, { AYANAMSA_OPTIONS } from '@/components/astrology/ProfileForm';
import ChartLoading from '@/components/astrology/ChartLoading';
import ChartResult, { type ChartMeta } from '@/components/astrology/ChartResult';
import { useProfileJob } from '@/hooks/useProfileJob';
import type { ProfileResult, StartProfileJobRequest } from '@/util/api';
import { clearChart, loadChart, saveChart, type SavedChart } from '@/util/savedChart';

const INCLUDES = [
  'North and South Indian rashi chart',
  'Planets with nakshatra, pada and house',
  'Vimshottari dasha to the antardasha',
  'Sixteen divisional charts, D1 to D60',
  'Yogas, shadbala and ashtakavarga',
  'Panchanga at the moment of birth',
];

const HOUSE_LABEL: Record<string, string> = { equal: 'equal', sripati: 'Sripati' };

function metaFor(values: StartProfileJobRequest): ChartMeta {
  return {
    name: values.name || undefined,
    location: values.location,
    ayanamsa: values.ayanamsa ? AYANAMSA_OPTIONS.find((o) => o.value === values.ayanamsa)?.label : undefined,
    houseSystem: values.houseSystem ? HOUSE_LABEL[values.houseSystem] : undefined,
    nodeType: values.nodeType,
  };
}

export default function ProfilePage() {
  const toast = useToast();
  const { startJob, starting, startError, job, progress, reset } = useProfileJob();
  const [saved, setSaved] = useState<SavedChart | null>(null);
  const [pendingMeta, setPendingMeta] = useState<ChartMeta | undefined>();
  const handled = useRef<unknown>(null);

  // A chart from an earlier visit opens straight away.
  useEffect(() => {
    const prev = loadChart();
    if (prev) setSaved(prev);
  }, []);

  const status = job?.status;
  const result: ProfileResult | undefined = job?.result;
  const running = starting || (!!status && status !== 'complete' && status !== 'error');

  useEffect(() => {
    if (status === 'complete' && result && handled.current !== result) {
      handled.current = result;
      saveChart(result, pendingMeta);
      setSaved({ result, meta: pendingMeta, savedAt: new Date().toISOString() });
      toast('Your chart is ready.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status, result, pendingMeta, toast]);

  const onSubmit = (values: StartProfileJobRequest) => {
    setPendingMeta(metaFor(values));
    setSaved(null);
    startJob(values);
  };

  const onNewChart = () => {
    clearChart();
    setSaved(null);
    reset?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shown = status === 'complete' && result ? { result, meta: pendingMeta } : saved;
  const effectiveProgress = Math.max(progress || 0, job?.progress || 0);

  return (
    <div className="container py-10 sm:py-14">
      <Seo
        title={shown ? 'Your birth chart' : 'Free Vedic birth chart'}
        description="Cast a free Vedic birth chart: rashi and divisional charts, nakshatras, Vimshottari dasha, yogas and strengths, in Sri Yukteswar’s sidereal frame."
      />

      {shown && !running ? (
        <ChartResult result={shown.result as any} meta={shown.meta} onNewChart={onNewChart} />
      ) : running ? (
        <ChartLoading progress={effectiveProgress} />
      ) : (
        <>
          <SectionHeading
            as="h1"
            eyebrow="Birth chart"
            title="Cast your birth chart"
            description="Enter the date, time and place you were born. The chart is ready in a few seconds."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-8">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <Card padding="lg">
                <ProfileForm onSubmit={onSubmit} submitting={starting} serverError={startError || job?.error} />
              </Card>
            </motion.div>
            <motion.aside
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="space-y-4"
            >
              <Card>
                <h2 className="text-sm font-semibold text-fg">Your chart includes</h2>
                <ul className="mt-4 space-y-3">
                  {INCLUDES.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Check className="h-3 w-3" aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
              <p className="flex items-start gap-2.5 px-1 text-xs leading-relaxed text-subtle">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Your birth details are used only to calculate the chart and are never stored in a database. The finished
                chart is saved in this browser.
              </p>
            </motion.aside>
          </div>
        </>
      )}
    </div>
  );
}
