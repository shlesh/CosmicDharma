import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Navbar from '../components/Navbar';
import ToastProvider from '../components/ToastProvider';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider>
      <Navbar />
      <Component {...pageProps} />
    </ToastProvider>
  );
}
