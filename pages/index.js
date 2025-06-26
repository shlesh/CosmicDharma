import LandingPage from '../components/LandingPage';

export default function HomePage() {
  return (
    <main className="page-wrapper">
      <LandingPage />
      <section id="about" className="mt-10">
        <h2>About Cosmic Dharma</h2>
        <p>Read our latest posts and learn about Vedic astrology.</p>
      </section>
    </main>
  );
}
