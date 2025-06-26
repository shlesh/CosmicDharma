import { useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ token: '', new_password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      router.push('/login');
    } else {
      alert('Reset failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Set New Password</h2>
      <input
        name="token"
        value={form.token}
        onChange={handleChange}
        placeholder="Token"
        className="border rounded p-2"
      />
      <input
        name="new_password"
        type="password"
        value={form.new_password}
        onChange={handleChange}
        placeholder="New Password"
        className="border rounded p-2"
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white">
        Reset Password
      </button>
    </form>
  );
}
