import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import apiFetch from '../util/api';
import { useToast } from '../components/ToastProvider';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

interface LoginForm {
  username: string;
  password: string;
}

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
      const res = await apiFetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(form)
      });
      
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        toast('Login successful!');
        router.push('/dashboard');
      } else {
        const error = await res.json();
        toast(error.detail || 'Login failed');
      }
    } catch (err) {
      toast('Network error. Please try again.');
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
          <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your username"
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
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white dark:bg-gray-900 
                         focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20"
              />
            </div>
            
            <Button
              type="submit"
              variant="cosmic"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-700">
                Sign up
              </Link>
            </p>
            <p>
              <Link href="/request-reset" className="text-sm text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}