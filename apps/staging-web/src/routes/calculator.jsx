import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/calculator')({
  head: () => ({ meta: [{ title: 'Calculator | Zalmi Marketing staging' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: () => <section className="staging-not-found"><p className="staging-eyebrow">STAGING PREVIEW</p><h1>The calculator is not connected in this task.</h1><p>Calculator configuration and dynamic behavior will be handled separately. No production API is called.</p><Link to="/">Return to staging home</Link></section>,
});
