// Hero landing section with login and scroll options

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="mb-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Cosmic Dharma</h1>
      <p className="mb-6">Delve into Vedic astrology and discover new insights.</p>
      <div className="flex justify-center gap-4">
        <Link href="/login" className="glass-button">Login</Link>
        <a href="#about" className="glass-button">Scroll to Read</a>
      </div>
    </section>
  );
}
