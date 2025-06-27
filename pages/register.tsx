import React, { useState } from 'react';
import { useRouter } from 'next/router';
import apiFetch from '../util/api';
import { useToast } from '../components/ToastProvider';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<RegisterForm>({ username: '', email: '', password: '' });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      router.push('/posts');
    } else {
      toast('Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold">Register</h2>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        autoComplete="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
        className="border rounded p-2"
      />
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border rounded p-2"
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
        className="border rounded p-2"
      />
      <button type="submit" className="rounded bg-blue-600 p-2 text-white">
        Register
      </button>
    </form>
  );
}
