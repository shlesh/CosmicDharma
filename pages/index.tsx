import LandingPage from '../components/LandingPage';
import PageHead from '../components/PageHead';

export default function HomePage() {
  return (
    <>
      <PageHead
        title="Cosmic Dharma"
        description="Explore Vedic astrology insights and our latest posts."
        ogTitle="Cosmic Dharma"
        ogDescription="Discover Vedic astrology and read the Cosmic Dharma blog."
      />
      <main className="page-wrapper">
        <LandingPage />
        <section id="about" className="mt-10">
          <h2>About Cosmic Dharma</h2>
          <p>Read our latest posts and learn about Vedic astrology.</p>
        </section>
      </main>
    </>
  );
}
