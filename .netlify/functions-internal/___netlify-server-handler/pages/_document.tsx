import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Cosmic Dharma — Vedic charts in the Yukteswar Revati frame, under an open night sky."
        />
        <meta name="theme-color" content="#05080d" />
        <meta property="og:title" content="Cosmic Dharma" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
