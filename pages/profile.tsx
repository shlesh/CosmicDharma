import React, { useState, useEffect } from 'react';
import { fetchJson } from '../util/api';
import ProfileForm from '../components/ProfileForm';
import BasicInfo from '../components/BasicInfo';
import ProfileSummary from '../components/ProfileSummary';
import CoreElements from '../components/CoreElements';
import PlanetTable from '../components/PlanetTable';
import HouseAnalysis from '../components/HouseAnalysis';
import DashaTable from '../components/DashaTable';
import DashaChart from '../components/DashaChart';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import { motion } from 'framer-motion';

interface ProfileFormData {
  name: string;
  birthDate: string;
  birthTime: string;
  location: string;
}

interface JobResponse {
  job_id: string;
}

interface JobStatus {
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: any;
  error?: string;
}

interface ProfileData {
  birthInfo: Record<string, any>;
  analysis?: Record<string, any>;
  coreElements?: Record<string, any>;
  planetaryPositions?: any[];
  houses?: Record<string, any>;
  vimshottariDasha?: any[];
  nakshatra?: Record<string, any>;
  divisionalCharts?: Record<string, any>;
  yogas?: Record<string, any>;
  shadbala?: Record<string, any>;
  bhavaBala?: Record<string, any>;
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormData>({ 
    name: '', 
    birthDate: '', 
    birthTime: '', 
    location: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStart, setJobStart] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const toast = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setProfile(null);
    setProgress(0);
    setAnnouncement('Calculation started');
    
    try {
      const data = await fetchJson<JobResponse>('/profile/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.birthDate,
          time: form.birthTime,
          location: form.location,
          ayanamsa: 'lahiri',
          lunar_node: 'mean',
          house_system: 'whole_sign'
        }),
      });
      
      setJobId(data.job_id);
      setJobStart(Date.now());
      toast('Calculating your birth chart...');
    } catch (err: any) {
      console.error('Profile request error:', err);
      setError(err.message || 'Failed to start calculation');
      setLoading(false);
      toast('Failed to start calculation');
    }
  };

  useEffect(() => {
    if (!jobId) return;
    
    const checkJob = async () => {
      try {
        const data = await fetchJson<JobStatus>(`/jobs/${jobId}`);
        
        // Update progress
        if (jobStart) {
          const elapsed = Date.now() - jobStart;
          const estimatedProgress = Math.min(90, (elapsed / 10000) * 100);
          setProgress(estimatedProgress);
        }
        
        if (data.status === 'complete' && data.result) {
          setProfile({ ...data.result, request: form });
          setJobId(null);
          setJobStart(null);
          setLoading(false);
          setProgress(100);
          setAnnouncement('Calculation complete');
          toast('Birth chart calculated successfully!');
        } else if (data.status === 'error') {
          setError(data.error || 'Calculation failed');
          setJobId(null);
          setJobStart(null);
          setLoading(false);
          setProgress(0);
          toast('Calculation failed. Please try again.');
        } else if (jobStart && Date.now() - jobStart > 30000) {
          setError('Calculation is taking too long. Please try again.');
          setJobId(null);
          setJobStart(null);
          setLoading(false);
          setProgress(0);
          toast('Calculation timeout. Please try again.');
        }
      } catch (err: any) {
        console.error('Job check error:', err);
        // Don't stop polling on temporary errors
        if (jobStart && Date.now() - jobStart > 30000) {
          setError('Failed to check calculation status');
          setJobId(null);
          setJobStart(null);
          setLoading(false);
          setProgress(0);
        }
      }
    };

    const interval = setInterval(checkJob, 1000);
    checkJob(); // Check immediately
    
    return () => clearInterval(interval);
  }, [jobId, jobStart, form, toast]);

  return (
    <main className="container py-8">
      <span className="sr-only" aria-live="polite">{announcement}</span>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-center mb-2">Vedic Birth Chart Calculator</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Discover your cosmic blueprint through authentic Vedic astrology calculations
        </p>
      </motion.div>

      <ProfileForm 
        form={form} 
        onChange={handleChange} 
        onSubmit={handleSubmit} 
        loading={loading} 
      />
      
      {error && (
        <Card variant="glass" className="mt-4 max-w-2xl mx-auto">
          <p className="text-red-500 text-center">{error}</p>
        </Card>
      )}
      
      {loading && !profile && (
        <>
          <div className="max-w-2xl mx-auto mt-8">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Calculating your chart...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
          <ProfileSkeleton />
        </>
      )}
      
      {profile && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 space-y-6"
        >
          <BasicInfo birth={{ 
            ...profile.birthInfo, 
            date: form.birthDate,
            time: form.birthTime,
            location: form.location 
          }} />
          
          {profile.nakshatra && (
            <ProfileSummary analysis={{ nakshatra: profile.nakshatra }} />
          )}
          
          {(profile.coreElements || profile.analysis?.coreElements) && (
            <CoreElements 
              analysis={profile.analysis} 
              elements={profile.coreElements} 
            />
          )}
          
          {profile.planetaryPositions && (
            <PlanetTable planets={profile.planetaryPositions} />
          )}
          
          {(profile.houses || profile.analysis?.houses) && (
            <HouseAnalysis houses={profile.analysis?.houses || profile.houses} />
          )}
          
          {profile.vimshottariDasha && (
            <>
              <DashaTable dasha={profile.vimshottariDasha} />
              <DashaChart 
                dasha={profile.vimshottariDasha} 
                analysis={profile.analysis?.vimshottariDasha} 
              />
            </>
          )}
        </motion.section>
      )}
    </main>
  );
}
