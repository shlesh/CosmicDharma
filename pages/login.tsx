import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { apiFetch } from '../util/api';
import { useToast } from '../components/ui/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

interface LoginForm {
  username: string;
  password: string;
}

const fieldClass =
  'w-full px-4 py-3 rounded-xl border border-amber-200/20 bg-black/25 text-amber-50 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...form }),
      });
      localStorage.setItem('token', data.access_token);
      toast('Welcome back.');
      router.push('/dashboard');
    } catch (err: any) {
      toast(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16 page-shell">
      <Head><title>Enter — Cosmic Dharma</title></Head>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-center help-text mb-3">The gate is quiet after dusk.</p>
        <Card variant="cosmic" className="p-8">
          <h2 className="text-3xl font-display text-center mb-6 text-amber-50">Enter</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm mb-2">Username</label>
              <input id="username" name="username" type="text" autoComplete="username" required value={form.username} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-2">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} className={fieldClass} />
            </div>
            <Button type="submit" variant="cosmic" size="lg" loading={loading} disabled={loading} className="w-full">
              {loading ? 'Opening…' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 text-center space-y-2 help-text">
            <p>
              New here?{' '}
              <Link href="/register" className="text-amber-200 hover:text-amber-100">Register</Link>
            </p>
            <p>
              <Link href="/request-reset" className="text-sm text-amber-200/80">Forgot password?</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
