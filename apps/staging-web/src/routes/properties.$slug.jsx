import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowLeft, Bath, BedDouble, MapPin, Play, Ruler, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getStagingProperty } from '../data/property-api.js';

export const Route = createFileRoute('/properties/$slug')({
  loader: async ({ params }) => {
    const property = await getStagingProperty({ data: { slug: params.slug } });
    if (!property) throw notFound();
    return property;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} | The Zalmi Marketing` : 'Property | The Zalmi Marketing' },
      { name: 'description', content: loaderData?.shortDescription || 'Explore property details from The Zalmi Marketing.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: `https://migration.local.invalid/properties/${loaderData?.slug || ''}` }],
  }),
  notFoundComponent: PropertyNotFound,
  errorComponent: PropertyApiError,
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const property = Route.useLoaderData();
  const location = [property.location?.phase?.name, property.location?.society?.name, property.location?.city?.name]
    .filter(Boolean).join(', ');

  return (
    <main className="min-h-screen bg-background pb-20 text-foreground">
      <section className="relative overflow-hidden bg-slate-950 px-4 pb-20 pt-36 text-white sm:pt-44">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/dha birdeye view.webp')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/65" />
        <div className="relative z-10 mx-auto max-w-7xl space-y-5">
          <Link to="/properties" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-300 hover:text-[#f3c55b]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />All properties</Link>
          <div><Badge variant="outline" className="border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">{property.category?.name || 'Property'} · featured listing</Badge></div>
          {!!property.labels?.some((label) => label.isBadge) && <div className="flex flex-wrap gap-2">{property.labels.filter((label) => label.isBadge).map((label) => <Badge key={label.slug} variant="secondary">{label.name}</Badge>)}</div>}
          <h1 className="max-w-4xl font-display text-4xl font-extrabold sm:text-6xl">{property.title}</h1>
          <p className="flex items-center gap-2 text-base text-slate-300"><MapPin aria-hidden="true" className="h-5 w-5 shrink-0 text-[#D4AF37]" />{location || property.location?.address || 'Location on request'}</p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-9 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="space-y-8 lg:col-span-8">
          <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-2xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-slate-900"><img src="/dha birdeye view.webp" alt="Property listing visual" className="h-full w-full object-cover" /><span className="absolute left-5 top-5 rounded-full border border-[#D4AF37]/50 bg-slate-950/85 px-4 py-2 text-xs font-bold tracking-wider text-[#f3e5ab]">PROPERTY MEDIA UNAVAILABLE</span></div>
            <CardContent className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4 sm:p-7">
              <Fact icon={Ruler} label="Area" value={`${property.area?.value || '—'} ${property.area?.unit || ''}`} />
              <Fact icon={BedDouble} label="Bedrooms" value={property.beds ?? '—'} />
              <Fact icon={Bath} label="Bathrooms" value={property.baths ?? '—'} />
              <Fact icon={ShieldCheck} label="Listing" value={`${property.propertyType || 'Property'} · ${purchaseLabel(property.purchaseType)}`} />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border bg-card shadow-lg"><CardContent className="p-6 sm:p-9">
            <p className="staging-eyebrow">PROPERTY OVERVIEW</p>
            <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">About this listing</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{property.shortDescription}</p>
            <div className="prose prose-slate mt-6 max-w-none text-foreground dark:prose-invert" dangerouslySetInnerHTML={{ __html: property.descriptionHtml }} />
            <p className="mt-7 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">Descriptions are reviewed before publication. Confirm current availability and pricing with our team.</p>
          </CardContent></Card>

          <Card className="rounded-3xl border-dashed border-[#D4AF37]/40 bg-card/70"><CardContent className="flex items-start gap-4 p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"><Play aria-hidden="true" className="h-5 w-5" /></span><div><h2 className="font-display text-lg font-bold">Property media unavailable</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Photos, video tours, and downloadable files are not currently available for this listing.</p></div></CardContent></Card>
        </section>

        <aside className="lg:col-span-4">
          <Card className="sticky top-28 rounded-3xl border-[#D4AF37]/30 bg-card shadow-2xl"><CardContent className="space-y-5 p-6 sm:p-8">
            <Badge variant="outline" className="border-[#D4AF37]/30 text-[#D4AF37]">Property details</Badge>
            <p className="text-sm text-muted-foreground">Price</p>
            <p className="font-display text-3xl font-extrabold text-[#D4AF37]">{formatPrice(property.price)}</p>
            <div className="border-y border-border py-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p><p className="mt-2 font-medium">{location || property.location?.address || 'Sample location'}</p></div>
            <Link to="/contact" className="flex min-h-12 items-center justify-center rounded-xl amber-gradient-vibrant px-5 text-sm font-extrabold text-slate-950">Contact our team</Link>
            <p className="text-center text-xs leading-relaxed text-muted-foreground">Our team can confirm current availability, pricing, and next steps.</p>
          </CardContent></Card>
        </aside>
      </div>
    </main>
  );
}

function Fact({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-border bg-muted/30 p-4"><Icon aria-hidden="true" className="h-5 w-5 text-[#D4AF37]" /><p className="mt-3 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function PropertyNotFound() {
  return <section className="staging-not-found"><p className="staging-eyebrow">404 · PROPERTY</p><h1>That property is not available.</h1><p>It may have been removed or is no longer publicly listed.</p><Link to="/properties">Back to properties</Link></section>;
}

function PropertyApiError() {
  return <section className="staging-not-found"><p className="staging-eyebrow">LISTING UNAVAILABLE</p><h1>We couldn’t load this property.</h1><p>Please refresh the page and try again.</p><Link to="/properties">Back to properties</Link></section>;
}

function formatPrice(price) {
  if (!price?.amount) return 'Price on request';
  return `${price.currency || 'PKR'} ${Number(price.amount).toLocaleString('en-PK')}`;
}

function purchaseLabel(type) {
  return ({ sale: 'For sale', rent: 'For rent', installment: 'Installment' })[type] || 'For sale';
}
