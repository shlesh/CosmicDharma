import Seo from '@/components/layout/Seo';
import { ButtonLink } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';

export default function ServerErrorPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <Seo title="Something went wrong" noindex />
      <LogoMark className="h-12 w-12 text-accent/70" />
      <p className="mt-8 font-mono text-sm tracking-widest text-subtle">500</p>
      <h1 className="mt-3 font-display text-display-lg font-semibold">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted">An unexpected error stopped this page from loading. Please try again in a moment.</p>
      <div className="mt-8">
        <ButtonLink href="/">Return home</ButtonLink>
      </div>
    </div>
  );
}
