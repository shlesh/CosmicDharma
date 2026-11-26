import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout, { PasswordInput } from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { Field, Input, FormError } from '@/components/ui/Field';
import { useToast } from '@/components/ui/ToastProvider';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/util/api';

const MIN_PASSWORD = 8;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password`);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<{ access_token: string }>('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      });
      signIn(data.access_token);
      toast('Your account is ready.', 'success');
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || 'Could not create the account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      seoTitle="Create an account"
      title="Create your account"
      description="Free. Keep your chart and come back to it on any visit."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Username" id="username">
          {(p) => <Input {...p} name="username" autoComplete="username" autoCapitalize="none" required value={form.username} onChange={onChange} />}
        </Field>
        <Field label="Email" id="email" hint="Only used to reset your password.">
          {(p) => <Input {...p} name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange} />}
        </Field>
        <Field label="Password" id="password" hint={`At least ${MIN_PASSWORD} characters.`}>
          {(p) => <PasswordInput {...p} name="password" autoComplete="new-password" required value={form.password} onChange={onChange} />}
        </Field>
        <Field label="Confirm Password" id="confirmPassword">
          {(p) => <PasswordInput {...p} name="confirmPassword" autoComplete="new-password" required value={form.confirmPassword} onChange={onChange} />}
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
