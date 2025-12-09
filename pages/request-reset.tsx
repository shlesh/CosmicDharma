import { useState } from 'react';
import { apiFetch } from '../util/api';
import { useToast } from '../components/ui/ToastProvider';

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setDone(true);
    } catch (e) {
      toast('Request failed');
    }
  };

  if (done) return <p>Check your email for a reset token.</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      <input
        name="email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border rounded p-2"
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white">
        Send Reset Link
      </button>
    </form>
  );
}
