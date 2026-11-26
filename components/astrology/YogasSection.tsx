import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { planetInfo } from '@/util/astro';

const GROUPS: Record<string, { title: string; about: string }> = {
  pancha_mahapurusha: { title: 'Pancha Mahapurusha', about: 'A strong Mars, Mercury, Jupiter, Venus or Saturn in an angle.' },
  raj_yogas: { title: 'Raja yogas', about: 'Links between the lords of angles and trines: status and influence.' },
  dhana_yogas: { title: 'Dhana yogas', about: 'Combinations of the houses of wealth.' },
  chandra_yogas: { title: 'Lunar yogas', about: 'Planets around the Moon that colour the mind.' },
  nabhasa_yogas: { title: 'Nabhasa yogas', about: 'Patterns formed by the whole chart.' },
};

type Yoga = {
  name: string;
  type?: string;
  planet?: string;
  planets?: string[];
  house?: number;
  houses?: number[];
  strength?: string;
  effects?: string;
};

const strengthTone = (s?: string) => (!s ? 'neutral' : /very|strong/i.test(s) ? 'success' : /weak/i.test(s) ? 'warning' : 'accent');

export default function YogasSection({ yogas }: { yogas?: Record<string, any> | null }) {
  const groups: Record<string, Yoga[]> = (yogas && (yogas.yogas || yogas)) || {};
  const entries = Object.entries(groups).filter(([, list]) => Array.isArray(list) && list.length > 0) as [string, Yoga[]][];
  const total = entries.reduce((n, [, list]) => n + list.length, 0);

  return (
    <Card>
      <CardHeader
        title="Yogas"
        description={total ? `${total} classical combination${total === 1 ? '' : 's'} found in this chart.` : 'Classical planetary combinations.'}
      />
      {entries.length === 0 ? (
        <EmptyState icon={<Sparkles className="h-5 w-5" />} title="No named yogas" description="None of the yogas we check for are formed in this chart." className="py-8" />
      ) : (
        <div className="space-y-8">
          {entries.map(([group, list]) => (
            <section key={group}>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-fg">{GROUPS[group]?.title || group.replace(/_/g, ' ')}</h3>
                {GROUPS[group]?.about && <p className="text-xs text-subtle">{GROUPS[group].about}</p>}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {list.map((y, i) => {
                  const planets = y.planets || (y.planet ? [y.planet] : []);
                  const houses = y.houses || (y.house ? [y.house] : []);
                  return (
                    <motion.article
                      key={`${y.name}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl border border-line/10 bg-canvas/30 p-4"
                    >
                      <header className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-display text-xl font-semibold leading-tight">{y.name}</h4>
                          {y.type && <p className="text-xs text-subtle">{y.type}</p>}
                        </div>
                        {y.strength && <Badge tone={strengthTone(y.strength)}>{y.strength}</Badge>}
                      </header>
                      {y.effects && <p className="mt-3 text-sm leading-relaxed text-muted">{y.effects}.</p>}
                      {(planets.length > 0 || houses.length > 0) && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/[0.06] pt-3 text-xs text-muted">
                          {planets.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line/10 px-2 py-0.5 text-fg">
                              <span className="planet-dot h-1.5 w-1.5 rounded-full" style={{ ['--pc' as any]: planetInfo(p).color }} aria-hidden="true" />
                              {p}
                            </span>
                          ))}
                          {houses.length > 0 && <span className="ml-1">House{houses.length > 1 ? 's' : ''} {houses.join(', ')}</span>}
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Card>
  );
}
