import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { panchangaApi, type PanchangaResponse } from '@/util/api';
import Skeleton from '@/components/ui/Skeleton';

// Tithi, nakshatra, yoga and karana at a given instant are the same everywhere on Earth, so any
// coordinates will do. Ujjain is the traditional prime meridian of Indian astronomy.
const UJJAIN = { location: 'Ujjain, India', lat: 23.1765, lon: 75.7885 };

function nowParts() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** "The sky right now": the four time-based limbs of the panchanga, live from the API. */
export default function LiveSky() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['live-sky'],
    queryFn: async () => {
      // The API reads date and time as local time at the given place, so convert "now" to Ujjain (UTC+5:30).
      const now = new Date();
      const ist = new Date(now.getTime() + (330 + now.getTimezoneOffset()) * 60000);
      const pad = (n: number) => String(n).padStart(2, '0');
      const res = await panchangaApi.compute({
        ...UJJAIN,
        date: `${ist.getFullYear()}-${pad(ist.getMonth() + 1)}-${pad(ist.getDate())}`,
        time: `${pad(ist.getHours())}:${pad(ist.getMinutes())}`,
      });
      const p = (res as any)?.panchanga ?? res;
      return p as PanchangaResponse;
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });

  if (isError) return null;

  const items = data
    ? [
        { label: 'Tithi', value: data.tithi?.name, note: data.tithi?.paksha ? `${data.tithi.paksha} paksha` : undefined },
        { label: 'Nakshatra', value: data.nakshatra?.nakshatra, note: data.nakshatra?.pada ? `Pada ${data.nakshatra.pada}` : undefined },
        { label: 'Yoga', value: data.yoga?.name, note: data.yoga?.meaning },
        { label: 'Karana', value: data.karana?.name, note: data.karana?.meaning },
      ]
    : [];

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/10 px-5 py-3 sm:px-6">
        <p className="flex items-center gap-2 text-sm font-medium text-fg">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/70 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          The sky right now
        </p>
        <p className="text-xs text-subtle">{nowParts().date} · updates every few minutes</p>
      </div>
      <dl className="grid grid-cols-2 divide-line/10 md:grid-cols-4 md:divide-x">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2 px-5 py-5 sm:px-6">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-28" />
              </div>
            ))
          : items.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="min-w-0 px-5 py-5 sm:px-6"
              >
                <dt className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{item.label}</dt>
                <dd className="mt-1.5 truncate font-display text-xl font-semibold text-fg sm:text-2xl">{item.value || '—'}</dd>
                {item.note && <dd className="mt-0.5 line-clamp-1 text-xs text-muted">{item.note}</dd>}
              </motion.div>
            ))}
      </dl>
    </div>
  );
}
