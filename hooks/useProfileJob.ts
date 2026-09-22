import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { profileApi, StartProfileJobRequest, JobStatusResponse } from '@/util/api';

export function useProfileJob() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number>(0);

  const start = useMutation({
    mutationFn: (payload: StartProfileJobRequest) => profileApi.startJob(payload),
    onSuccess: (data) => {
      setJobId(data.job_id);
      setStartedAt(Date.now());
    },
  });

  const polling = useQuery<JobStatusResponse | null>({
    queryKey: ['job-status', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return profileApi.jobStatus(jobId);
    },
    enabled: !!jobId,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status || status === 'queued' || status === 'pending' || status === 'running') return 1000;
      return false;
    },
  });

  const progress = useMemo(() => {
    const status = polling.data?.status;
    if (status === 'complete') return 100;
    if (!jobId || !startedAt) return 0;
    const elapsed = Date.now() - startedAt;
    return Math.min(95, (elapsed / 10_000) * 100);
  }, [polling.data?.status, jobId, startedAt]);

  return {
    startJob: start.mutate,
    starting: start.isPending,
    startError: (start.error as Error)?.message,
    job: polling.data ?? null,
    progress,
  };
}
