import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/files')({
  head: () => ({ meta: [{ title: 'Files | Zalmi Marketing staging' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: () => <section className="staging-not-found"><p className="staging-eyebrow">STAGING PREVIEW</p><h1>Synthetic file content is deferred.</h1><p>No production maps or documents are connected.</p><Link to="/">Return to staging home</Link></section>,
});
