import Seo from '@/components/layout/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';

export default function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Page not found" noindex />
      <LogoMark className="h-12 w-12 text-accent/70" />
      <p className="mt-8 font-mono text-sm tracking-widest text-subtle">404</p>
      <h1 className="mt-3 font-display text-display-lg font-semibold">This page is empty</h1>
      <p className="mt-4 max-w-md text-muted">The link may be broken, or the page may have moved.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Return home</ButtonLink>
        <ButtonLink href="/profile" variant="secondary">Cast a birth chart</ButtonLink>
      </div>
    </div>
  );
}
