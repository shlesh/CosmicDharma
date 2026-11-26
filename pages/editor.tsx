import { useRouter } from 'next/router';
import { ShieldAlert } from 'lucide-react';
import Seo from '@/components/layout/Seo';
import BlogEditor from '@/components/blog/BlogEditor';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function EditorPage() {
  const router = useRouter();
  const { token, ready, user, loadingUser } = useAuth();
  const edit = router.query.edit;
  const postId = typeof edit === 'string' && /^\d+$/.test(edit) ? Number(edit) : undefined;

  let body: React.ReactNode;
  if (!ready || loadingUser) body = <Skeleton className="h-[560px]" />;
  // Mirrors the API: only admins can write posts (POST /posts returns 403 otherwise).
  else if (!token || !user?.is_admin)
    body = (
      <Card className="mx-auto max-w-lg">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Only admins can write posts"
          description={token ? 'Your account doesn’t have editor access.' : 'Sign in with an admin account to write.'}
          action={!token ? <ButtonLink href="/login?next=/editor">Sign in</ButtonLink> : <ButtonLink href="/posts" variant="secondary">Read the journal</ButtonLink>}
        />
      </Card>
    );
  else body = <BlogEditor postId={postId} />;

  return (
    <div className="container py-10 sm:py-14">
      <Seo title={postId ? 'Edit post' : 'New post'} noindex />
      <p className="eyebrow">Journal</p>
      <h1 className="mb-8 mt-2 font-display text-display-md font-semibold">{postId ? 'Edit post' : 'New post'}</h1>
      {body}
    </div>
  );
}
