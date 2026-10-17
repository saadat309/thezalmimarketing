import { useEffect, useState } from 'react';
import { findProperty, listCategories, listFiles, listMaps, listProperties } from './data/repository.js';
import { setPageMetadata } from './lib/seo.js';

const navItems = [
  ['Home', '/'], ['Properties', '/properties/'], ['Maps', '/maps/'], ['Files', '/files/'], ['Calculator', '/calculator/'],
];

function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function AppLink({ href, children, className = '' }) {
  return <a className={className} href={href} onClick={(event) => { event.preventDefault(); navigate(href); }}>{children}</a>;
}

function Layout({ children }) {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className={`site-header ${window.location.pathname === '/' ? 'site-header-home' : ''}`}><AppLink className="brand" href="/"><span className="brand-mark">Z</span><span>The Zalmi <em>Marketing</em></span></AppLink><nav aria-label="Primary navigation">{navItems.map(([label, href]) => <AppLink key={href} href={href}>{label}</AppLink>)}</nav><span className="staging-pill">STAGING</span></header>
    <main id="main">{children}</main>
    <footer><strong>Zalmi Staging</strong><span>Synthetic public migration environment. No production listings, media, or services.</span></footer>
  </>;
}

function PageMeta({ title, description, canonicalPath, robots }) {
  useEffect(() => setPageMetadata({ title, description, canonicalPath, robots }), [title, description, canonicalPath, robots]);
  return null;
}

function PropertyCard({ property }) {
  return <article className="property-card"><div className="property-art" aria-hidden="true"><span>{property.category}</span></div><div className="card-copy"><small>{property.tag}</small><h2><AppLink href={`/properties/${property.slug}/`}>{property.title}</AppLink></h2><p>{property.location}</p><div className="property-facts"><b>{property.price}</b><span>{property.size}</span>{property.beds ? <span>{property.beds} beds</span> : null}</div></div></article>;
}

function Home() {
  const featured = listProperties().slice(0, 3);
  const [activeSearch, setActiveSearch] = useState('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const [headlineState, setHeadlineState] = useState({ current: 0, previous: null });
  const [rotationPaused, setRotationPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const headlineWords = ['Dream Property', 'Luxury Villa', 'Prime Plot File', 'Commercial Plaza', 'Modern Penthouse', 'DHA Estate', 'Elite Residence'];
  const searchRoutes = { properties: '/properties/', files: '/files/', maps: '/maps/' };
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener('change', updateMotionPreference);
    return () => media.removeEventListener('change', updateMotionPreference);
  }, []);
  useEffect(() => {
    if (prefersReducedMotion || rotationPaused) return undefined;
    const interval = window.setInterval(() => {
      setHeadlineState(({ current }) => ({ previous: current, current: (current + 1) % headlineWords.length }));
    }, 3000);
    return () => window.clearInterval(interval);
  }, [prefersReducedMotion, rotationPaused, headlineWords.length]);
  useEffect(() => {
    if (headlineState.previous === null) return undefined;
    const exitingIndex = headlineState.previous;
    const timeout = window.setTimeout(() => {
      setHeadlineState((state) => state.previous === exitingIndex ? { ...state, previous: null } : state);
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [headlineState.previous]);
  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(`${searchRoutes[activeSearch]}${query ? `?query=${encodeURIComponent(query)}` : ''}`);
  };
  return <Layout><PageMeta title="Zalmi Staging | Deliberate real estate decisions" description="Synthetic staging environment for the Zalmi public migration." canonicalPath="/" />
    <section className="zalmi-hero" onFocusCapture={(event) => { if (!event.target.closest('.rotation-control')) setRotationPaused(true); }}>
      <div className="hero-backdrop" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-copy"><p className="hero-kicker">THE ZALMI STANDARD · DHA SPECIALISTS</p><div className="headline-wrap"><h1>Discover Your<br /><span className="rotating-headline" aria-live="off"><span key={`current-${headlineState.current}`} className="rotating-word">{headlineWords[headlineState.current]}</span>{headlineState.previous !== null && <span key={`previous-${headlineState.previous}`} className="rotating-word rotating-word-exit" aria-hidden="true">{headlineWords[headlineState.previous]}</span>}</span><br />With Total Confidence</h1><button className="rotation-control" type="button" aria-pressed={rotationPaused} aria-label={rotationPaused ? 'Resume headline rotation' : 'Pause headline rotation'} onClick={() => setRotationPaused((paused) => !paused)}><span aria-hidden="true">{rotationPaused ? '▶' : 'Ⅱ'}</span></button></div><p className="hero-note">A clearer way to explore property, plot files, and society maps.</p>
          <div className="trust-row" aria-label="Why choose Zalmi"><div><strong>100%</strong><span>Verified Files</span></div><div><strong>2020+</strong><span>Established Trust</span></div><div><strong>DHA</strong><span>Specialized Experts</span></div></div>
        </div>
        <form className="hero-search" onSubmit={submitSearch} aria-label="Search staging content"><div className="search-tabs" role="tablist" aria-label="Search category">{[['properties', 'Properties'], ['files', 'Plot Files'], ['maps', 'Society Maps']].map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={activeSearch === key} className={activeSearch === key ? 'selected' : ''} onClick={() => setActiveSearch(key)}>{label}</button>)}</div><label className="search-label" htmlFor="hero-search-input">Find what you are looking for</label><div className="search-entry"><input id="hero-search-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={`Search ${activeSearch}...`} /><button type="submit">Search <span aria-hidden="true">→</span></button></div><p className="search-disclaimer">Search uses synthetic staging content only.</p></form>
      </div>
      <a className="scroll-cue" href="#featured">SCROLL TO EXPLORE <span aria-hidden="true">↓</span></a>
      <div className="hero-staging-note">ISOLATED PREVIEW · SAMPLE DATA</div>
    </section>
    <section id="featured" className="section"><div className="section-head"><div><p className="eyebrow">CURATED SAMPLE INVENTORY</p><h2>Space to consider.</h2></div><AppLink className="text-link" href="/properties/">View all sample listings →</AppLink></div><div className="grid">{featured.map((property) => <PropertyCard key={property.slug} property={property} />)}</div></section>
    <section className="value-band"><p>Designed for a future that is fast, legible, and respectful of search intent.</p><div><span>Clear routes</span><span>Synthetic data</span><span>Staged safely</span></div></section>
  </Layout>;
}

function Properties() {
  const category = new URLSearchParams(window.location.search).get('category');
  const visibleProperties = listProperties(category);
  return <Layout><PageMeta title="Sample properties | Zalmi Staging" description="Synthetic property records for the Zalmi migration staging environment." canonicalPath="/properties/" />
    <section className="page-intro"><p className="eyebrow">SYNTHETIC INVENTORY</p><h1>Sample properties.</h1><p>Filter behavior is locally fixture-backed. Filter URLs canonicalize to this base listing page.</p></section><section className="section filter-section"><div className="filters" aria-label="Property category filters"><AppLink className={!category ? 'filter active' : 'filter'} href="/properties/">All</AppLink>{listCategories().map((item) => <AppLink key={item} className={category === item ? 'filter active' : 'filter'} href={`/properties/?category=${encodeURIComponent(item)}`}>{item}</AppLink>)}</div><p className="result-count">{visibleProperties.length} sample {visibleProperties.length === 1 ? 'record' : 'records'}</p><div className="grid">{visibleProperties.map((property) => <PropertyCard key={property.slug} property={property} />)}</div></section>
  </Layout>;
}

function PropertyDetail({ property }) {
  return <Layout><PageMeta title={`${property.title} | Zalmi Staging`} description={property.summary} canonicalPath={`/properties/${property.slug}/`} /><section className="detail-hero"><div className="detail-art" aria-hidden="true"><span>{property.category}</span></div><div><p className="eyebrow">{property.tag}</p><h1>{property.title}</h1><p className="location">{property.location}</p><p className="price">{property.price}</p><dl><div><dt>Size</dt><dd>{property.size}</dd></div><div><dt>Bedrooms</dt><dd>{property.beds ?? 'Not applicable'}</dd></div><div><dt>Status</dt><dd>Synthetic sample</dd></div></dl></div></section><section className="section detail-copy"><p className="eyebrow">ABOUT THIS SAMPLE</p><h2>Built to validate the route, not to represent a live listing.</h2><p>{property.summary}</p><AppLink className="text-link" href="/properties/">← Back to properties</AppLink></section></Layout>;
}

function DirectoryPage({ kind }) {
  const isMaps = kind === 'maps';
  const records = isMaps ? listMaps() : listFiles();
  const label = isMaps ? 'Maps & master plans' : 'Files & guides';
  return <Layout><PageMeta title={`${label} | Zalmi Staging`} description={`Synthetic ${label.toLowerCase()} for staging navigation.`} canonicalPath={`/${kind}/`} /><section className="page-intro"><p className="eyebrow">SYNTHETIC DIRECTORY</p><h1>{label}.</h1><p>These records establish information architecture without copying production documents.</p></section><section className="section directory">{records.map((record) => <article key={record.title}><span>{isMaps ? record.type : record.format}</span><h2>{record.title}</h2><p>{isMaps ? record.location : record.note}</p><button type="button" disabled>{isMaps ? 'Map preview deferred' : 'Download deferred'}</button></article>)}</section></Layout>;
}

function Calculator() {
  return <Layout><PageMeta title="Calculator information | Zalmi Staging" description="Placeholder information architecture for the future calculator migration." canonicalPath="/calculator/" /><section className="page-intro"><p className="eyebrow">CALCULATOR MIGRATION</p><h1>Fees deserve precision.</h1><p>The calculator engine is intentionally deferred until its business rules and rounding examples are validated. This page preserves the future public information route only.</p><AppLink className="button" href="/properties/">Explore synthetic listings</AppLink></section></Layout>;
}

function NotFound() {
  return <Layout><PageMeta title="Page not found | Zalmi Staging" description="The requested staging route does not exist." canonicalPath="/404/" robots="noindex, nofollow" /><section className="not-found"><p className="eyebrow">404</p><h1>This route is not part of staging.</h1><p>The future Worker/hosting runtime will return the matching HTTP 404 status.</p><AppLink className="button" href="/">Return home</AppLink></section></Layout>;
}

function resolvePage() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return <Home />;
  if (path === '/properties') return <Properties />;
  if (path === '/maps') return <DirectoryPage kind="maps" />;
  if (path === '/files') return <DirectoryPage kind="files" />;
  if (path === '/calculator') return <Calculator />;
  const match = path.match(/^\/properties\/([^/]+)$/);
  if (match) {
    const property = findProperty(match[1]);
    return property ? <PropertyDetail property={property} /> : <NotFound />;
  }
  return <NotFound />;
}

export default function App() {
  const [, setLocationVersion] = useState(0);
  useEffect(() => {
    const onPopState = () => setLocationVersion((value) => value + 1);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  return resolvePage();
}
