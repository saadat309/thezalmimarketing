import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ChevronDown, Filter, MapPinned, RotateCcw, Search } from 'lucide-react';
import { listStagingMaps } from '../data/directory-api.js';

function readFilters(search = {}) {
  return {
    query: typeof search.query === 'string' ? search.query : '',
    city: typeof search.city === 'string' ? search.city : '',
    society: typeof search.society === 'string' ? search.society : '',
    phase: typeof search.phase === 'string' ? search.phase : '',
  };
}

export const Route = createFileRoute('/maps')({
  validateSearch: readFilters,
  loaderDeps: ({ search }) => readFilters(search),
  loader: ({ deps }) => listStagingMaps({ data: deps }),
  head: () => ({
    meta: [
      { title: 'Society Maps & Blueprints | The Zalmi Marketing' },
      { name: 'description', content: 'Explore society maps, master plans, and phase layouts from The Zalmi Marketing.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/maps' }],
  }),
  component: MapsDirectory,
});

function MapsDirectory() {
  const data = Route.useLoaderData();
  const search = Route.useSearch() ?? {};
  return (
    <main className="staging-directory">
      <header className="staging-directory-hero maps-directory-hero">
        <span className="staging-eyebrow"><MapPinned aria-hidden="true" /> MAP DIRECTORY</span>
        <h1>Society Maps &amp; Blueprints</h1>
        <p>Explore verified master plans, phase layouts, and high-resolution blueprint maps across DHA and major housing societies.</p>
        <form method="get" className="staging-directory-hero-search" role="search"><Search aria-hidden="true" /><input name="query" defaultValue={search.query} placeholder="Search maps by title, society name, or phase..." /></form>
      </header>
      <section className="staging-directory-results staging-directory-layout" aria-live="polite">
        <aside className="staging-directory-filter-rail">
          <div className="staging-directory-filter-heading"><h2><Filter aria-hidden="true" /> Filter Maps</h2><ChevronDown aria-hidden="true" /></div>
          <form method="get" className="staging-directory-filters" role="search" aria-label="Filter maps">
            <label>City<select name="city" defaultValue={search.city}><option value="">All Cities</option>{data.filters.cities.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label>Society<select name="society" defaultValue={search.society}><option value="">All Societies</option>{data.filters.societies.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label>Phase<select name="phase" defaultValue={search.phase}><option value="">All Phases</option>{data.filters.phases.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <button type="submit"><Search aria-hidden="true" /> Apply filters</button>
            {(search.query || search.city || search.society || search.phase) && <Link className="staging-directory-reset" to="/maps"><RotateCcw aria-hidden="true" /> Reset</Link>}
          </form>
        </aside>
        <div className="staging-directory-content"><div className="staging-directory-count"><span>Showing <strong>{data.items.length}</strong> {data.items.length === 1 ? 'map' : 'maps'}</span><Link to="/">Back to home <ArrowRight aria-hidden="true" /></Link></div>
        {data.items.length ? <div className="staging-directory-grid">{data.items.map((item) => <article className="staging-directory-card" key={item.slug}><div className="staging-directory-art"><MapPinned aria-hidden="true" /><span>Map preview unavailable</span><span className="staging-map-badge">Master Plan</span></div><div className="staging-directory-card-copy"><p className="staging-eyebrow">{item.cityName} · {item.phaseName}</p><h2>{item.title}</h2><p>{item.description}</p><div className="staging-directory-card-meta"><span>{item.societyName}</span><span>Map unavailable</span></div></div></article>)}</div> : <div className="staging-directory-empty"><h2>No maps match these filters.</h2><p>Try another city, society or search term.</p><Link to="/maps">Clear filters</Link></div>}</div>
      </section>
    </main>
  );
}
