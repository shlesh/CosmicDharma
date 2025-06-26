// Hero landing section with login and scroll options

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="mb-10 text-center py-20 bg-gradient-to-b from-purple-600 to-blue-600 text-white">
      <h1 className="text-4xl font-bold mb-4">Cosmic Dharma</h1>
      <p className="mb-6">Delve into Vedic astrology and discover new insights.</p>
      <div className="flex justify-center gap-4">
        <Link href="/login" className="rounded bg-white px-4 py-2 text-blue-600">Login</Link>
        <a href="#about" className="rounded bg-white px-4 py-2 text-blue-600">Scroll to Read</a>
      </div>
    </section>
  );
}
