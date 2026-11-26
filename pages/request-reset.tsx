import { useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import AuthLayout from '@/components/layout/AuthLayout';
import Button, { ButtonLink } from '@/components/ui/Button';
import { Field, Input, FormError } from '@/components/ui/Field';
import { apiFetch } from '@/util/api';

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch('/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout seoTitle="Check your email" title="Check your email" description={`If an account uses ${email}, we’ve sent it a reset code.`}>
        <div className="flex items-start gap-3 rounded-2xl border border-success/25 bg-success/[0.07] p-4 text-sm text-muted">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          The code works for one hour. Enter it on the next page with your new password.
        </div>
        <ButtonLink href="/reset-password" size="lg" className="mt-6 w-full">I have a code</ButtonLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      seoTitle="Reset your password"
      title="Reset your password"
      description="Enter the email you signed up with and we’ll send you a reset code."
      footer={<Link href="/login" className="font-medium text-accent hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Email" id="email">
          {(p) => <Input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}
        </Field>
        <FormError>{error}</FormError>
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!email.includes('@')}>
          Send reset code
        </Button>
      </form>
    </AuthLayout>
  );
}
