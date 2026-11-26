import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';

import { StartProfileJobRequest } from '@/util/api';
import LocationAutocomplete from './LocationAutocomplete';
import type { PlaceSuggestion } from '@/util/geocode';

const Schema = z.object({
  name: z.string().trim().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Use HH:MM or HH:MM:SS'),
  location: z.string().min(3, 'Enter a valid place'),
});

type FormValues = z.infer<typeof Schema>;

export default function ProfileForm({
  onSubmit,
  submitting,
  serverError,
}: {
  onSubmit: (payload: StartProfileJobRequest) => void;
  submitting?: boolean;
  serverError?: string | null;
}) {
  const {
    register,
    handleSubmit,
    setValue,   // ✅ needed for geocoder
    watch,      // ✅ needed for geocoder
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    mode: 'onChange',
    defaultValues: { name: '', birthDate: '', birthTime: '', location: '' },
  });

  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});
  const disabled = useMemo(() => submitting || !isValid, [submitting, isValid]);

  return (
    <Card className="max-w-2xl mx-auto p-4 md:p-6">
      <form
        onSubmit={handleSubmit((v) => onSubmit({ ...v, ...coords }))}
        className="grid gap-4 md:grid-cols-2"
      >
        <div className="md:col-span-2">
          <label htmlFor="pf-name" className="block text-sm font-medium mb-1">Name (optional)</label>
          <Input id="pf-name" placeholder="Your name" {...register('name')} />
        </div>

        <div>
          <label htmlFor="pf-date" className="block text-sm font-medium mb-1">Birth Date</label>
          <Input
            id="pf-date"
            placeholder="YYYY-MM-DD"
            aria-invalid={!!errors.birthDate || undefined}
            aria-describedby={errors.birthDate ? 'pf-date-error' : undefined}
            {...register('birthDate')}
          />
          {errors.birthDate && (
            <p id="pf-date-error" className="text-red-600 text-sm mt-1">{errors.birthDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="pf-time" className="block text-sm font-medium mb-1">Birth Time</label>
          <Input
            id="pf-time"
            placeholder="HH:MM"
            aria-invalid={!!errors.birthTime || undefined}
            aria-describedby={errors.birthTime ? 'pf-time-error' : undefined}
            {...register('birthTime')}
          />
          {errors.birthTime && (
            <p id="pf-time-error" className="text-red-600 text-sm mt-1">{errors.birthTime.message}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="pf-place" className="block text-sm font-medium mb-1">Birth Place</label>
          <LocationAutocomplete
            id="pf-place"
            invalid={!!errors.location}
            describedBy={errors.location ? 'pf-place-error' : undefined}
            value={watch('location')}
            onChange={(v: string) => {
              setValue('location', v, { shouldValidate: true });
              setCoords({});
            }}
            onSelect={(it: PlaceSuggestion) => {
              setValue('location', it.label, { shouldValidate: true });
              setCoords({ lat: it.lat, lon: it.lon });
            }}
          />
          {errors.location && (
            <p id="pf-place-error" className="text-red-600 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="md:col-span-2 text-red-600 text-sm">{serverError}</p>
        )}

        <div className="md:col-span-2 flex gap-3">
          <Button type="submit" disabled={disabled}>
            {submitting ? 'Calculating…' : 'Calculate'}
          </Button>
          {!isValid && (
            <span className="text-sm text-gray-500 self-center">
              Fill all fields to continue
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
