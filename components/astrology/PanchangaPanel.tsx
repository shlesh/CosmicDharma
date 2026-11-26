import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Moon, Star, Sparkles, Shapes, ThumbsUp, Hourglass } from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge, { qualityTone } from '@/components/ui/Badge';

type Limb = {
  name?: string;
  nakshatra?: string;
  pada?: number;
  paksha?: string;
  class?: string;
  meaning?: string;
  quality?: string;
  deity?: string;
  ruling_planet?: string;
  fraction?: number;
};

export interface PanchangaData {
  vaara?: string;
  vaara_lord?: string;
  vaara_meaning?: string;
  tithi?: Limb;
  nakshatra?: Limb;
  yoga?: Limb;
  karana?: Limb;
  quality?: string;
  summary?: string;
  favor?: string[];
  avoid?: string[];
}

export interface PanchangaPanelProps {
  panchanga?: PanchangaData | null;
  context?: 'birth' | 'daily';
  /** Render without the outer card (when the page provides its own frame) */
  bare?: boolean;
}

const QUALITY_LABEL: Record<string, string> = { favorable: 'Favourable', caution: 'Caution', mixed: 'Mixed', neutral: 'Neutral' };

function LimbCard({
  icon: Icon,
  label,
  value,
  detail,
  meta,
  quality,
  progress,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  detail?: string;
  meta?: string;
  quality?: string;
  progress?: number;
  index: number;
}) {
  if (!value) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="flex flex-col rounded-2xl border border-line/10 bg-canvas/30 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-subtle">
          <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {label}
        </span>
        {quality && <Badge tone={qualityTone(quality)}>{QUALITY_LABEL[quality] || quality}</Badge>}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold leading-tight">{value}</p>
      {meta && <p className="mt-0.5 text-xs text-subtle">{meta}</p>}
      {detail && <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>}
      {typeof progress === 'number' && progress >= 0 && progress <= 1 && (
        <div className="mt-auto pt-3">
          <div className="h-1 overflow-hidden rounded-full bg-line/[0.07]" aria-hidden="true">
            <div className="h-full rounded-full bg-accent/70" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-subtle">{Math.round(progress * 100)}% elapsed</p>
        </div>
      )}
    </motion.div>
  );
}

/** The five limbs (tithi, vara, nakshatra, yoga, karana) for a birth moment or any chosen day. */
export default function PanchangaPanel({ panchanga, context = 'birth', bare = false }: PanchangaPanelProps) {
  if (!panchanga) return null;
  const p = panchanga;

  const limbs = [
    {
      icon: Moon, label: 'Tithi', value: p.tithi?.name, quality: p.tithi?.quality, detail: p.tithi?.meaning,
      meta: [p.tithi?.paksha && `${p.tithi.paksha} paksha`, p.tithi?.class].filter(Boolean).join(' · ') || undefined,
      progress: p.tithi?.fraction,
    },
    {
      icon: CalendarDays, label: 'Vara', value: p.vaara, detail: p.vaara_meaning,
      meta: p.vaara_lord ? `Ruled by ${p.vaara_lord}` : undefined,
    },
    {
      icon: Star, label: 'Nakshatra', value: p.nakshatra?.nakshatra, quality: p.nakshatra?.quality,
      meta: [p.nakshatra?.pada && `Pada ${p.nakshatra.pada}`, p.nakshatra?.deity && `Deity ${p.nakshatra.deity}`].filter(Boolean).join(' · ') || undefined,
      detail: p.nakshatra?.meaning, progress: p.nakshatra?.fraction,
    },
    { icon: Sparkles, label: 'Yoga', value: p.yoga?.name, quality: p.yoga?.quality, detail: p.yoga?.meaning, progress: p.yoga?.fraction },
    { icon: Shapes, label: 'Karana', value: p.karana?.name, quality: p.karana?.quality, detail: p.karana?.meaning, progress: p.karana?.fraction },
  ].filter((l) => l.value);

  if (limbs.length === 0 && !p.summary) return null;

  const body = (
    <>
      {(p.summary || p.quality) && (
        <div className="mb-5 flex flex-wrap items-start gap-3 rounded-2xl border border-line/10 bg-line/[0.03] p-4">
          {p.quality && <Badge tone={qualityTone(p.quality)} className="mt-0.5">{QUALITY_LABEL[p.quality] || p.quality}</Badge>}
          {p.summary && <p className="flex-1 text-sm leading-relaxed text-muted">{p.summary}</p>}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {limbs.map((l, i) => <LimbCard key={l.label} index={i} {...l} />)}
      </div>
      {((p.favor && p.favor.length > 0) || (p.avoid && p.avoid.length > 0)) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {p.favor && p.favor.length > 0 && (
            <div className="rounded-2xl border border-success/20 bg-success/[0.05] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-success">
                <ThumbsUp className="h-4 w-4" aria-hidden="true" /> Good for
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {p.favor.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {p.avoid && p.avoid.length > 0 && (
            <div className="rounded-2xl border border-warning/20 bg-warning/[0.05] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-warning">
                <Hourglass className="h-4 w-4" aria-hidden="true" /> Better to wait on
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {p.avoid.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );

  if (bare) return body;
  return (
    <Card>
      <CardHeader
        title="Panchanga"
        description={
          context === 'daily'
            ? 'The five limbs of the Vedic calendar for the moment you chose.'
            : 'The five limbs of the Vedic calendar at the moment of birth.'
        }
      />
      {body}
    </Card>
  );
}
