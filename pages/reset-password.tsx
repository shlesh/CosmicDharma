import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout, { PasswordInput } from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import { Field, Input, FormError } from '@/components/ui/Field';
import { useToast } from '@/components/ui/ToastProvider';
import { apiFetch } from '@/util/api';

const MIN_PASSWORD = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ token: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A link like /reset-password?token=... fills the code in.
  useEffect(() => {
    const t = router.query?.token;
    if (typeof t === 'string') setForm((f) => ({ ...f, token: t }));
  }, [router.query?.token]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.new_password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters for your password`);
      return;
    }
    setLoading(true);
    try {
      await apiFetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: form.token.trim(), new_password: form.new_password }),
      });
      toast('Password updated. Sign in with your new password.', 'success');
      router.push('/login');
    } catch (err: any) {
      setError(err?.message || 'That code is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      seoTitle="Choose a new password"
      title="Choose a new password"
      description="Enter the code from your email and a new password."
      footer={<Link href="/request-reset" className="font-medium text-accent hover:underline">Send a new code</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Reset code" id="token">
          {(p) => (
            <Input {...p} name="token" autoComplete="one-time-code" autoCapitalize="none" spellCheck={false} required value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })} />
          )}
        </Field>
        <Field label="New password" id="new_password" hint={`At least ${MIN_PASSWORD} characters.`}>
          {(p) => (
            <PasswordInput {...p} name="new_password" autoComplete="new-password" required value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
          )}
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" className="w-full" loading={loading}>Update password</Button>
      </form>
    </AuthLayout>
  );
}
