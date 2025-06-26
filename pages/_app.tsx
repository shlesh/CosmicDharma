import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import ToastProvider from '../components/ToastProvider';
import StarryBackground from '../components/StarryBackground';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <StarryBackground />
      <Navbar />
      <Component {...pageProps} />
    </ToastProvider>
  );
}
