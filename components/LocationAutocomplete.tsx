import { useEffect, useRef, useState } from 'react';
import { useGeocode } from '@/hooks/useGeocode';
import type { PlaceSuggestion } from '@/util/geocode';

export default function LocationAutocomplete({ value, onChange, onSelect, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (item: PlaceSuggestion) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const { data: items = [], isFetching } = useGeocode(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <input
        className="border rounded p-2 w-full"
        placeholder={placeholder || 'City, Country'}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && (items.length > 0 || isFetching) && (
        <div className="absolute mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-800 border rounded shadow z-20">
          {isFetching && <div className="p-2 text-sm text-gray-500">Searching…</div>}
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              className="block w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => { onSelect(it); setOpen(false); }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}