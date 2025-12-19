// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ToastProvider from '../components/ui/ToastProvider';
import { StarryBackground } from '../components/ui/StarryBackground';
import ThemeProvider from '../components/ui/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Close any open toasts on route change, etc. (Optional)
  }, [router.pathname]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cosmic Dharma</title>
      </Head>
      <ThemeProvider>
        <ToastProvider>
          <StarryBackground />
          <Header />

          <QueryClientProvider client={queryClient}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={router.route}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 pt-24 min-h-screen"
              >
                <Component {...pageProps} />
              </motion.main>
            </AnimatePresence>
          </QueryClientProvider>

          <Footer />
        </ToastProvider>
      </ThemeProvider>
    </>
  );
}