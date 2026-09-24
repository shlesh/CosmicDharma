import React from 'react';
import Link from 'next/link';

const columns = {
  Paths: [
    { name: 'Birth chart', href: '/profile' },
    { name: 'Daily panchanga', href: '/panchanga' },
    { name: 'Journal', href: '/posts' },
    { name: 'Desk', href: '/dashboard' },
  ],
  Gate: [
    { name: 'Enter', href: '/login' },
    { name: 'Register', href: '/register' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-amber-200/10 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <Link href="/" className="font-display text-2xl gradient-text">Cosmic Dharma</Link>
            <p className="help-text mt-4 max-w-sm">
              A working Vedic desk under an open sky. Yukteswar / Revati ayanamsa.
              The forest line is only a reminder: calculate, then sit.
            </p>
          </div>
          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-amber-100 mb-3 text-lg">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="help-text hover:text-amber-100 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-amber-200/10 flex flex-col md:flex-row md:justify-between gap-3">
          <p className="text-sm text-amber-50/50">
            © {new Date().getFullYear()} Cosmic Dharma. A chart is a portrait, not a sentence.
          </p>
          <p className="text-sm text-amber-50/50 italic">
            Will can outwit the stars.
          </p>
        </div>
      </div>
    </footer>
  );
}
