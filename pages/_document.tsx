import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Cosmic Dharma offers cosmic insights through Vedic astrology."
        />
        <meta name="theme-color" content="#310c4b" />
        <meta property="og:title" content="Cosmic Dharma" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
