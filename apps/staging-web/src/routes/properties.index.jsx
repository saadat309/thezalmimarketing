import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Bath, BedDouble, MapPin, Ruler, Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { listStagingProperties } from '../data/property-api.js';

const PAGE_SIZE = 20;

function readSearch(search) {
  const result = {};
  for (const key of ['query', 'category', 'city', 'society', 'phase', 'property_type', 'purchase_type', 'min_beds', 'min_baths', 'min_area', 'area_unit']) {
    const value = search?.[key];
    if (typeof value === 'string' && value.trim()) result[key] = value.trim().slice(0, 120);
  }
  if (typeof search?.cursor === 'string' && /^[A-Za-z0-9_-]{1,1024}$/.test(search.cursor)) {
    result.cursor = search.cursor;
  }
  if (!['Residential', 'Commercial'].includes(result.property_type)) delete result.property_type;
  if (!['sale', 'rent', 'installment'].includes(result.purchase_type)) delete result.purchase_type;
  if (result.category) {
    const category = result.category.toLowerCase();
    const supported = { homes: 'homes', house: 'homes', houses: 'homes', apartments: 'apartments', plots: 'plots', commercial: 'commercial' };
    if (supported[category]) result.category = supported[category];
    else delete result.category;
  }
  if (result.city && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.city)) delete result.city;
  if (result.society && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.society)) delete result.society;
  if (result.phase && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.phase)) delete result.phase;
  return result;
}

export const Route = createFileRoute('/properties/')({
  validateSearch: readSearch,
  loaderDeps: ({ search }) => ({ ...search }),
  loader: async ({ deps }) => {
    if (deps.category && deps.category !== 'homes') {
      return { items: [], page: { nextCursor: null, hasMore: false }, apiAvailable: true, categoryNotPopulated: true };
    }
    try {
      const filters = { ...deps, limit: PAGE_SIZE };
      if (filters.category === 'homes') filters.category = 'houses';
      return { ...(await listStagingProperties({ data: filters })), apiAvailable: true };
    } catch {
      return { items: [], page: { nextCursor: null, hasMore: false }, apiAvailable: false };
    }
  },
  head: () => ({
    meta: [
      { title: 'Properties for Sale & Rent | The Zalmi Marketing' },
      { name: 'description', content: 'Browse properties for sale, rent, and installment plans by type, location, and keyword.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/properties' }],
  }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const search = Route.useSearch();
  const { items, page, apiAvailable, categoryNotPopulated } = Route.useLoaderData();
  const cities = [...new Map(items.map((item) => [item.location?.city?.slug, item.location?.city?.name]).filter(([slug, name]) => slug && name))];
  const societies = [...new Map(items.map((item) => [item.location?.society?.slug, item.location?.society?.name]).filter(([slug, name]) => slug && name))];
  const phases = [...new Map(items.map((item) => [item.location?.phase?.slug, item.location?.phase?.name]).filter(([slug, name]) => slug && name))];
  const filtersActive = Object.keys(search).some((key) => key !== 'cursor');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-slate-950 px-4 pb-24 pt-36 text-white sm:pt-44 properties-directory-hero">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/65" />
        <div className="relative z-10 mx-auto max-w-7xl space-y-5">
          <Badge variant="outline" className="border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">Property inventory</Badge>
          <h1 className="max-w-4xl font-display text-4xl font-extrabold sm:text-5xl lg:text-6xl">Explore Properties <span className="gold-text-gradient">with Confidence</span></h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">Browse properties for sale, rent, and installment plans across Pakistan. Filter by city, price, area, and type.</p>
          <form action="/properties" method="get" className="properties-hero-search" role="search"><Search aria-hidden="true" /><input name="query" defaultValue={search.query || ''} maxLength="120" placeholder="Search properties by title, location, or category..." /></form>
        </div>
      </section>

      <section className="properties-directory-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <aside className="properties-filter-rail" aria-label="Advanced property filters"><div className="properties-filter-heading"><h2><SlidersHorizontal aria-hidden="true" /> Advanced Filters</h2>{filtersActive && <Link to="/properties" className="properties-filter-reset">Reset All</Link>}</div><form action="/properties" method="get" className="properties-filter-form" role="search">
          <label>Category<select name="category" defaultValue={search.category || ''}><option value="">All Categories</option><option value="homes">Homes</option><option value="apartments">Apartments</option><option value="plots">Plots</option><option value="commercial">Commercial</option></select></label>
          <label>City<select name="city" defaultValue={search.city || ''}><option value="">All Cities</option>{cities.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
          <label>Society<select name="society" defaultValue={search.society || ''}><option value="">All Societies</option>{societies.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
          <label>Phase<select name="phase" defaultValue={search.phase || ''}><option value="">All Phases</option>{phases.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
          <label>Property Type<select name="property_type" defaultValue={search.property_type || ''}><option value="">All Types</option><option value="Residential">Residential</option><option value="Commercial">Commercial</option></select></label>
          <label>Price Type<select name="purchase_type" defaultValue={search.purchase_type || ''}><option value="">All Price Types</option><option value="sale">Sale</option><option value="rent">Rent</option><option value="installment">Installment</option></select></label>
          <div className="properties-filter-pair"><label>Beds<select name="min_beds" defaultValue={search.min_beds || ''}><option value="">Any</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+</option>)}</select></label><label>Baths<select name="min_baths" defaultValue={search.min_baths || ''}><option value="">Any</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{value}+</option>)}</select></label></div>
          <div className="properties-filter-pair"><label>Area<input name="min_area" type="number" min="0" defaultValue={search.min_area || ''} placeholder="Minimum" /></label><label>Unit<select name="area_unit" defaultValue={search.area_unit || 'sqft'}><option value="sqft">Sqft</option><option value="marla">Marla</option><option value="kanal">Kanal</option></select></label></div>
          <Button type="submit" className="h-11 w-full rounded-xl amber-gradient-vibrant font-bold text-slate-950"><SlidersHorizontal aria-hidden="true" className="mr-2 h-4 w-4" />Apply Filters</Button>
        </form></aside>

        <div className="properties-directory-content"><div className="mt-12 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="staging-eyebrow">{search.cursor ? 'CONTINUED RESULTS' : 'CURATED LISTINGS'}</p><h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Available Properties</h2></div>
          <p className="text-sm text-muted-foreground">{apiAvailable ? `${items.length} listing${items.length === 1 ? '' : 's'} on this page` : 'Listings unavailable'}</p>
        </div>

        {!apiAvailable ? (
          <Card className="mt-7 rounded-3xl border-amber-500/30 bg-card"><CardContent className="p-7 sm:p-9"><h3 className="font-display text-xl font-bold">Property listings could not be loaded</h3><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Please refresh the page and try again.</p></CardContent></Card>
        ) : items.length ? (
          <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {items.map((property) => <PropertyCard key={property.slug} property={property} />)}
          </div>
        ) : (
          <Card className="mt-7 rounded-3xl border-border bg-card"><CardContent className="p-8 text-center"><h3 className="font-display text-xl font-bold">{categoryNotPopulated ? 'No listings in this category yet' : 'No matching properties'}</h3><p className="mt-2 text-sm text-muted-foreground">{categoryNotPopulated ? 'Try another category or return to the full property inventory.' : 'Try a broader search or remove one of the filters.'}</p><Link to="/properties" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-amber-500 hover:underline">Clear filters <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link></CardContent></Card>
        )}

        {apiAvailable && (page?.hasMore || search.cursor) && <nav aria-label="Property results pages" className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {search.cursor && <Link to="/properties" search={{ query: search.query, category: search.category, city: search.city, society: search.society, phase: search.phase, property_type: search.property_type, purchase_type: search.purchase_type }} className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold hover:border-[#D4AF37]/60">First page</Link>}
          {page?.hasMore && page.nextCursor && <Link to="/properties" search={{ ...search, cursor: page.nextCursor }} className="inline-flex min-h-11 items-center rounded-xl bg-[#D4AF37] px-5 text-sm font-bold text-slate-950 hover:bg-[#e9c95d]">Next page <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>}
        </nav>}
      </div></section>
    </main>
  );
}

function PropertyCard({ property }) {
  const { title, slug, category, propertyType, purchaseType, location, price, area, beds, baths, shortDescription, labels } = property;
  return (
    <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-lg transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-2xl">
      <Link to="/properties/$slug" params={{ slug }} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <img src="/dha birdeye view.webp" alt="Property listing visual" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute left-4 top-4 rounded-full border border-[#D4AF37]/50 bg-slate-950/85 px-3 py-1 text-[10px] font-bold tracking-wider text-[#f3e5ab]">FEATURED LISTING</span>
          <span className="absolute bottom-4 right-4 rounded-xl bg-slate-950/90 px-3 py-2 font-display text-base font-bold text-[#f3c55b]">{formatPrice(price)}</span>
        </div>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2"><Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">{category?.name || 'Property'}</Badge><Badge variant="secondary">{propertyType} · {purchaseLabel(purchaseType)}</Badge>{labels?.filter((label) => label.isBadge).map((label) => <Badge key={label.slug} variant="secondary">{label.name}</Badge>)}</div>
          <div><h3 className="font-display text-xl font-bold leading-snug text-foreground group-hover:text-[#D4AF37]">{title}</h3><p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />{location?.society?.name ? `${location.society.name}, ` : ''}{location?.city?.name || 'Sample location'}</p></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-xs font-medium text-muted-foreground">{beds !== null && beds !== undefined && <span className="inline-flex items-center gap-1.5"><BedDouble aria-hidden="true" className="h-4 w-4 text-[#D4AF37]" />{beds} beds</span>}{baths !== null && baths !== undefined && <span className="inline-flex items-center gap-1.5"><Bath aria-hidden="true" className="h-4 w-4 text-[#D4AF37]" />{baths} baths</span>}<span className="inline-flex items-center gap-1.5"><Ruler aria-hidden="true" className="h-4 w-4 text-[#D4AF37]" />{area?.value} {area?.unit}</span></div>
          <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">{shortDescription || 'Explore this property listing and its available details.'}</p>
          <span className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#D4AF37]/35 text-sm font-semibold text-foreground transition group-hover:bg-[#D4AF37]/10">View details <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" /></span>
        </CardContent>
      </Link>
    </Card>
  );
}

function formatPrice(price) {
  if (!price?.amount) return 'Price on request';
  const formatted = Number(price.amount).toLocaleString('en-PK');
  return `${price.currency || 'PKR'} ${formatted}`;
}

function purchaseLabel(type) {
  return ({ sale: 'For sale', rent: 'For rent', installment: 'Installment' })[type] || 'For sale';
}
