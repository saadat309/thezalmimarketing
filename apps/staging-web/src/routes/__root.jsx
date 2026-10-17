import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import './app.css';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Zalmi Marketing — Staging' },
      {
        name: 'description',
        content: 'Isolated synthetic staging environment for Zalmi Marketing.',
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Syne:wght@400..800&display=swap',
      },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFoundPage,
});

function RootDocument() {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        <a className="staging-skip-link" href="#main">Skip to content</a>
        <header className="staging-header">
          <Link to="/" className="staging-brand" aria-label="Zalmi Marketing staging home">
            <span className="staging-brand-mark" aria-hidden="true">Z</span>
            <span>The Zalmi <em>Marketing</em></span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link to="/">Home</Link>
            <Link to="/properties">Properties</Link>
            <Link to="/maps">Maps</Link>
            <Link to="/files">Files</Link>
          </nav>
          <span className="staging-badge">SYNTHETIC PREVIEW</span>
        </header>
        <main id="main"><Outlet /></main>
        <footer className="staging-footer">
          <strong>Zalmi Marketing staging</strong>
          <span>Isolated preview · synthetic sample content only</span>
        </footer>
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundPage() {
  return (
    <section className="staging-not-found">
      <p className="staging-eyebrow">404 · STAGING</p>
      <h1>This route is not available in the preview.</h1>
      <p>No production services or records are connected to this application.</p>
      <Link to="/">Return to staging home</Link>
    </section>
  );
}
