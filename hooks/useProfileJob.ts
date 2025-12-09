import { useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { profileApi, StartProfileJobRequest, JobStatusResponse } from '@/util/api';

export function useProfileJob() {
  const jobIdRef = useRef<string | null>(null);
  const jobStartRef = useRef<number>(0);

  const start = useMutation({
    mutationFn: (payload: StartProfileJobRequest) => profileApi.startJob(payload),
    onSuccess: (data) => {
      jobIdRef.current = data.job_id;
      jobStartRef.current = Date.now();
    },
  });

  const polling = useQuery<JobStatusResponse | null>({
    queryKey: ['job-status', jobIdRef.current],
    queryFn: async () => {
      if (!jobIdRef.current) return null;
      return profileApi.jobStatus(jobIdRef.current);
    },
    enabled: !!jobIdRef.current,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status || status === 'queued' || status === 'pending' || status === 'running') return 1000;
      return false; // stop on complete/error
    },
  });

  const progress = useMemo(() => {
    if (!jobIdRef.current || !jobStartRef.current) return 0;
    const elapsed = Date.now() - jobStartRef.current;
    // optimistic progress capped until server marks complete
    return Math.min(95, (elapsed / 10_000) * 100); // ~10s to 95%
  }, [polling.data?.status]);

  useEffect(() => {
    if (polling.data?.status === 'complete' || polling.data?.status === 'error') {
      jobIdRef.current = null;
    }
  }, [polling.data?.status]);

  return {
    startJob: start.mutate,
    starting: start.isPending,
    startError: (start.error as Error)?.message,
    job: polling.data ?? null,
    progress,
  };
}