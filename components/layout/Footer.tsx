import Link from 'next/link';
import Logo from '@/components/ui/Logo';

const COLUMNS = [
  {
    title: 'Tools',
    links: [
      { name: 'Birth chart', href: '/profile' },
      { name: 'Daily panchanga', href: '/panchanga' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { name: 'Journal', href: '/posts' },
      { name: 'About & method', href: '/about' },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Sign in', href: '/login' },
      { name: 'Create an account', href: '/register' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
  },
];

export default function Footer() {
  return (
    <footer data-site-footer className="relative mt-24 border-t border-line/10 bg-canvas/40 backdrop-blur-sm">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 max-w-xs md:col-span-1">
            <Link href="/" aria-label="Cosmic Dharma, home" className="inline-block rounded-lg">
              <Logo />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Vedic astrology in Sri Yukteswar’s sidereal frame, calculated with the Swiss Ephemeris and checked
              against NASA JPL.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-subtle">{col.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-fg">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-line/10 pt-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cosmic Dharma</p>
          <p>For reflection and study. Not a substitute for medical, legal or financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
