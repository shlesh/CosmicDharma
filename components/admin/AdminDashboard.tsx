import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { FileText, Users, HeartHandshake, ShieldCheck, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { fetchJson, apiFetch } from '@/util/api';
import { useToast } from '@/components/ui/ToastProvider';
import Card, { CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button, { ButtonLink } from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate } from '@/util/astro';
import { cn } from '@/util/cn';

interface Post {
  id: number;
  title: string;
  slug?: string;
  published?: boolean;
  featured?: boolean;
  created_at?: string;
}

// Shape of GET /admin/users (UserOut); there is no id, so username is the key.
interface User {
  username: string;
  email: string;
  is_admin: boolean;
  is_donor: boolean;
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  useEffect(() => setMounted(true), []);

  const token = mounted ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const { data: posts, mutate: mutatePosts, error: postsError } = useSWR<Post[]>(
    token ? ['admin/posts', token] : null,
    ([url]: [string]) => fetchJson(url, { headers }),
  );
  const { data: users, mutate: mutateUsers, error: usersError } = useSWR<User[]>(
    token ? ['admin/users', token] : null,
    ([url]: [string]) => fetchJson(url, { headers }),
  );

  useEffect(() => { if (postsError) toast('Could not load posts'); }, [postsError, toast]);
  useEffect(() => { if (usersError) toast('Could not load users'); }, [usersError, toast]);

  const handleDelete = async (post: Post) => {
    if (confirming !== post.id) {
      setConfirming(post.id);
      setTimeout(() => setConfirming((c) => (c === post.id ? null : c)), 4000);
      return;
    }
    setConfirming(null);
    try {
      await apiFetch(`admin/posts/${post.id}`, { method: 'DELETE', headers });
      mutatePosts();
      toast(`Deleted “${post.title}”`, 'success');
    } catch {
      toast('Could not delete the post');
    }
  };

  // Donor status is only ever granted here, never self-selected at registration.
  const handleToggleDonor = async (user: User) => {
    try {
      await apiFetch(`admin/users/${encodeURIComponent(user.username)}/donor`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_donor: !user.is_donor }),
      });
      mutateUsers();
      toast(user.is_donor ? `${user.username} is no longer a donor` : `${user.username} is now a donor`, 'success');
    } catch {
      toast('Could not update donor status');
    }
  };

  if (!mounted) return null;
  if (!token) return <p className="text-muted">Please sign in.</p>;

  const postList = Array.isArray(posts) ? posts : [];
  const userList = Array.isArray(users) ? users : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 className="mt-1 font-display text-display-md font-semibold">Admin Dashboard</h2>
        </div>
        <ButtonLink href="/editor" size="md"><Plus className="h-4 w-4" /> New post</ButtonLink>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={FileText} label="Posts" value={posts ? postList.length : '–'} />
        <Stat icon={Users} label="Users" value={users ? userList.length : '–'} />
        <Stat icon={HeartHandshake} label="Donors" value={users ? userList.filter((u) => u.is_donor).length : '–'} />
        <Stat icon={ShieldCheck} label="Admins" value={users ? userList.filter((u) => u.is_admin).length : '–'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Posts" as="h3" description="Everything in the journal, drafts included." />
          {!posts ? (
            <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : postList.length === 0 ? (
            <EmptyState icon={<FileText className="h-5 w-5" />} title="No posts yet" description="Write the first one." action={<ButtonLink href="/editor" size="sm">Write a post</ButtonLink>} className="py-8" />
          ) : (
            <ul className="divide-y divide-line/[0.07]">
              {postList.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{p.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-subtle">
                      <Badge tone={p.published === false ? 'neutral' : 'success'} className="px-2 py-0">{p.published === false ? 'Draft' : 'Published'}</Badge>
                      {p.featured && <Badge tone="accent" className="px-2 py-0">Featured</Badge>}
                      {p.created_at && formatDate(p.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {p.slug && p.published !== false && (
                      <Link href={`/posts/${p.slug}`} className="rounded-lg p-2 text-subtle hover:bg-line/[0.06] hover:text-fg" aria-label={`View ${p.title}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <Link href={`/editor?edit=${p.id}`} className="rounded-lg p-2 text-subtle hover:bg-line/[0.06] hover:text-fg" aria-label={`Edit ${p.title}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className={cn(
                        'rounded-lg p-2 text-sm transition-colors',
                        confirming === p.id ? 'bg-danger/15 px-3 font-medium text-danger' : 'text-subtle hover:bg-danger/10 hover:text-danger',
                      )}
                      aria-label={confirming === p.id ? `Confirm deleting ${p.title}` : `Delete ${p.title}`}
                    >
                      {confirming === p.id ? 'Confirm' : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Users" as="h3" description="Donor status unlocks donor-only features. Grant it here." />
          {!users ? (
            <div className="space-y-2">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <ul className="divide-y divide-line/[0.07]">
              {userList.map((u) => (
                <li key={u.username} className="flex items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent" aria-hidden="true">
                    {u.username.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium text-fg">
                      {u.username}
                      {u.is_admin && <Badge tone="lunar" className="px-2 py-0">admin</Badge>}
                      {u.is_donor && <Badge tone="accent" className="px-2 py-0">donor</Badge>}
                    </p>
                    <p className="truncate text-xs text-subtle">{u.email}</p>
                  </div>
                  <Button variant={u.is_donor ? 'ghost' : 'secondary'} size="sm" onClick={() => handleToggleDonor(u)}>
                    {u.is_donor ? 'Remove donor' : 'Make donor'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
