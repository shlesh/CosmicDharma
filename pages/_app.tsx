import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import ToastProvider from '../components/ToastProvider';
import StarryBackground from '../components/StarryBackground';
import ThemeProvider from '../components/ThemeProvider';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <ThemeProvider>
      <ToastProvider>
        <StarryBackground />
        <Navbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={router.asPath}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...pageProps} />
          </motion.div>
        </AnimatePresence>
      </ToastProvider>
    </ThemeProvider>
  );
}
