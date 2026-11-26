import { Html, Head, Main, NextScript } from 'next/document';

// Runs before first paint so the page never flashes the wrong theme. Mirrors ThemeProvider:
// a saved choice wins; otherwise follow the operating system.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}var c=document.documentElement.classList;c.remove('light','dark');c.add(t)}catch(e){document.documentElement.classList.add('dark')}})();`;

export default function Document() {
  return (
    <Html lang="en" className="dark" suppressHydrationWarning>
      <Head>
        <meta charSet="utf-8" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <meta name="theme-color" content="#06080f" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#f7f4ed" media="(prefers-color-scheme: light)" />
        <meta name="application-name" content="Cosmic Dharma" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Cosmic Dharma" />
        <meta property="og:site_name" content="Cosmic Dharma" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
