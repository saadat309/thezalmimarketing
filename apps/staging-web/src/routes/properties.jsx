import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/properties')({
  head: () => ({
    meta: [
      { title: 'Sample properties | Zalmi Marketing staging' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  return (
    <section className="staging-not-found">
      <p className="staging-eyebrow">SYNTHETIC INVENTORY</p>
      <h1>Sample property pages are the next slice.</h1>
      <p>This homepage pilot has not imported listing data or media.</p>
      <Link to="/">Return to staging home</Link>
    </section>
  );
}
