import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { geocodeSearch, PlaceSuggestion } from '@/util/geocode';

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}

export function useGeocode(query: string) {
  const q = useDebouncedValue(query, 400);
  return useQuery<PlaceSuggestion[]>({
    queryKey: ['geocode', q],
    enabled: (q?.length || 0) >= 3,
    queryFn: () => geocodeSearch(q),
    staleTime: 60_000,
  });
}