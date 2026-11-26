import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="page-shell flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
      <p className="text-amber-200/70 text-sm tracking-[0.3em] uppercase">Lost on the path</p>
      <h1 className="font-display text-amber-50">This clearing is empty</h1>
      <p className="help-text max-w-md">The page is not here. Walk back to the fire.</p>
      <Link href="/" className="text-amber-200 underline underline-offset-4">
        Return home
      </Link>
    </main>
  );
}
