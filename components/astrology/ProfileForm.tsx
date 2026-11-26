import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Field, Input, Select, FormError } from '@/components/ui/Field';
import type { StartProfileJobRequest } from '@/util/api';
import LocationAutocomplete from './LocationAutocomplete';
import type { PlaceSuggestion } from '@/util/geocode';
import { cn } from '@/util/cn';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Schema = z.object({
  name: z.string().trim().max(80).optional(),
  birthDate: z
    .string()
    .min(1, 'Enter your date of birth')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
    .refine((v) => v <= today(), 'The date can’t be in the future'),
  birthTime: z
    .string()
    .min(1, 'Enter your time of birth')
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Use the format HH:MM'),
  location: z.string().trim().min(2, 'Enter your place of birth'),
  ayanamsa: z.enum(['yukteswar', 'lahiri', 'raman', 'kp', 'fagan_bradley']),
  nodeType: z.enum(['mean', 'true']),
  houseSystem: z.enum(['whole_sign', 'equal', 'sripati']),
});

type FormValues = z.infer<typeof Schema>;

export const AYANAMSA_OPTIONS = [
  { value: 'yukteswar', label: 'Sri Yukteswar (default)' },
  { value: 'lahiri', label: 'Lahiri (Chitrapaksha)' },
  { value: 'raman', label: 'B. V. Raman' },
  { value: 'kp', label: 'Krishnamurti (KP)' },
  { value: 'fagan_bradley', label: 'Fagan/Bradley' },
] as const;

export default function ProfileForm({
  onSubmit,
  submitting,
  serverError,
  defaultValues,
}: {
  onSubmit: (payload: StartProfileJobRequest) => void;
  submitting?: boolean;
  serverError?: string | null;
  defaultValues?: Partial<FormValues>;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      birthDate: '',
      birthTime: '',
      location: '',
      ayanamsa: 'yukteswar',
      nodeType: 'mean',
      houseSystem: 'whole_sign',
      ...defaultValues,
    },
  });

  // Coordinates of the picked suggestion. Cleared on any edit, so they never go stale.
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const [advanced, setAdvanced] = useState(false);

  const submit = handleSubmit((v) => {
    const payload: StartProfileJobRequest = {
      name: v.name || undefined,
      birthDate: v.birthDate,
      birthTime: v.birthTime,
      location: v.location.trim(),
      ...coords,
    };
    // Only send options that differ from the API's defaults.
    if (v.ayanamsa !== 'yukteswar') payload.ayanamsa = v.ayanamsa;
    if (v.nodeType !== 'mean') payload.nodeType = v.nodeType;
    if (v.houseSystem !== 'whole_sign') payload.houseSystem = v.houseSystem;
    onSubmit(payload);
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Name" optional hint="Only used to title your chart." id="pf-name">
        {(p) => <Input {...p} placeholder="e.g. Asha" autoComplete="name" {...register('name')} />}
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Field label="Date of birth" error={errors.birthDate?.message} id="pf-date">
          {(p) => <Input {...p} type="date" max={today()} min="1800-01-01" placeholder="YYYY-MM-DD" {...register('birthDate')} />}
        </Field>
        <Field label="Time of birth" error={errors.birthTime?.message} id="pf-time">
          {(p) => <Input {...p} type="time" placeholder="HH:MM" {...register('birthTime')} />}
        </Field>
      </div>

      <Field
        label="Place of birth"
        error={errors.location?.message}
        hint="Pick a suggestion for exact coordinates."
        id="pf-place"
      >
        {(p) => (
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <LocationAutocomplete
                id={p.id}
                invalid={p['aria-invalid']}
                describedBy={p['aria-describedby']}
                placeholder="Birth place"
                value={field.value}
                onChange={(v: string) => {
                  field.onChange(v);
                  setCoords({});
                }}
                onSelect={(it: PlaceSuggestion) => {
                  setValue('location', it.label, { shouldValidate: true });
                  setCoords({ lat: it.lat, lon: it.lon });
                }}
              />
            )}
          />
        )}
      </Field>

      <div className="rounded-2xl border border-line/10">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          aria-controls="pf-advanced"
          className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-muted transition-colors hover:text-fg"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Advanced options
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', advanced && 'rotate-180')} aria-hidden="true" />
        </button>
        <AnimatePresence initial={false}>
          {advanced && (
            <motion.div
              id="pf-advanced"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="grid gap-4 border-t border-line/10 p-4 sm:grid-cols-3">
                <Field label="Ayanamsa" id="pf-ayanamsa">
                  {(p) => (
                    <Select {...p} {...register('ayanamsa')}>
                      {AYANAMSA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  )}
                </Field>
                <Field label="Lunar nodes" id="pf-node">
                  {(p) => (
                    <Select {...p} {...register('nodeType')}>
                      <option value="mean">Mean node</option>
                      <option value="true">True node</option>
                    </Select>
                  )}
                </Field>
                <Field label="Houses" id="pf-houses">
                  {(p) => (
                    <Select {...p} {...register('houseSystem')}>
                      <option value="whole_sign">Whole sign</option>
                      <option value="equal">Equal</option>
                      <option value="sripati">Sripati</option>
                    </Select>
                  )}
                </Field>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FormError>{serverError}</FormError>

      <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-subtle sm:max-w-[60%]">
          Not sure of the time? Use 12:00. Most planets will be right; the Moon, ascendant and houses may not be.
        </p>
        <Button type="submit" size="lg" loading={submitting} className="group">
          {submitting ? 'Calculating…' : 'Calculate chart'}
          {!submitting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </div>
    </form>
  );
}
