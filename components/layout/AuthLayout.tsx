import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import { LogoMark } from '@/components/ui/Logo';
import { Input } from '@/components/ui/Field';

/** Centred card used by sign-in, registration and password reset. */
export default function AuthLayout({
  title,
  description,
  seoTitle,
  footer,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  seoTitle: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="container flex min-h-[calc(100dvh-var(--header-h))] items-center justify-center py-12">
      <Seo title={seoTitle} noindex />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="panel p-6 sm:p-9">
          <Link href="/" aria-label="Cosmic Dharma, home" className="inline-block rounded-lg text-accent">
            <LogoMark className="h-10 w-10" />
          </Link>
          <h1 className="mt-6 font-display text-[2rem] font-semibold leading-tight">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted">{description}</p>}
          <div className="mt-8">{children}</div>
        </div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </motion.div>
    </div>
  );
}

/** Password input with a show/hide toggle. */
export const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Input ref={ref} {...props} type={visible ? 'text' : 'password'} className="pr-12" />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-subtle transition-colors hover:text-fg"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
