import React, { useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';
import { useToast } from '../components/ToastProvider';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(form)
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } else {
      toast('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Login</h2>
      <input
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        className="border rounded p-2"
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="border rounded p-2"
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white">
        Login
      </button>
    </form>
  );
}
