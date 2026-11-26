import { useEffect, useId, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useGeocode } from '@/hooks/useGeocode';
import type { PlaceSuggestion } from '@/util/geocode';
import { controlClass } from '@/components/ui/Field';
import { cn } from '@/util/cn';

/**
 * Place search as an ARIA combobox: type to search, arrow keys to move, Enter to pick, Escape
 * to close. Picking a suggestion hands its coordinates to the parent via onSelect.
 */
export default function LocationAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'City, country',
  id,
  invalid,
  describedBy,
}: {
  value: string;
  id?: string;
  invalid?: boolean;
  describedBy?: string;
  onChange: (v: string) => void;
  onSelect: (item: PlaceSuggestion) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { data: items = [], isFetching } = useGeocode(value);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;
  const query = value.trim();
  const showList = open && query.length >= 3;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setActive(-1), [items]);

  const pick = (item: PlaceSuggestion) => {
    onSelect(item);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (items.length ? (i + 1) % items.length : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (items.length ? (i - 1 + items.length) % items.length : -1));
    } else if (e.key === 'Enter' && open && active >= 0 && items[active]) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? optionId(active) : undefined}
        className={cn(controlClass, 'h-12 pl-11 pr-10')}
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {isFetching && (
        <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-subtle" aria-hidden="true" />
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-line/10 bg-surface/95 p-1.5 shadow-lift backdrop-blur-xl"
        >
          {items.length === 0 ? (
            <li className="px-3 py-3 text-sm text-subtle" role="presentation">
              {isFetching ? 'Searching…' : 'No matching places. Try adding the country.'}
            </li>
          ) : (
            items.map((item, i) => {
              const parts = item.label.split(',').map((s) => s.trim()).filter(Boolean);
              const title = parts[0] || item.label;
              const rest = parts.slice(1).filter((p) => !/^\d[\d\s-]*$/.test(p)).slice(-3).join(', ');
              return (
                <li
                  key={item.id || `${item.lat},${item.lon}`}
                  id={optionId(i)}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(item)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
                    i === active ? 'bg-accent/10' : 'hover:bg-line/[0.05]',
                  )}
                >
                  <MapPin className={cn('mt-0.5 h-4 w-4 shrink-0', i === active ? 'text-accent' : 'text-subtle')} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-fg">{title}</span>
                    {rest && <span className="block truncate text-xs text-subtle">{rest}</span>}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
