import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostInput } from '@/util/api';

const Schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().min(10),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});

type FormValues = z.infer<typeof Schema>;

export default function AdminPostForm({ initial, submitting, onSubmit }: {
  initial?: Partial<PostInput>;
  submitting?: boolean;
  onSubmit: (values: PostInput) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '', slug: '', summary: '', content: '', tags: '', published: false, ...(initial || {}) },
  });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v as PostInput))} className="grid gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input className="border rounded p-2 w-full" {...register('title')} />
        {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input className="border rounded p-2 w-full" {...register('slug')} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Summary</label>
        <textarea className="border rounded p-2 w-full" rows={3} {...register('summary')} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
        <textarea className="border rounded p-2 w-full font-mono" rows={12} {...register('content')} />
        {errors.content && <p className="text-red-600 text-sm">{errors.content.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
        <input
          className="border rounded p-2 w-full"
          placeholder="astrology, vedic, spirituality"
          {...register('tags')}
        />
      </div>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" {...register('published')} />
        <span>Published</span>
      </label>
      <div className="flex gap-3">
        <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}