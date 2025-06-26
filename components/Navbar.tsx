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

  return (
    <nav className="glass-card p-4 mb-4">
      <ul className="flex gap-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/posts">Posts</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li>
          {authed ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
