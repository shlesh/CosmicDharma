import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi, BlogPost, BlogPostMeta, PostInput, BlogTag } from '@/util/api';

export const usePosts = (params?: { search?: string; tag?: string; published?: boolean }) => {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('q', params.search);
  if (params?.tag) qs.set('tag', params.tag);
  if (typeof params?.published === 'boolean') qs.set('published', String(params.published));
  return useQuery({ queryKey: ['posts', qs.toString()], queryFn: () => blogApi.getPosts(qs.toString()) });
};

export const usePostBySlug = (slug?: string) => useQuery({ queryKey: ['post', slug], enabled: !!slug, queryFn: () => blogApi.getPostBySlug(slug!) });
export const useTags = () => useQuery({ queryKey: ['tags'], queryFn: blogApi.getTags, staleTime: 5 * 60_000 });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => blogApi.createPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const useUpdatePost = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PostInput) => blogApi.updatePost(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] });
      qc.invalidateQueries({ queryKey: ['post'] });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => blogApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};

export const usePublishToggle = (id: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (published: boolean) => (published ? blogApi.publishPost(id) : blogApi.unpublishPost(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['posts'] }),
  });
};