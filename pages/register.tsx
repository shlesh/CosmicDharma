import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { apiFetch } from '../util/api';
import { useToast } from '../components/ui/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  is_donor: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    is_donor: false
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      toast('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<{ access_token: string }>('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          is_donor: form.is_donor
        })
      });

      localStorage.setItem('token', data.access_token);
      toast('Registration successful!');
      router.push('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card variant="cosmic" className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>

            <div className="flex items-center">
              <input
                id="is_donor"
                name="is_donor"
                type="checkbox"
                checked={form.is_donor}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded 
                         focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 
                         focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="is_donor" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                I want to support as a donor (access to premium features)
              </label>
            </div>

            <Button
              type="submit"
              variant="cosmic"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
