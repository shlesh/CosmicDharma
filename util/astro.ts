// Display helpers for chart data. Sign numbers are 1-12 (Aries = 1), as in the API.

const TEXT = '︎'; // forces the text (not emoji) presentation of astrological glyphs

export interface SignInfo {
  name: string;
  sanskrit: string;
  glyph: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  lord: string;
}

export const SIGNS: SignInfo[] = [
  { name: 'Aries', sanskrit: 'Meṣa', glyph: `♈${TEXT}`, element: 'Fire', lord: 'Mars' },
  { name: 'Taurus', sanskrit: 'Vṛṣabha', glyph: `♉${TEXT}`, element: 'Earth', lord: 'Venus' },
  { name: 'Gemini', sanskrit: 'Mithuna', glyph: `♊${TEXT}`, element: 'Air', lord: 'Mercury' },
  { name: 'Cancer', sanskrit: 'Karka', glyph: `♋${TEXT}`, element: 'Water', lord: 'Moon' },
  { name: 'Leo', sanskrit: 'Siṃha', glyph: `♌${TEXT}`, element: 'Fire', lord: 'Sun' },
  { name: 'Virgo', sanskrit: 'Kanyā', glyph: `♍${TEXT}`, element: 'Earth', lord: 'Mercury' },
  { name: 'Libra', sanskrit: 'Tulā', glyph: `♎${TEXT}`, element: 'Air', lord: 'Venus' },
  { name: 'Scorpio', sanskrit: 'Vṛścika', glyph: `♏${TEXT}`, element: 'Water', lord: 'Mars' },
  { name: 'Sagittarius', sanskrit: 'Dhanu', glyph: `♐${TEXT}`, element: 'Fire', lord: 'Jupiter' },
  { name: 'Capricorn', sanskrit: 'Makara', glyph: `♑${TEXT}`, element: 'Earth', lord: 'Saturn' },
  { name: 'Aquarius', sanskrit: 'Kumbha', glyph: `♒${TEXT}`, element: 'Air', lord: 'Saturn' },
  { name: 'Pisces', sanskrit: 'Mīna', glyph: `♓${TEXT}`, element: 'Water', lord: 'Jupiter' },
];

export interface PlanetInfo {
  name: string;
  sanskrit: string;
  abbr: string;
  glyph: string;
  /** CSS colour used for this graha in charts and timelines */
  color: string;
}

export const PLANETS: Record<string, PlanetInfo> = {
  Lagna: { name: 'Ascendant', sanskrit: 'Lagna', abbr: 'As', glyph: 'As', color: 'rgb(var(--accent))' },
  Sun: { name: 'Sun', sanskrit: 'Sūrya', abbr: 'Su', glyph: `☉${TEXT}`, color: '#f2b84b' },
  Moon: { name: 'Moon', sanskrit: 'Candra', abbr: 'Mo', glyph: `☽${TEXT}`, color: '#c9d3ea' },
  Mars: { name: 'Mars', sanskrit: 'Maṅgala', abbr: 'Ma', glyph: `♂${TEXT}`, color: '#ef6f5e' },
  Mercury: { name: 'Mercury', sanskrit: 'Budha', abbr: 'Me', glyph: `☿${TEXT}`, color: '#5cc99b' },
  Jupiter: { name: 'Jupiter', sanskrit: 'Guru', abbr: 'Ju', glyph: `♃${TEXT}`, color: '#f0cf72' },
  Venus: { name: 'Venus', sanskrit: 'Śukra', abbr: 'Ve', glyph: `♀${TEXT}`, color: '#e99ac4' },
  Saturn: { name: 'Saturn', sanskrit: 'Śani', abbr: 'Sa', glyph: `♄${TEXT}`, color: '#8ea2e8' },
  Rahu: { name: 'Rahu', sanskrit: 'Rāhu', abbr: 'Ra', glyph: `☊${TEXT}`, color: '#a48ae6' },
  Ketu: { name: 'Ketu', sanskrit: 'Ketu', abbr: 'Ke', glyph: `☋${TEXT}`, color: '#c49a7a' },
};

export const PLANET_ORDER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

export const planetInfo = (name: string): PlanetInfo =>
  PLANETS[name] || { name, sanskrit: name, abbr: name.slice(0, 2), glyph: name.slice(0, 2), color: 'rgb(var(--muted))' };

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

/** Sign number (1-12) from a name or number; null if unknown. */
export function signNumber(value: unknown): number | null {
  if (typeof value === 'number' && value >= 1 && value <= 12) return Math.trunc(value);
  if (typeof value === 'string') {
    const asNum = Number(value);
    if (Number.isInteger(asNum) && asNum >= 1 && asNum <= 12) return asNum;
    const i = SIGNS.findIndex((s) => s.name.toLowerCase() === value.trim().toLowerCase());
    return i >= 0 ? i + 1 : null;
  }
  return null;
}

export const signInfo = (value: unknown): SignInfo | null => {
  const n = signNumber(value);
  return n ? SIGNS[n - 1] : null;
};

/** Whole-sign house of a sign counted from the ascendant sign. */
export const houseFromLagna = (sign: number, lagnaSign: number) => ((sign - lagnaSign + 12) % 12) + 1;

/** Sign occupying a house, counted from the ascendant sign. */
export const signOfHouse = (house: number, lagnaSign: number) => ((lagnaSign - 1 + house - 1) % 12) + 1;

/** 15.9612 -> 15°57′ */
export function formatDegree(deg: number, withSeconds = false): string {
  if (!Number.isFinite(deg)) return '—';
  const totalSeconds = Math.round(deg * 3600);
  const d = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return withSeconds ? `${d}°${String(m).padStart(2, '0')}′${String(s).padStart(2, '0')}″` : `${d}°${String(m).padStart(2, '0')}′`;
}

export function formatLatLon(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return '—';
  return `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
}

/** "1990-05-15" -> "15 May 1990" without timezone surprises. */
export function formatDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }): string {
  if (!iso) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  const date = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(date);
}

/** "14:05" -> "2:05 pm" */
export function formatTime(hhmm?: string | null): string {
  if (!hhmm) return '—';
  const [h, m] = hhmm.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const suffix = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
}

export interface DashaPeriod {
  lord: string;
  start: string;
  end: string;
  sub?: DashaPeriod[];
}

const toTime = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : new Date(iso).getTime();
};

export const periodContains = (p: DashaPeriod, at: number) => toTime(p.start) <= at && at < toTime(p.end);

/** Fraction (0-1) of a period that has elapsed at `at`. */
export function periodProgress(p: DashaPeriod, at: number): number {
  const start = toTime(p.start);
  const end = toTime(p.end);
  if (!(end > start)) return 0;
  return Math.min(1, Math.max(0, (at - start) / (end - start)));
}

export const periodYears = (p: DashaPeriod) => (toTime(p.end) - toTime(p.start)) / (365.25 * 86400000);

/** The running mahadasha and antardasha at a moment (default: now). */
export function currentDasha(dasha: DashaPeriod[] | undefined, at = Date.now()) {
  if (!Array.isArray(dasha)) return { maha: null, antar: null };
  const maha = dasha.find((p) => periodContains(p, at)) || null;
  const antar = maha?.sub?.find((p) => periodContains(p, at)) || null;
  return { maha, antar };
}

export { toTime as dateToTime };
