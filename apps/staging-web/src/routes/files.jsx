import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, FileText, Search } from 'lucide-react';
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
      { title: 'Plot Files | Zalmi Marketing staging' },
      { name: 'description', content: 'Explore synthetic plot file listings in the isolated staging preview.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: FilesDirectory,
});

function FilesDirectory() {
  const data = Route.useLoaderData();
  const search = Route.useSearch() ?? {};
  return (
    <main className="staging-directory">
      <header className="staging-directory-hero">
        <span className="staging-eyebrow"><FileText aria-hidden="true" /> SYNTHETIC FILE DIRECTORY</span>
        <h1>Plot file samples, clearly labeled.</h1>
        <p>These fabricated examples validate the listing and filters only. No documents, transactions, inquiries or production records are connected.</p>
        <form method="get" className="staging-directory-filters" role="search" aria-label="Filter plot files">
          <label>Search files<input name="query" defaultValue={search.query} placeholder="File, society, phase or city" /></label>
          <label>City<select name="city" defaultValue={search.city}><option value="">All cities</option>{data.filters.cities.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Society<select name="society" defaultValue={search.society}><option value="">All societies</option>{data.filters.societies.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>Phase<select name="phase" defaultValue={search.phase}><option value="">All phases</option>{data.filters.phases.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label>File type<select name="file_type" defaultValue={search.file_type}><option value="">All types</option>{data.filters.fileTypes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <button type="submit"><Search aria-hidden="true" /> Apply filters</button>
        </form>
      </header>
      <section className="staging-directory-results" aria-live="polite">
        <div className="staging-directory-count"><span>{data.items.length} synthetic {data.items.length === 1 ? 'file' : 'files'}</span><Link to="/">Back to home <ArrowRight aria-hidden="true" /></Link></div>
        {data.items.length ? <div className="staging-directory-grid">{data.items.map((item) => (
          <article className="staging-directory-card" key={item.slug}>
            <div className="staging-directory-art staging-file-art"><FileText aria-hidden="true" /><span>Document media deferred</span></div>
            <div className="staging-directory-card-copy"><p className="staging-eyebrow">{item.fileType} · {item.cityName}</p><h2>{item.title}</h2><p>{item.societyName} · {item.phaseName}</p><dl className="staging-file-facts"><div><dt>Area</dt><dd>{item.area.value} {item.area.unit}</dd></div><div><dt>Sample price</dt><dd>{Number(item.price.amount).toLocaleString('en-PK')} {item.price.currency}</dd></div></dl><div className="staging-directory-card-meta"><span>Updated {item.updatedAt}</span><span>Sample only</span></div></div>
          </article>
        ))}</div> : <div className="staging-directory-empty"><h2>No sample files match these filters.</h2><p>Try a different city, society, file type or search term.</p><Link to="/files">Clear filters</Link></div>}
      </section>
    </main>
  );
}
