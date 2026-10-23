import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, MapPinned, Search } from 'lucide-react';
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
      { title: 'Society Maps | Zalmi Marketing staging' },
      { name: 'description', content: 'Explore synthetic society map listings in the isolated staging preview.' },
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
      <header className="staging-directory-hero">
        <span className="staging-eyebrow"><MapPinned aria-hidden="true" /> SYNTHETIC MAP DIRECTORY</span>
        <h1>Find your way around the community.</h1>
        <p>Browse sample society and phase map records. Map images and downloads are not connected in this preview.</p>
        <form method="get" className="staging-directory-filters" role="search" aria-label="Filter maps">
          <label>Search maps<input name="query" defaultValue={search.query} placeholder="Society, phase or city" /></label>
          <label>City<select name="city" defaultValue={search.city}><option value="">All cities</option>{data.filters.cities.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Society<select name="society" defaultValue={search.society}><option value="">All societies</option>{data.filters.societies.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Phase<select name="phase" defaultValue={search.phase}><option value="">All phases</option>{data.filters.phases.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <button type="submit"><Search aria-hidden="true" /> Apply filters</button>
        </form>
      </header>
      <section className="staging-directory-results" aria-live="polite">
        <div className="staging-directory-count"><span>{data.items.length} synthetic {data.items.length === 1 ? 'map' : 'maps'}</span><Link to="/">Back to home <ArrowRight aria-hidden="true" /></Link></div>
        {data.items.length ? <div className="staging-directory-grid">{data.items.map((item) => (
          <article className="staging-directory-card" key={item.slug}>
            <div className="staging-directory-art"><MapPinned aria-hidden="true" /><span>Map media deferred</span></div>
            <div className="staging-directory-card-copy"><p className="staging-eyebrow">{item.cityName} · {item.phaseName}</p><h2>{item.title}</h2><p>{item.description}</p><div className="staging-directory-card-meta"><span>{item.societyName}</span><span>Updated {item.updatedAt}</span></div></div>
          </article>
        ))}</div> : <div className="staging-directory-empty"><h2>No sample maps match these filters.</h2><p>Try another city, society or search term.</p><Link to="/maps">Clear filters</Link></div>}
      </section>
    </main>
  );
}
