import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetchJson } from '../../util/api';
import BlogList from '../../components/blog/BlogList';
import AdminDashboard from '../../components/admin/AdminDashboard';
import { useToast } from '../../components/ui/ToastProvider';

interface DashboardUser {
  is_admin?: boolean;
  is_donor?: boolean;
  [key: string]: unknown;
}

import { DashboardPage as DashboardComponent } from '../../components/dashboard/DashboardPage';
import ProfileForm from '../../components/astrology/ProfileForm';
import { useProfileJob } from '../../hooks/useProfileJob';
import { StartProfileJobRequest, ProfileResult } from '../../util/api';
import { Card } from '../../components/ui/Card';



const LOCAL_STORAGE_KEY = 'cosmic_dharma_profile';

export default function DashboardPage() {
  const [tab, setTab] = useState<string>('Profile');
  const [profileData, setProfileData] = useState<ProfileResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const toast = useToast();

  // Job handling for new profile generation
  const { startJob, starting, startError, job, progress } = useProfileJob();

  const {
    data: user,
    error: userError
  } = useSWR<DashboardUser>(
    token ? ['/users/me', token] : null,
    ([url, t]) => fetchJson(url, { headers: { Authorization: `Bearer ${t}` } })
  );

  useEffect(() => {
    if (userError) toast('Failed to load user');
  }, [userError]);

  // Load saved profile on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProfileData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    }
  }, []);

  // Persist job result when complete
  useEffect(() => {
    if (job?.status === 'complete' && job.result) {
      setProfileData(job.result);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(job.result));
      toast('Chart calculation complete!');
    } else if (job?.status === 'error') {
      toast(job.error || 'Calculation failed');
    }
  }, [job, toast]);

  if (!mounted) return <p className="p-8 text-center text-gray-500">Loading...</p>;
  if (!token) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
        <p className="mb-4 text-gray-600">Please login to access your dashboard.</p>
        <a href="/login" className="text-purple-600 hover:underline">Go to Login</a>
      </div>
    </div>
  );
  if (!user) return <p className="p-8 text-center text-gray-500">Loading user data...</p>;

  const handleNewChart = () => {
    if (confirm('Create a new chart? This will replace the current one.')) {
      setProfileData(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const handleProfileSubmit = (values: StartProfileJobRequest) => {
    startJob(values);
  };

  const tabs = ['Profile'];
  if (user.is_donor) tabs.push('Posts');
  if (user.is_admin) tabs.push('Admin');

  const renderTab = () => {
    switch (tab) {
      case 'Profile':
        if (profileData) {
          return (
            <DashboardComponent
              profileData={profileData}
              onNewChart={handleNewChart}
            />
          );
        }

        return (
          <div className="max-w-4xl mx-auto py-8">
            <Card className="p-6 md:p-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  Discover Your Cosmic Blueprint
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Enter your birth details below to generate your comprehensive Vedic astrology profile,
                  including D1-D60 divisional charts, planetary positions, and predictions.
                </p>
              </div>

              <ProfileForm
                onSubmit={handleProfileSubmit}
                submitting={starting}
                serverError={startError || job?.error}
              />

              {(starting || (job?.status && job.status !== 'complete' && job.status !== 'error')) && (
                <div className="mt-8">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Calculating planetary positions...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      case 'Posts':
        return <BlogList />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center mr-8">
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
              </div>
              <div className="hidden sm:-my-px sm:flex sm:space-x-8">
                {tabs.map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200
                      ${tab === t
                        ? 'border-purple-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Mobile menu could go here, for now using simple tab list above */}
          </div>
        </div>
      </div>

      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderTab()}
        </div>
      </main>
    </div>
  );
}
