import AdminPostForm from '../../../components/admin/AdminPostForm';
import { useCreatePost, useTags } from '@/hooks/useBlog';

export default function NewPostPage() {
    const create = useCreatePost();
    const { data: tags } = useTags();

    return (
        <main className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">New Post</h1>
            <AdminPostForm
                tags={tags || []}
                submitting={create.isPending}
                onSubmit={(values) => create.mutate(values)}
            />
            {create.error && <p className="text-red-600 mt-2">{(create.error as Error).message}</p>}
        </main>
    );
}
