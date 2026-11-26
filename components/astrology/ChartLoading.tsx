import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { LogoMark } from '@/components/ui/Logo';

const STEPS = ['Finding the place and time zone', 'Placing the planets', 'Dividing the houses', 'Counting the dashas'];

/** Shown while a chart job runs: progress plus a skeleton shaped like the result. */
export default function ChartLoading({ progress, message }: { progress: number; message?: string }) {
  const pct = Math.max(4, Math.min(100, Math.round(progress)));
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length))];

  return (
    <div className="space-y-6" data-testid="profile-skeleton">
      <Card padding="lg" className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="text-accent"
          >
            <LogoMark className="h-14 w-14" />
          </motion.div>
          <div>
            <p className="font-display text-2xl font-semibold">Calculating your chart</p>
            <p role="status" aria-live="polite" className="mt-1 text-sm text-muted">{message || `${step}…`}</p>
          </div>
          <div className="w-full max-w-sm">
            <div className="h-1.5 overflow-hidden rounded-full bg-line/[0.08]">
              <motion.div
                role="progressbar"
                aria-label="Chart calculation progress"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-full rounded-full bg-gradient-to-r from-accent/70 to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="mt-2 text-xs tabular-nums text-subtle">{Math.round(progress)}%</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2" aria-hidden="true">
        <Card><Skeleton className="mx-auto aspect-square w-full max-w-[420px]" /></Card>
        <div className="grid gap-4">
          <Card className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-48" /><Skeleton className="h-20 w-full" /></Card>
          <Card className="space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-40" /><Skeleton className="h-16 w-full" /></Card>
        </div>
      </div>
    </div>
  );
}
