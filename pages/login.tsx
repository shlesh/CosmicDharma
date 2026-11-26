import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout, { PasswordInput } from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { Field, Input, FormError } from '@/components/ui/Field';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/util/api';

/** Only follow same-site relative paths after sign-in (never an open redirect). */
function safeNext(next: unknown): string {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...form }),
      });
      signIn(data.access_token);
      toast('Welcome back.', 'success');
      router.push(safeNext(router.query?.next));
    } catch (err: any) {
      setError(err?.message || 'Could not sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      seoTitle="Sign in"
      title="Welcome back"
      description="Sign in to see your saved chart and dashboard."
      footer={
        <>
          New to Cosmic Dharma?{' '}
          <Link href="/register" className="font-medium text-accent hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Username" id="username">
          {(p) => <Input {...p} name="username" autoComplete="username" autoCapitalize="none" required value={form.username} onChange={onChange} />}
        </Field>
        <Field label="Password" id="password">
          {(p) => <PasswordInput {...p} name="password" autoComplete="current-password" required value={form.password} onChange={onChange} />}
        </Field>
        <div className="-mt-2 text-right">
          <Link href="/request-reset" className="text-sm text-muted hover:text-accent">Forgot your password?</Link>
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
