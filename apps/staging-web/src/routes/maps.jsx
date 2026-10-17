import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/maps')({
  head: () => ({ meta: [{ title: 'Maps | Zalmi Marketing staging' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: () => <StagingRoute title="Synthetic map content is deferred." />,
});

function StagingRoute({ title }) {
  return <section className="staging-not-found"><p className="staging-eyebrow">STAGING PREVIEW</p><h1>{title}</h1><p>No production maps or documents are connected.</p><Link to="/">Return to staging home</Link></section>;
}
