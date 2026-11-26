import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE = 'https://cosmicdharma.app';
const DEFAULT_TITLE = 'Cosmic Dharma · Vedic astrology, precisely calculated';
const DEFAULT_DESCRIPTION =
  'Free Vedic birth charts, Vimshottari dasha, divisional charts and a daily panchanga, calculated in Sri Yukteswar’s sidereal frame and verified against NASA JPL ephemerides.';

/** Page metadata. Render it once per page; _app renders a default that pages override. */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  noindex = false,
}: {
  title?: string;
  description?: string;
  noindex?: boolean;
}) {
  const { asPath } = useRouter() ?? { asPath: '/' };
  const fullTitle = title ? `${title} · Cosmic Dharma` : DEFAULT_TITLE;
  const url = `${SITE}${(asPath || '/').split(/[?#]/)[0]}`;

  return (
    <Head>
      <title key="title">{fullTitle}</title>
      <meta key="description" name="description" content={description} />
      <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <link key="canonical" rel="canonical" href={url} />
      <meta key="og:title" property="og:title" content={fullTitle} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:url" property="og:url" content={url} />
      {noindex && <meta key="robots" name="robots" content="noindex" />}
    </Head>
  );
}
