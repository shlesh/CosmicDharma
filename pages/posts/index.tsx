import PostList from '../../components/PostList';
import PageHead from '../../components/PageHead';

export default function PostListPage() {
  return (
    <>
      <PageHead
        title="Cosmic Dharma Blog"
        description="Browse recent articles from Cosmic Dharma."
        ogTitle="Cosmic Dharma Blog"
        ogDescription="Latest articles on Vedic astrology."
      />
      <div>
        <PostList />
      </div>
    </>
  );
}
