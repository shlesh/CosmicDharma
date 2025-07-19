// pages/index.tsx
import LandingPage from '../components/LandingPage';
import PageHead from '../components/PageHead';

export default function HomePage() {
  return (
    <>
      <PageHead
        title="Cosmic Dharma - Vedic Astrology & Spiritual Wisdom"
        description="Discover your cosmic blueprint through authentic Vedic astrology. Get personalized birth charts, daily insights, and spiritual guidance."
        ogTitle="Cosmic Dharma - Your Journey to Self-Discovery"
        ogDescription="Unlock the mysteries of your cosmic blueprint through authentic Vedic astrology"
        ogImage="/og-image.png"
      />
      <LandingPage />
    </>
  );
}
