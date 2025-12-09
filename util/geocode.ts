export interface PlaceSuggestion {
  id: string;
  label: string;       // human readable
  place_name: string;  // raw provider label
  lat: number;
  lon: number;
}

async function mapboxSearch(q: string, limit = 5): Promise<PlaceSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return [];
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?autocomplete=true&limit=${limit}&language=en&types=place,locality,region,country&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.features || []).map((f: any) => ({
    id: f.id,
    label: f.place_name,
    place_name: f.place_name,
    lat: f.center?.[1],
    lon: f.center?.[0],
  }));
}

async function nominatimSearch(q: string, limit = 5): Promise<PlaceSuggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json || []).map((it: any) => ({
    id: it.place_id?.toString(),
    label: it.display_name,
    place_name: it.display_name,
    lat: parseFloat(it.lat),
    lon: parseFloat(it.lon),
  }));
}

export async function geocodeSearch(q: string, limit = 5): Promise<PlaceSuggestion[]> {
  if (!q || q.trim().length < 3) return [];
  // Prefer Mapbox if token present; otherwise Nominatim
  const mb = await mapboxSearch(q, limit);
  if (mb.length) return mb;
  return nominatimSearch(q, limit);
}