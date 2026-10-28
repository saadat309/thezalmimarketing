import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, ChevronDown, FileText, Filter, RotateCcw, Search } from 'lucide-react';
import { listStagingFiles } from '../data/directory-api.js';

function readFilters(search = {}) {
  return {
    query: typeof search.query === 'string' ? search.query : '',
    city: typeof search.city === 'string' ? search.city : '',
    society: typeof search.society === 'string' ? search.society : '',
    phase: typeof search.phase === 'string' ? search.phase : '',
    file_type: typeof search.file_type === 'string' ? search.file_type : '',
  };
}

export const Route = createFileRoute('/files')({
  validateSearch: readFilters,
  loaderDeps: ({ search }) => readFilters(search),
  loader: ({ deps }) => listStagingFiles({ data: deps }),
  head: () => ({
    meta: [
      { title: 'Plot Files & Investment Inventory | The Zalmi Marketing' },
      { name: 'description', content: 'Explore plot file listings, allocation letters, and investment opportunities from The Zalmi Marketing.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/files' }],
  }),
  component: FilesDirectory,
});

function FilesDirectory() {
  const data = Route.useLoaderData();
  const search = Route.useSearch() ?? {};
  return (
    <main className="staging-directory">
      <header className="staging-directory-hero files-directory-hero">
        <span className="staging-eyebrow"><FileText aria-hidden="true" /> FILE DIRECTORY</span>
        <h1>Plot Files &amp; Investment Inventory</h1>
        <p>Browse verified plot files, allocation letters, and open files across top housing schemes with live market updates.</p>
        <form method="get" className="staging-directory-hero-search" role="search"><Search aria-hidden="true" /><input name="query" defaultValue={search.query} placeholder="Search files by society, phase, or file type..." /></form>
      </header>
      <section className="staging-directory-results staging-directory-layout" aria-live="polite">
        <aside className="staging-directory-filter-rail">
          <div className="staging-directory-filter-heading"><h2><Filter aria-hidden="true" /> Filter Files</h2><ChevronDown aria-hidden="true" /></div>
          <form method="get" className="staging-directory-filters" role="search" aria-label="Filter plot files">
            <label>City<select name="city" defaultValue={search.city}><option value="">All Cities</option>{data.filters.cities.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label>Society<select name="society" defaultValue={search.society}><option value="">All Societies</option>{data.filters.societies.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label>Phase<select name="phase" defaultValue={search.phase}><option value="">All Phases</option>{data.filters.phases.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
            <label>File type<select name="file_type" defaultValue={search.file_type}><option value="">All File Types</option>{data.filters.fileTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <button type="submit"><Search aria-hidden="true" /> Apply filters</button>
            {(search.query || search.city || search.society || search.phase || search.file_type) && <Link className="staging-directory-reset" to="/files"><RotateCcw aria-hidden="true" /> Reset</Link>}
          </form>
        </aside>
        <div className="staging-directory-content"><div className="staging-directory-count"><span>Showing <strong>{data.items.length}</strong> {data.items.length === 1 ? 'file' : 'files'}</span><Link to="/">Back to home <ArrowRight aria-hidden="true" /></Link></div>
        {data.items.length ? <div className="staging-directory-grid">{data.items.map((item) => <article className="staging-directory-card staging-file-card" key={item.slug}><div className="staging-directory-art staging-file-art"><FileText aria-hidden="true" /><span>Document preview unavailable</span><span className="staging-file-badge">{item.fileType}</span></div><div className="staging-directory-card-copy"><p className="staging-eyebrow">{item.cityName} · {item.phaseName}</p><h2>{item.title}</h2><p>{item.societyName} · {item.phaseName}</p><dl className="staging-file-facts"><div><dt>Area</dt><dd>{item.area.value} {item.area.unit}</dd></div><div><dt>Price</dt><dd>{Number(item.price.amount).toLocaleString('en-PK')} {item.price.currency}</dd></div></dl><div className="staging-directory-card-meta"><span>Updated {item.updatedAt}</span><span>Verified listing</span></div></div></article>)}</div> : <div className="staging-directory-empty"><h2>No files match these filters.</h2><p>Try a different city, society, file type or search term.</p><Link to="/files">Clear filters</Link></div>}</div>
      </section>
    </main>
  );
}
