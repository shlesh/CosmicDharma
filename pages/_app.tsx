import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import ToastProvider from '../components/ToastProvider';
import StarryBackground from '../components/StarryBackground';
import ThemeProvider from '../components/ThemeProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <StarryBackground />
        <Navbar />
        <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}
