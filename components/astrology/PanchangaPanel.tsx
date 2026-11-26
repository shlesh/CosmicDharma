import React from 'react';
import { Card } from '../ui';

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
};

export interface PanchangaPanelProps {
  panchanga?: {
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
  } | null;
  context?: 'birth' | 'daily';
}

function qualityClass(quality?: string) {
  if (quality === 'favorable') return 'text-emerald-700 dark:text-emerald-400';
  if (quality === 'caution') return 'text-amber-700 dark:text-amber-400';
  return 'text-stone-600 dark:text-stone-300';
}

function LimbRow({
  label,
  value,
  detail,
}: {
  label: string;
  value?: string;
  detail?: string;
}) {
  if (!value) return null;
  return (
    <div className="mb-3">
      <p>
        <strong>{label}:</strong> {value}
      </p>
      {detail ? <p className="help-text mt-0.5">{detail}</p> : null}
    </div>
  );
}

export default function PanchangaPanel({ panchanga, context = 'birth' }: PanchangaPanelProps) {
  if (!panchanga) return null;

  const nakLabel = panchanga.nakshatra?.nakshatra
    ? `${panchanga.nakshatra.nakshatra}${panchanga.nakshatra.pada ? ` (pada ${panchanga.nakshatra.pada})` : ''}`
    : undefined;
  const tithiLabel = panchanga.tithi?.name
    ? `${panchanga.tithi.name}${panchanga.tithi.class ? ` · ${panchanga.tithi.class}` : ''}`
    : undefined;
  const vaaraLabel = panchanga.vaara
    ? `${panchanga.vaara}${panchanga.vaara_lord ? ` (${panchanga.vaara_lord})` : ''}`
    : undefined;

  const hasBody =
    Boolean(vaaraLabel) ||
    Boolean(tithiLabel) ||
    Boolean(nakLabel) ||
    Boolean(panchanga.yoga?.name) ||
    Boolean(panchanga.karana?.name);
  if (!hasBody && !panchanga.summary) return null;

  return (
    <Card variant="glass" className="mb-6">
      <h2 title="Five-limb Vedic calendar">Panchanga</h2>
      <p className="help-text">
        {context === 'daily'
          ? 'Tithi, vaara, nakshatra, yoga and karana for the chosen instant.'
          : 'Tithi, vaara, nakshatra, yoga and karana at the birth instant.'}
      </p>
      {panchanga.quality ? (
        <p className={qualityClass(panchanga.quality)}>
          <strong>Quality:</strong> {panchanga.quality}
        </p>
      ) : null}
      {panchanga.summary ? <p className="help-text">{panchanga.summary}</p> : null}

      <LimbRow label="Vaara" value={vaaraLabel} detail={panchanga.vaara_meaning} />
      <LimbRow label="Tithi" value={tithiLabel} detail={panchanga.tithi?.meaning} />
      <LimbRow label="Paksha" value={panchanga.tithi?.paksha} />
      <LimbRow
        label="Nakshatra"
        value={nakLabel}
        detail={panchanga.nakshatra?.meaning}
      />
      <LimbRow label="Yoga" value={panchanga.yoga?.name} detail={panchanga.yoga?.meaning} />
      <LimbRow label="Karana" value={panchanga.karana?.name} detail={panchanga.karana?.meaning} />

      {panchanga.favor && panchanga.favor.length > 0 ? (
        <div className="mt-3">
          <p><strong>Supports</strong></p>
          <ul className="help-text list-disc pl-5">
            {panchanga.favor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {panchanga.avoid && panchanga.avoid.length > 0 ? (
        <div className="mt-3">
          <p><strong>Better to wait on</strong></p>
          <ul className="help-text list-disc pl-5">
            {panchanga.avoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
