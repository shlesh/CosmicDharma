import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { MotionConfig, motion } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Seo from '@/components/layout/Seo';
import ToastProvider from '@/components/ui/ToastProvider';
import StarryBackground from '@/components/ui/StarryBackground';
import ThemeProvider from '@/components/ui/ThemeProvider';
import { AuthProvider } from '@/hooks/useAuth';

// Self-hosted at build time by next/font: no request to Google at runtime, no layout shift.
const sans = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const display = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000, retry: 1 } },
      }),
  );

  return (
    <>
      {/* The font variables live on :root so portals and toasts get them too. */}
      <style jsx global>{`
        :root {
          --font-sans: ${sans.style.fontFamily};
          --font-display: ${display.style.fontFamily};
        }
      `}</style>
      <Seo />
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ToastProvider>
                <a
                  href="#main"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-fg"
                >
                  Skip to content
                </a>
                <StarryBackground />
                <div className="relative z-10 flex min-h-dvh flex-col">
                  <Header />
                  <motion.main
                    id="main"
                    key={router.asPath.split('?')[0]}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 pt-[var(--header-h)]"
                  >
                    <Component {...pageProps} />
                  </motion.main>
                  <Footer />
                </div>
              </ToastProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </MotionConfig>
    </>
  );
}
