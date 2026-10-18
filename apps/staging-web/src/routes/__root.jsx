import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouterState,
} from '@tanstack/react-router';
import { ExternalLink, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import StagingNavbar from '../components/StagingNavbar.jsx';
import footerContent from '@/content/components/footer.json';
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
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isAdminPage = pathname === '/login' || pathname.startsWith('/dashboard')
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>
        <a className="staging-skip-link" href="#main">Skip to content</a>
        {!isAdminPage && <StagingNavbar />}
        {!isAdminPage && <div className="staging-preview-banner" role="status">Staging preview · synthetic sample content · no inquiries are sent</div>}
        <div id="main"><Outlet /></div>
        {!isAdminPage && <StagingFooter />}
        <Scripts />
      </body>
    </html>
  );
}

function StagingFooter() {
  return (
    <footer className="staging-footer-site bg-grid-pattern">
      <div className="staging-footer-glow" aria-hidden="true" />
      <div className="staging-footer-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-9">
          <section className="space-y-6 lg:col-span-4">
            <Link to="/" className="inline-block" aria-label="Return to staging home"><img className="staging-footer-logo" src="/Zalmi Marketing Logo White.webp" alt="The Zalmi Marketing" /></Link>
            <p className="max-w-sm text-sm leading-relaxed text-slate-300 sm:text-base">{footerContent.brandDescription}</p>
            <p lang="ur" dir="rtl" className="staging-footer-motto">{footerContent.brandMotto}</p>
            <nav aria-label="Social links" className="flex flex-wrap gap-2.5">
              <SocialLink href="https://www.facebook.com/share/182ygLHmct/" label="Facebook" />
              <SocialLink href="https://www.tiktok.com/@thezalmimarketingdha?_r=1&_t=ZS-922kJzik3lf" label="TikTok" />
              <SocialLink href="https://youtube.com/@thezalmimarketing?si=vDrnNAQ9pl9y1DU_" label="YouTube" />
              <SocialLink href="https://wa.me/923218446496" label="WhatsApp" />
            </nav>
          </section>

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-3 lg:col-span-8">
            <section>
              <FooterHeading>{footerContent.quickLinksHeading}</FooterHeading>
              <nav aria-label="Footer navigation"><ul className="space-y-2.5 text-sm">
                <FooterLink to="/">Home</FooterLink><FooterLink to="/about">About Us</FooterLink><FooterLink to="/properties">Properties</FooterLink><FooterLink to="/maps">Maps Directory</FooterLink><FooterLink to="/files">Plot Files</FooterLink><FooterLink to="/calculator">Calculator</FooterLink><FooterLink to="/contact">Contact Us</FooterLink><FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              </ul></nav>
            </section>

            <section>
              <FooterHeading>{footerContent.headquartersHeading}</FooterHeading>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" /><a href="https://maps.app.goo.gl/XdCCsuZ3zNnswVko6?g_st=aw" target="_blank" rel="noreferrer" className="leading-relaxed text-slate-300 transition hover:text-[#D4AF37]">{footerContent.headquartersAddress}<ExternalLink aria-hidden="true" className="ml-1 inline h-3.5 w-3.5" /></a></li>
                <li className="flex items-center gap-3"><Phone aria-hidden="true" className="h-5 w-5 shrink-0 text-[#D4AF37]" /><a href="tel:+923218446496" className="text-slate-300 transition hover:text-[#D4AF37]">{footerContent.phone}</a></li>
                <li className="flex items-start gap-3"><Mail aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]" /><a href={`mailto:${footerContent.email}`} className="break-all text-xs text-slate-300 transition hover:text-[#D4AF37]">{footerContent.email}</a></li>
              </ul>
            </section>

            <section>
              <FooterHeading>{footerContent.marketIntelligence.heading}</FooterHeading>
              <p className="text-sm leading-relaxed text-slate-300">{footerContent.marketIntelligence.description}</p>
              <form className="mt-4 space-y-3" aria-describedby="staging-newsletter-note" onSubmit={(event) => event.preventDefault()}>
                <label className="sr-only" htmlFor="staging-newsletter-email">{footerContent.marketIntelligence.placeholder}</label>
                <input id="staging-newsletter-email" type="email" disabled placeholder={footerContent.marketIntelligence.placeholder} className="staging-newsletter-input" />
                <button type="submit" disabled className="staging-newsletter-button">Subscription unavailable in staging</button>
              </form>
              <p id="staging-newsletter-note" className="mt-3 text-xs leading-relaxed text-slate-400">Email subscriptions are disabled here. Nothing is collected or sent.</p>
            </section>
          </div>
        </div>

        <div className="staging-footer-divider" />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} {footerContent.copyright}</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-medium text-[#f3e5ab]"><span className="h-2 w-2 rounded-full bg-emerald-500" />{footerContent.verifiedBadge}</span>
        </div>
        <p className="mt-5 text-xs text-slate-400">Staging preview · synthetic content only · forms and subscriptions are not connected.</p>
      </div>
    </footer>
  );
}

function FooterHeading({ children }) {
  return <><h2 className="font-display text-sm font-bold uppercase tracking-widest text-[#D4AF37]">{children}</h2><div className="mb-4 mt-2 h-0.5 w-12 bg-[#D4AF37]/40" /></>;
}

function FooterLink({ to, children }) {
  return <li><Link to={to} className="text-slate-300 transition-colors hover:text-[#D4AF37]">{children}</Link></li>;
}

function SocialLink({ href, label }) {
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/30 px-3.5 text-xs font-semibold text-slate-200 transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]">{label}</a>;
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
