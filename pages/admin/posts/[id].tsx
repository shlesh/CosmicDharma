import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { blogApi, PostInput, BlogPost } from '../../../util/api';
import { useUpdatePost } from '@/hooks/useBlog';
import AdminPostForm from '../../../components/admin/AdminPostForm';

export default function EditPostPage() {
    const router = useRouter();
    const id = Number(router.query.id);
    const [post, setPost] = useState<BlogPost | null>(null);
    const update = useUpdatePost(id);

    useEffect(() => {
        if (!id) return; (async () => setPost(await blogApi.getPostBySlug(String(id))))();
    }, [id]);

    if (!id) return null;
    if (!post) return <p className="p-6">Loading…</p>;

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            <AdminPostForm
                initial={{ title: post.title, slug: post.slug, summary: post.summary || '', content: post.content, tags: post.tags || '', published: post.published }}
                submitting={update.isPending}
                onSubmit={(values: PostInput) => update.mutate(values)}
            />
            {update.error && <p className="text-red-600 mt-2">{(update.error as Error).message}</p>}
        </main>
    );
}
