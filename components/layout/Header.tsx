import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut, ChevronDown, PenLine } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';
import Logo from '@/components/ui/Logo';
import { ButtonLink, buttonClass } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/util/cn';

export const NAV = [
  { name: 'Birth chart', href: '/profile' },
  { name: 'Panchanga', href: '/panchanga' },
  { name: 'Journal', href: '/posts' },
  { name: 'About', href: '/about' },
];

function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(buttonClass('ghost', 'icon'), 'overflow-hidden', className)}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const initial = (user?.username || '·').slice(0, 1).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-line/15 bg-surface-2/60 py-1 pl-1 pr-2.5 text-sm text-fg transition-colors hover:border-line/30"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent">{initial}</span>
        <ChevronDown className={cn('h-4 w-4 text-subtle transition-transform', open && 'rotate-180')} />
        <span className="sr-only">Account menu</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-line/10 bg-surface/95 p-1.5 shadow-lift backdrop-blur-xl"
          >
            {user && (
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-fg">{user.username}</p>
                <p className="truncate text-xs text-subtle">{user.email}</p>
              </div>
            )}
            <Link role="menuitem" href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg hover:bg-line/[0.06]">
              <LayoutDashboard className="h-4 w-4 text-subtle" /> Dashboard
            </Link>
            {user?.is_admin && (
              <Link role="menuitem" href="/editor" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-fg hover:bg-line/[0.06]">
                <PenLine className="h-4 w-4 text-subtle" /> Write a post
              </Link>
            )}
            <button
              role="menuitem"
              type="button"
              onClick={() => { setOpen(false); signOut(); router.push('/'); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-fg hover:bg-line/[0.06]"
            >
              <LogOut className="h-4 w-4 text-subtle" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const router = useRouter();
  const { token, ready, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = ready && !!token;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu on navigation and on Escape; lock page scroll while it's open.
  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events?.on('routeChangeStart', close);
    return () => router.events?.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [menuOpen]);

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(`${href}/`);

  return (
    <>
    <header
      data-site-header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-[var(--header-h)] transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || menuOpen ? 'border-b border-line/10 bg-canvas/75 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="container flex h-full items-center justify-between gap-4">
        <Link href="/" className="-m-1 rounded-lg p-1" aria-label="Cosmic Dharma, home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center md:flex">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      active ? 'text-fg' : 'text-muted hover:text-fg',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-full bg-line/[0.07]"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span className="relative">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <AccountMenu />
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink>
                <ButtonLink href="/profile" size="sm">Get your chart</ButtonLink>
              </>
            )}
          </div>
          <button
            type="button"
            className={cn(buttonClass('ghost', 'icon'), 'md:hidden')}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>

    {/* Outside <header>: its backdrop-filter would make it the containing block for this fixed overlay. */}
    <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            data-site-header
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-canvas/95 backdrop-blur-2xl md:hidden"
          >
            <nav aria-label="Mobile" className="container flex min-h-full flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-6">
              <ul className="space-y-1">
                {[{ name: 'Home', href: '/' }, ...NAV, ...(signedIn ? [{ name: 'Dashboard', href: '/dashboard' }] : [])].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={router.pathname === item.href ? 'page' : undefined}
                      className={cn(
                        'flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-[1.9rem] font-semibold leading-none transition-colors',
                        router.pathname === item.href ? 'text-accent' : 'text-fg hover:bg-line/[0.05]',
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto grid gap-3 pt-10">
                {signedIn ? (
                  <button
                    type="button"
                    onClick={() => { signOut(); setMenuOpen(false); router.push('/'); }}
                    className={buttonClass('secondary', 'lg', 'w-full')}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                ) : (
                  <>
                    <ButtonLink href="/profile" size="lg" className="w-full">Get your birth chart</ButtonLink>
                    <ButtonLink href="/login" variant="secondary" size="lg" className="w-full">Sign in</ButtonLink>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
