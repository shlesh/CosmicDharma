// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ToastProvider from '../components/ToastProvider';
import StarryBackground from '../components/StarryBackground';
import ThemeProvider from '../components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Add padding to account for fixed header
  useEffect(() => {
    document.body.style.paddingTop = '120px';
    return () => {
      document.body.style.paddingTop = '0';
    };
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen relative">
          <StarryBackground />
          <Header />
          
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={router.asPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <Component {...pageProps} />
            </motion.main>
          </AnimatePresence>
          
          <Footer />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}