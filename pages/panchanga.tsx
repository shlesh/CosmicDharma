import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LocateFixed, RotateCcw, ArrowRight, CalendarClock } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Field, Input, FormError } from '@/components/ui/Field';
import LocationAutocomplete from '@/components/astrology/LocationAutocomplete';
import PanchangaPanel from '@/components/astrology/PanchangaPanel';
import type { PlaceSuggestion } from '@/util/geocode';
import { panchangaApi, type PanchangaResponse } from '@/util/api';
import { formatDate, formatTime } from '@/util/astro';

const PLACE_KEY = 'cd-panchanga-place';
const pad = (n: number) => String(n).padStart(2, '0');
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const localNow = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function unwrap(res: PanchangaResponse | { panchanga?: PanchangaResponse }): PanchangaResponse {
  const nested = res && typeof res === 'object' && 'panchanga' in res ? res.panchanga : undefined;
  return { ...(res as PanchangaResponse), ...(nested || {}) };
}

type Place = { label: string; lat?: number; lon?: number };
type Shown = { data: PanchangaResponse; date: string; time: string; place: string };

export default function PanchangaPage() {
  const [date, setDate] = useState(localToday);
  const [time, setTime] = useState(localNow);
  const [location, setLocation] = useState('');
  // Coordinates of the picked suggestion; cleared on any edit so they never go stale.
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [shown, setShown] = useState<Shown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const autoRan = useRef(false);

  const run = async (place: Place, d = date, t = time) => {
    setError(null);
    setLoading(true);
    try {
      const res = await panchangaApi.compute({
        date: d,
        time: t || '12:00',
        location: place.label,
        ...(place.lat !== undefined && place.lon !== undefined ? { lat: place.lat, lon: place.lon } : {}),
      });
      setShown({ data: unwrap(res as PanchangaResponse), date: d, time: t, place: place.label });
      try { localStorage.setItem(PLACE_KEY, JSON.stringify(place)); } catch { /* ignore */ }
    } catch (err: any) {
      setError(err?.message || 'Could not calculate the panchanga. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Returning visitors see today's panchanga for their last place straight away.
  useEffect(() => {
    if (autoRan.current) return;
    autoRan.current = true;
    try {
      const raw = localStorage.getItem(PLACE_KEY);
      if (!raw) return;
      const place = JSON.parse(raw) as Place;
      if (!place?.label) return;
      setLocation(place.label);
      setCoords(place.lat !== undefined ? { lat: place.lat, lon: place.lon } : {});
      run(place, localToday(), localNow());
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim().length < 2) {
      setError('Enter a place, or use your current location.');
      return;
    }
    run({ label: location.trim(), ...coords });
  };

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Your browser cannot share its location. Type a place instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const place = { label: 'My location', lat: +pos.coords.latitude.toFixed(4), lon: +pos.coords.longitude.toFixed(4) };
        setLocation(place.label);
        setCoords({ lat: place.lat, lon: place.lon });
        run(place);
      },
      () => {
        setLocating(false);
        setError('Location access was denied. Type a place instead.');
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  };

  const resetToNow = () => { setDate(localToday()); setTime(localNow()); };

  return (
    <div className="container py-10 sm:py-14">
      <Seo
        title="Daily panchanga"
        description="Today’s panchanga for any place: tithi, vara, nakshatra, yoga and karana, with what the day favours."
      />
      <SectionHeading
        as="h1"
        eyebrow="Panchanga"
        title="The day, read the Vedic way"
        description="Tithi, vara, nakshatra, yoga and karana for any date, time and place, with what the moment supports."
      />

      <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-8">
        <Card padding="lg" className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date" id="pc-date">
                {(p) => <Input {...p} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />}
              </Field>
              <Field label="Time" id="pc-time">
                {(p) => <Input {...p} type="time" value={time} onChange={(e) => setTime(e.target.value)} required />}
              </Field>
            </div>
            <Field label="Place" id="pc-place">
              {(p) => (
                <LocationAutocomplete
                  id={p.id}
                  value={location}
                  onChange={(v: string) => { setLocation(v); setCoords({}); }}
                  onSelect={(it: PlaceSuggestion) => { setLocation(it.label); setCoords({ lat: it.lat, lon: it.lon }); }}
                />
              )}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={useMyLocation} loading={locating}>
                {!locating && <LocateFixed className="h-4 w-4" />} Use my location
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={resetToNow}>
                <RotateCcw className="h-4 w-4" /> Now
              </Button>
            </div>
            <FormError>{error}</FormError>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? 'Calculating…' : 'Show panchanga'}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </Card>

        <div aria-live="polite" className="min-w-0">
          <AnimatePresence mode="wait">
            {loading && !shown ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-36" />)}
                  </div>
                </Card>
              </motion.div>
            ) : shown ? (
              <motion.div
                key={`${shown.date}-${shown.time}-${shown.place}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: loading ? 0.5 : 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card padding="lg">
                  <p className="eyebrow">Panchanga</p>
                  <h2 className="mt-2 font-display text-display-md font-semibold">
                    {formatDate(shown.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {formatTime(shown.time)} · {shown.place}
                  </p>
                  <div className="mt-6">
                    <PanchangaPanel panchanga={shown.data} context="daily" bare />
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <EmptyState
                    icon={<CalendarClock className="h-5 w-5" />}
                    title="Choose a place"
                    description="Search for a town or use your current location. The date and time are already set to now."
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
