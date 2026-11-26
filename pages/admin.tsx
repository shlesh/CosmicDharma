import { ShieldAlert } from 'lucide-react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Seo from '@/components/layout/Seo';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { ButtonLink } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function AdminPage() {
  const { token, ready, user, loadingUser } = useAuth();

  let body: React.ReactNode;
  if (!ready || loadingUser) body = <Skeleton className="h-96" />;
  else if (!token || !user?.is_admin)
    body = (
      <Card className="mx-auto max-w-lg">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Admins only"
          description={token ? 'Your account doesn’t have access to the admin tools.' : 'Sign in with an admin account to continue.'}
          action={!token ? <ButtonLink href="/login?next=/admin">Sign in</ButtonLink> : <ButtonLink href="/dashboard" variant="secondary">Go to your dashboard</ButtonLink>}
        />
      </Card>
    );
  else body = <AdminDashboard />;

  return (
    <div className="container py-10 sm:py-14">
      <Seo title="Admin" noindex />
      {body}
    </div>
  );
}
