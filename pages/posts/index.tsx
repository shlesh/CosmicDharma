import Seo from '@/components/layout/Seo';
import SectionHeading from '@/components/ui/SectionHeading';
import BlogList from '@/components/blog/BlogList';

export default function JournalPage() {
  return (
    <div className="container py-10 sm:py-14">
      <Seo title="Journal" description="Essays on Vedic astrology, the yugas and Sri Yukteswar’s Holy Science." />
      <SectionHeading
        as="h1"
        eyebrow="Journal"
        title="Notes on Jyotisha"
        description="Essays on reading charts, the yugas, and the astronomy behind the calendar."
      />
      <div className="mt-10">
        <BlogList showPagination />
      </div>
    </div>
  );
}
