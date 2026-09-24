import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/ThemeProvider';
import Button from '../ui/Button';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Chart', href: '/profile' },
  { name: 'Panchanga', href: '/panchanga' },
  { name: 'Journal', href: '/posts' },
  { name: 'Desk', href: '/dashboard' },
];

const StarIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const SunIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setAuthed(!!token);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? router.pathname === href : router.pathname.startsWith(href);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
    >
      <div className="container">
        <nav className={`glass rounded-2xl px-4 py-3 sm:px-6 ${scrolled ? 'shadow-2xl' : ''}`}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative bg-gradient-to-br from-amber-300/80 to-emerald-700/80 rounded-xl p-2">
                <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-night" />
              </div>
              <span className="text-lg sm:text-xl font-display gradient-text">Cosmic Dharma</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                    isActive(item.href)
                      ? 'bg-amber-200/15 text-amber-100'
                      : 'text-amber-50/70 hover:bg-white/5 hover:text-amber-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-white/5"
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              </motion.button>

              {authed ? (
                <Button variant="glass" size="sm" onClick={handleLogout}>Logout</Button>
              ) : (
                <Link href="/login">
                  <Button variant="cosmic" size="sm">Enter</Button>
                </Link>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="block w-5 h-px bg-current mb-1" />
                <span className="block w-5 h-px bg-current mb-1" />
                <span className="block w-5 h-px bg-current" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-3 pt-3 border-t border-amber-200/10 overflow-hidden"
              >
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl ${
                      isActive(item.href) ? 'bg-amber-200/15 text-amber-100' : 'text-amber-50/80'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </motion.header>
  );
}
