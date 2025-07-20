import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BlogEditor from '../components/blog/BlogEditor';
import { getCurrentUser } from '../util/api';

const EditorPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { edit } = router.query;

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <Head>
        <title>{edit ? 'Edit Post' : 'New Post'} - Cosmic Dharma</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {edit ? 'Edit Post' : 'Create New Post'}
          </h1>
          
          <BlogEditor postId={edit ? parseInt(edit as string) : undefined} />
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
