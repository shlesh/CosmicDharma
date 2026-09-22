import { useState } from 'react';
import { useProfileJob } from '@/hooks/useProfileJob';
import { ProfileResult, StartProfileJobRequest } from '@/util/api';
import ProfileForm from '@/components/astrology/ProfileForm';
import ProfileSkeleton from '@/components/ui/ProfileSkeleton';
import BasicInfo from '@/components/astrology/BasicInfo';
import ProfileSummary from '@/components/astrology/ProfileSummary';
import CoreElements from '@/components/astrology/CoreElements';
import PlanetTable from '@/components/astrology/PlanetTable';
import HouseAnalysis from '@/components/astrology/HouseAnalysis';
import DashaTable from '@/components/astrology/DashaTable';
import DashaChart from '@/components/astrology/DashaChart';
import PanchangaPanel from '@/components/astrology/PanchangaPanel';
import YugaPanel from '@/components/astrology/YugaPanel';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const [announcement, setAnnouncement] = useState<string>('');

  const { startJob, starting, startError, job, progress } = useProfileJob();

  const onSubmit = (values: StartProfileJobRequest) => {
    setAnnouncement('Starting…');
    startJob(values, {
      onSuccess: () => setAnnouncement('Calculating your chart…'),
    });
  };

  const effectiveProgress = Math.max(progress, job?.progress || 0);
  const status = job?.status;
  const result: ProfileResult | undefined = job?.result;
  const done = status === 'complete' && result;

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Your Vedic Profile</h1>

      <ProfileForm onSubmit={onSubmit} submitting={starting} serverError={startError || job?.error} />

      {(starting || (status && status !== 'complete' && status !== 'error')) && !done && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span role="status" aria-live="polite">{announcement || 'Calculating your chart…'}</span>
              <span>{Math.round(effectiveProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                role="progressbar"
                aria-valuenow={Math.round(effectiveProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${effectiveProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <ProfileSkeleton />
        </div>
      )}

      {status === 'error' && (
        <p className="text-red-600 mt-4">{job?.error || 'Calculation failed. Please try again.'}</p>
      )}

      {done && result && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8 mt-8"
        >
          <BasicInfo birth={result.birthInfo} />
          <YugaPanel yuga={result.yuga || result.birthInfo?.yuga} lineage={result.lineage} />
          <PanchangaPanel panchanga={result.panchanga} />
          <ProfileSummary analysis={result.analysis} />
          <CoreElements elements={result.coreElements} />
          <PlanetTable planets={result.planetaryPositions} />
          <HouseAnalysis houses={result.houses} />
          {result.vimshottariDasha && (
            <>
              <DashaTable dasha={result.vimshottariDasha} />
              <DashaChart dasha={result.vimshottariDasha} analysis={result.analysis?.vimshottariDasha} />
            </>
          )}
        </motion.section>
      )}
    </main>
  );
}
