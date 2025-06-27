import React from 'react';

export default function ProfileSkeleton() {
  return (
    <section data-testid="profile-skeleton">
      <div className="glass-card mb-6 animate-pulse h-24" />
      <div className="glass-card mb-6 animate-pulse h-16" />
      <div className="glass-card mb-6 animate-pulse h-16" />
      <div className="glass-card mb-6 animate-pulse h-32" />
      <div className="glass-card mb-6 animate-pulse h-32" />
      <div className="glass-card mb-6 animate-pulse h-24" />
      <div className="glass-card mb-6 animate-pulse h-40 flex justify-center items-center">
        <div className="h-8 w-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    </section>
  );
}
