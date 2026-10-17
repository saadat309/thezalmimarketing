import { createFileRoute, Link } from '@tanstack/react-router';
import HeroSection from '@/components/home/HeroSection';

export const Route = createFileRoute('/')({
  loader: () => ({
    // This route intentionally uses no API client or production data source.
    categories: [],
    fileMarqueeItems: [],
  }),
  head: () => ({
    meta: [
      { title: 'The Zalmi Marketing | Staging Preview' },
      {
        name: 'description',
        content: 'Synthetic staging preview using the existing Zalmi homepage hero component.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/' }],
  }),
  component: HomePage,
});

function HomePage() {
  const { categories, fileMarqueeItems } = Route.useLoaderData();

  return (
    <>
      <HeroSection categories={categories} items={fileMarqueeItems} />
      <section className="staging-follow-up">
        <p className="staging-eyebrow">NEXT HOMEPAGE SLICE</p>
        <h2>Source components, now on the isolated Start preview.</h2>
        <p>
          The hero above is imported directly from the existing React app. The
          next step is to bring over the lower homepage sections with synthetic
          content and route-by-route verification.
        </p>
        <Link to="/properties">Explore the synthetic route preview</Link>
      </section>
    </>
  );
}
