import Link from 'next/link';
import { usePosts, useDeletePost, usePublishToggle } from '@/hooks/useBlog';

export default function AdminPostsPage() {
  const { data, isLoading, error } = usePosts();
  const del = useDeletePost();

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (error) return <p className="p-6 text-red-600">{(error as Error).message}</p>;

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link className="bg-indigo-600 text-white rounded px-3 py-2" href="/admin/posts/new">New Post</Link>
      </div>

      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2">Title</th>
            <th className="p-2">Slug</th>
            <th className="p-2">Published</th>
            <th className="p-2 w-40">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.slug}</td>
              <td className="p-2">{p.published ? 'Yes' : 'No'}</td>
              <td className="p-2 flex gap-2">
                <Link className="underline" href={`/admin/posts/${p.id}`}>Edit</Link>
                <button className="text-red-600" onClick={() => del.mutate(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}