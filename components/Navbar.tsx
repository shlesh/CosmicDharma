import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navbar() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    setAuthed(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/' ? router.pathname === href : router.pathname.startsWith(href);

  return (
    <nav className="glass-card p-4 mb-4">
      <ul className="flex gap-4">
        <li>
          <Link
            href="/"
            className={isActive('/') ? 'font-semibold text-blue-600' : undefined}
            aria-current={isActive('/') ? 'page' : undefined}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/posts"
            className={isActive('/posts') ? 'font-semibold text-blue-600' : undefined}
            aria-current={isActive('/posts') ? 'page' : undefined}
          >
            Posts
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard"
            className={isActive('/dashboard') ? 'font-semibold text-blue-600' : undefined}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            Dashboard
          </Link>
        </li>
        <li>
          {authed ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link
              href="/login"
              className={isActive('/login') ? 'font-semibold text-blue-600' : undefined}
              aria-current={isActive('/login') ? 'page' : undefined}
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
