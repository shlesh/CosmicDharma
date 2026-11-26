import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, CalendarClock, BookOpen, CircleDot, Plus, LogIn } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Tabs, TabPanel } from '@/components/ui/Tabs';
import ChartDiagram from '@/components/astrology/ChartDiagram';
import { useAuth } from '@/hooks/useAuth';
import { loadChart, type SavedChart } from '@/util/savedChart';
import { currentDasha, formatDate, signNumber } from '@/util/astro';

// Only admins open this tab; don't make every user download it.
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  ssr: false,
  loading: () => <Skeleton className="h-96" />,
});

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function SavedChartCard({ chart }: { chart: SavedChart | null }) {
  const data = useMemo(() => {
    if (!chart) return null;
    const r: any = chart.result;
    const placements: Record<string, number> = {};
    for (const p of r.planetaryPositions || []) {
      const n = signNumber(p.sign);
      if (n) placements[p.name] = n;
    }
    const lagna = signNumber(r.birthInfo?.lagna_sign ?? r.birthInfo?.ascendant_sign);
    const { maha, antar } = currentDasha(r.vimshottariDasha);
    return { r, placements, lagna, maha, antar };
  }, [chart]);

  if (!chart || !data) {
    return (
      <Card>
        <EmptyState
          icon={<CircleDot className="h-5 w-5" />}
          title="No chart yet"
          description="Cast your birth chart and it will appear here whenever you come back."
          action={<ButtonLink href="/profile">Cast your chart <ArrowRight className="h-4 w-4" /></ButtonLink>}
        />
      </Card>
    );
  }

  const { r, placements, lagna, maha, antar } = data;
  return (
    <Card>
      <CardHeader
        eyebrow="Your chart"
        title={chart.meta?.name ? `${chart.meta.name}’s chart` : 'Birth chart'}
        description={[formatDate(r.birthInfo?.date), r.birthInfo?.time, chart.meta?.location].filter(Boolean).join(' · ')}
        action={<ButtonLink href="/profile" size="sm">Open chart <ArrowRight className="h-4 w-4" /></ButtonLink>}
      />
      <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,240px)_1fr]">
        <ChartDiagram placements={placements} lagnaSign={lagna} style="north" className="mx-auto max-w-[240px]" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-line/[0.04] p-3">
            <dt className="text-xs text-subtle">Ascendant</dt>
            <dd className="mt-0.5 font-medium text-fg">{r.birthInfo?.ascendant_sign || '—'}</dd>
          </div>
          <div className="rounded-xl bg-line/[0.04] p-3">
            <dt className="text-xs text-subtle">Moon</dt>
            <dd className="mt-0.5 font-medium text-fg">{r.planetaryPositions?.find((p: any) => p.name === 'Moon')?.sign || '—'}</dd>
          </div>
          <div className="col-span-2 rounded-xl bg-accent/[0.07] p-3">
            <dt className="text-xs text-subtle">Running dasha</dt>
            <dd className="mt-0.5 font-medium text-fg">
              {maha ? `${maha.lord} mahadasha${antar ? `, ${antar.lord} antardasha` : ''}` : '—'}
            </dd>
            {antar && <dd className="text-xs text-muted">until {formatDate(antar.end, { month: 'long', year: 'numeric' })}</dd>}
          </div>
        </dl>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { token, ready, user, loadingUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [chart, setChart] = useState<SavedChart | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setChart(loadChart());
  }, []);

  if (!mounted || !ready) {
    return <div className="container py-14"><Skeleton className="h-10 w-72" /><Skeleton className="mt-8 h-72" /></div>;
  }

  if (!token) {
    return (
      <div className="container py-14">
        <Seo title="Dashboard" noindex />
        <Card className="mx-auto max-w-lg">
          <EmptyState
            icon={<LogIn className="h-5 w-5" />}
            title="Sign in to see your dashboard"
            description="Your dashboard keeps your chart and shortcuts in one place."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <ButtonLink href="/login?next=/dashboard">Sign in</ButtonLink>
                <ButtonLink href="/register" variant="secondary">Create an account</ButtonLink>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  const tabs = [{ id: 'overview', label: 'Overview' }];
  if (user?.is_admin) tabs.push({ id: 'admin', label: 'Admin' });

  return (
    <div className="container py-10 sm:py-14">
      <Seo title="Dashboard" noindex />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          {loadingUser ? (
            <Skeleton className="mt-3 h-12 w-72" />
          ) : (
            <h1 className="mt-2 font-display text-display-lg font-semibold">{`${greeting()}${user ? `, ${user.username}` : ''}`}</h1>
          )}
          {user && (
            <div className="mt-3 flex gap-2">
              {user.is_admin && <Badge tone="lunar">Admin</Badge>}
              {user.is_donor && <Badge tone="accent">Donor</Badge>}
            </div>
          )}
        </div>
        {tabs.length > 1 && <Tabs idBase="dash" label="Dashboard sections" items={tabs} value={tab} onChange={setTab} className="w-auto" />}
      </div>

      <div className="mt-8">
        {tab === 'overview' && (
          <TabPanel idBase="dash" id="overview" className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <SavedChartCard chart={chart} />
            <div className="grid content-start gap-4">
              {[
                { href: '/profile', icon: Plus, title: chart ? 'Cast another chart' : 'Cast a birth chart', body: 'For yourself or someone else.' },
                { href: '/panchanga', icon: CalendarClock, title: 'Today’s panchanga', body: 'Tithi, nakshatra and what the day supports.' },
                { href: '/posts', icon: BookOpen, title: 'Read the journal', body: 'Essays on Jyotisha and the yugas.' },
              ].map((a) => (
                <Link key={a.href} href={a.href} className="panel group flex items-center gap-4 p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/30">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                    <a.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-fg">{a.title}</span>
                    <span className="block text-sm text-muted">{a.body}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </TabPanel>
        )}
        {tab === 'admin' && user?.is_admin && (
          <TabPanel idBase="dash" id="admin">
            <AdminDashboard />
          </TabPanel>
        )}
      </div>
    </div>
  );
}
