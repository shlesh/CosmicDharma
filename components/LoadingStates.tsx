import { motion } from 'framer-motion';
import { cn } from '@/util/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-800',
        variants[variant],
        animations[animation],
        className
      )}
      style={{ width, height }}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-4">
        <Skeleton variant="text" width="60%" height={32} />
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="75%" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6">
            <Skeleton variant="text" width="40%" height={24} className="mb-4" />
            <Skeleton variant="rectangular" height={200} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogPostSkeleton() {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-xl p-6 space-y-4">
      <Skeleton variant="text" width="80%" height={36} />
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="space-y-2">
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={100} height={14} />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="85%" />
      </div>
    </article>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6">
            <Skeleton variant="text" width="60%" height={20} className="mb-2" />
            <Skeleton variant="text" width="40%" height={32} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
        <Skeleton variant="text" width="30%" height={24} className="mb-4" />
        <Skeleton variant="rectangular" height={300} />
      </div>
    </div>
  );
}

export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={cn('relative', sizes[size], className)}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
      <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-transparent rounded-full" />
    </motion.div>
  );
}