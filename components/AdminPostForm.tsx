import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlogTag, PostInput } from '@/util/api';

const Schema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().min(10),
  tag_ids: z.array(z.number()).optional(),
  published: z.boolean().optional(),
});

type FormValues = z.infer<typeof Schema>;

export default function AdminPostForm({ initial, tags, submitting, onSubmit }: {
  initial?: Partial<PostInput>;
  tags: BlogTag[];
  submitting?: boolean;
  onSubmit: (values: PostInput) => void;
}) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { title: '', slug: '', summary: '', content: '', tag_ids: [], published: false, ...(initial || {}) },
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
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <label key={t.id} className="inline-flex items-center gap-2 border rounded px-2 py-1">
              <input type="checkbox" value={t.id} {...register('tag_ids')} />
              <span>{t.name}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" {...register('published')} />
        <span>Published</span>
      </label>
      <div className="flex gap-3">
        <button type="submit" className="bg-indigo-600 text-white rounded px-4 py-2" disabled={submitting}>{submitting? 'Saving…':'Save'}</button>
      </div>
    </form>
  );
}