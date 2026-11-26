import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/util/cn';

/** ids that tie a tab to its panel; use with <TabPanel idBase=... id=...>. */
export const tabIds = (idBase: string, id: string) => ({ tab: `${idBase}-tab-${id}`, panel: `${idBase}-panel-${id}` });

export function TabPanel({ idBase, id, className, children }: { idBase: string; id: string; className?: string; children: React.ReactNode }) {
  const ids = tabIds(idBase, id);
  return (
    <div role="tabpanel" id={ids.panel} aria-labelledby={ids.tab} tabIndex={0} className={cn('focus-visible:outline-none', className)}>
      {children}
    </div>
  );
}

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * WAI-ARIA tabs: arrow keys move between tabs, Home/End jump. The row scrolls sideways on
 * small screens and the active pill glides between tabs.
 */
export function Tabs({
  items,
  value,
  onChange,
  className,
  label,
  idBase,
}: {
  idBase: string;
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  label: string;
}) {
  const group = idBase;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (index: number) => {
    const i = (index + items.length) % items.length;
    refs.current[i]?.focus();
    refs.current[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    onChange(items[i].id);
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); focusTab(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); focusTab(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    else if (e.key === 'End') { e.preventDefault(); focusTab(items.length - 1); }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        'no-scrollbar -mx-1 flex snap-x gap-1 overflow-x-auto rounded-full border border-line/10 bg-surface/60 p-1 backdrop-blur-xl',
        className,
      )}
    >
      {items.map((item, index) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            ref={(el) => { refs.current[index] = el; }}
            role="tab"
            type="button"
            id={tabIds(group, item.id).tab}
            aria-selected={active}
            aria-controls={tabIds(group, item.id).panel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'relative flex shrink-0 snap-start items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
              active ? 'text-accent-fg' : 'text-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${group}-pill`}
                className="absolute inset-0 rounded-full bg-accent shadow-[0_6px_20px_-8px_rgb(var(--accent)/0.8)]"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
