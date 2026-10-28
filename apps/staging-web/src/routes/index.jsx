import { createFileRoute } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import DhaBirdseyeSection from '@/components/home/DhaBirdseyeSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import ServicesOverviewSection from '@/components/home/ServicesOverviewSection';
import CalculatorFeatureSection from '@/components/home/CalculatorFeatureSection';
import CalculatorMobileCta from '@/components/home/CalculatorMobileCta';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import InvestmentOpportunitiesSection from '@/components/home/InvestmentOpportunitiesSection';
import DhaServicesSection from '@/components/home/DhaServicesSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import PersonalizedExperience from '@/components/home/PersonalizedExperience';
import FeaturedFeature from '@/components/home/FeaturedFeature';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Quote, Pause, Play } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import content from '@/content/pages/home.json';
import { getSyntheticHomeData } from '../data/home-fixtures.js';
import { listStagingProperties } from '../data/property-api.js';
import { listStagingFiles, listStagingMaps } from '../data/directory-api.js';
import { listPublicLandingSections } from '../data/landing-api.js';
import StagingPopup from '../components/StagingPopup.jsx';

const Reveal = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ duration: 0.8, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);
const introPhrases = ['Discover Luxury Living', 'Premium DHA Homes', 'Your Dream Property', 'Elite Residential Estates'];

async function listAllStagingProperties() {
  const items = [];
  let cursor;
  for (let pageNumber = 0; pageNumber < 10; pageNumber += 1) {
    const page = await listStagingProperties({ data: { limit: 50, ...(cursor ? { cursor } : {}) } });
    items.push(...page.items);
    if (!page.page.hasMore || !page.page.nextCursor) break;
    cursor = page.page.nextCursor;
  }
  return { items };
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const homeData = await getSyntheticHomeData();
    const [propertyResult, fileResult, mapsResult, landingSections] = await Promise.allSettled([
      listAllStagingProperties(),
      listStagingFiles({ data: {} }),
      listStagingMaps({ data: {} }),
      listPublicLandingSections({ data: { cacheBust: Date.now() } }),
    ]);
    const page = propertyResult.status === 'fulfilled' ? propertyResult.value : null;
    const files = fileResult.status === 'fulfilled' ? fileResult.value.items : [];
    const configuredSections = landingSections.status === 'fulfilled' ? landingSections.value : null;
    const publicMaps = mapsResult?.status === 'fulfilled' ? mapsResult.value.items : [];
    return {
      ...homeData,
      featuredProperties: page ? page.items.map((property) => ({
          slug: property.slug,
          id: property.id,
          title: property.title,
          short_desc: property.shortDescription,
          price: property.price.amount,
          labels: property.labels,
          image: '/dha birdeye view.webp',
        })) : [],
      allFileProperties: files.map((file) => ({
        id: file.id || file.slug,
        slug: file.slug,
        title: file.title,
        price: Number(file.price?.amount || 0),
        currency: file.price?.currency || 'Rs.',
        area: Number(file.area?.value || 0),
        unit: file.area?.unit || 'Sq.Ft.',
        society_name: file.societyName,
        phase: file.phaseName,
        block: file.blockName,
        badges: file.labels || [],
      })),
      filePropertiesSection: {
        ...homeData.filePropertiesSection,
        items: files.slice(0, 3).map((file) => ({
          id: file.id || file.slug,
          slug: file.slug,
          title: file.title,
          short_desc: `${file.societyName || ''}${file.phaseName ? ` · ${file.phaseName}` : ''}`.trim(),
          price: file.price?.amount || 0,
          labels: file.labels || [],
          image: '/dha birdeye view.webp',
        })),
      },
      publicMaps: publicMaps.map((map) => ({
        id: map.id || map.slug,
        slug: map.slug,
        title: map.title,
        description: map.description,
        image: '/dha birdeye view.webp',
        pdfPath: `/maps#${map.slug}`,
      })),
      landingSections: configuredSections || [],
      landingApiAvailable: Boolean(configuredSections),
      propertyApiAvailable: Boolean(page),
    };
  },
  head: () => ({
    meta: [
      { title: content.seo.title },
      { name: 'description', content: content.seo.description || 'The Zalmi Marketing real estate and property services.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/' }],
  }),
  component: HomePage,
});

function HomePage() {
  const {
    categoriesSection,
    propertiesSection,
    mapsSection,
    personalizedCards,
    reviews,
    filePropertiesSection,
    allFileProperties,
    publicMaps,
    landingSections,
    featuredProperties,
    propertyApiAvailable,
  } = Route.useLoaderData();

  const section = (collection) => landingSections.find((item) => item.collection === collection);
  const isEnabled = (collection) => Boolean(section(collection));
  const propertySection = section('properties');
  const fileSection = section('files');
  const mapSection = section('maps');
  const categorySection = section('categories');
  const videoSection = section('video');
  const popupSection = section('popup');
  const selected = (collection) => section(collection)?.selectedItems || [];
  const matchesSelection = (item, collection) => {
    const ids = selected(collection).map(String);
    if (!ids.length) return false;
    return [item.id, item.slug, item.sourceId].filter((value) => value !== undefined && value !== null).map(String).some((value) => ids.includes(value));
  };
  const selectedCategories = categoriesSection.items.filter((item, index) => matchesSelection({ ...item, id: item.id, sourceId: String(index + 1) }, 'categories'));
  const selectedProperties = featuredProperties.filter((item) => matchesSelection(item, 'properties'));
  const selectedFiles = allFileProperties.filter((item) => matchesSelection(item, 'files')).map((item) => ({
    ...item,
    slug: item.slug,
    short_desc: `${item.society_name || ''}${item.phase ? ` · ${item.phase}` : ''}`.trim(),
    price: item.price,
    labels: item.badges,
    image: '/dha birdeye view.webp',
  }));
  const selectedMaps = publicMaps.filter((item) => matchesSelection(item, 'maps'));

  return (
    <main className="flex flex-col items-center justify-center w-full text-center mx-auto bg-background text-foreground transition-colors duration-300">
      <HeroSection categories={selectedCategories} items={allFileProperties} />
      {popupSection && <StagingPopup isVisible title={popupSection.title} description={popupSection.subtitle} delayMs={popupSection.delayMs} mediaType={popupSection.mediaType} mediaPath={popupSection.mediaUrl} />}

      <div className="w-full relative overflow-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-60 dark:opacity-30 bg-group1-pattern pointer-events-none" />
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto py-10 sm:py-16">
          <Reveal className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="mb-4 sm:mb-6">
              <img src="/Zalmi Marketing Logo White.webp" alt="The Zalmi Marketing logo" className="h-12 sm:h-16 md:h-20 w-auto object-contain drop-shadow-[0_10px_25px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105" />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-foreground flex flex-col items-center justify-center px-2">
              <span>{content.introSection.headingPre}</span>
              <div className="h-[8em] sm:h-[4.5em] py-2 sm:py-4 overflow-visible my-2 w-full flex items-center justify-center">
                <RotatingIntroPhrase />
              </div>
            </h2>
            <p className="max-w-3xl text-base sm:text-xl text-muted-foreground font-light leading-relaxed">{content.introSection.description}</p>
          </Reveal>
        </section>
        <div className="relative z-10 w-full py-4 sm:py-8"><div className="staging-shape-banner"><p>THE ZALMI STANDARD</p><span>Thoughtful guidance. Confident decisions.</span></div></div>
        {isEnabled('categories') && <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
          <Reveal className="w-full"><CategoriesSection items={selectedCategories} heading={categorySection?.title || categoriesSection.heading} subheading={categorySection?.subtitle || categoriesSection.subheading} className="my-0" /></Reveal>
        </section>}
        <div className="w-full relative z-10"><Reveal className="w-full"><ServicesOverviewSection /></Reveal></div>
        <div className="w-full relative z-10"><Reveal className="w-full"><CalculatorFeatureSection {...content.calculatorFeatureSection} /></Reveal></div>
      </div>

      <CalculatorMobileCta />

      <div className="w-full relative overflow-x-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-60 dark:opacity-30 bg-group2-pattern pointer-events-none" />
        {isEnabled('properties') && <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="w-full max-w-7xl mx-auto"><SyntheticCardsSection title={propertySection?.title || propertiesSection.heading} description={propertySection?.subtitle || propertiesSection.subheading} items={selectedProperties} kind="property" emptyMessage={propertyApiAvailable ? 'No selected public properties are currently available.' : 'The property service is unavailable.'} /></Reveal></section>}
        {isEnabled('files') && <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="relative z-10 w-full max-w-7xl mx-auto"><SyntheticCardsSection title={fileSection?.title || filePropertiesSection.heading} description={fileSection?.subtitle || filePropertiesSection.subheading} items={selectedFiles} kind="file" emptyMessage="No selected public files are currently available." /></Reveal></section>}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto hidden md:block"><Reveal className="w-full max-w-7xl mx-auto"><InvestmentOpportunitiesSection /></Reveal></section>
      </div>

      <div className="w-full relative bg-background text-foreground py-0 overflow-visible">
        <div className="absolute inset-0 opacity-55 dark:opacity-28 bg-group3-pattern pointer-events-none" />
        {isEnabled('maps') && <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="w-full max-w-7xl mx-auto"><SyntheticMapsSection heading={mapSection?.title || mapsSection.heading} subheading={mapSection?.subtitle || mapsSection.subheading} items={selectedMaps} /></Reveal></section>}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><HowItWorksSection {...content.howItWorksSection} className="my-0" /></section>
        <div className="w-full relative z-10"><Reveal className="w-full"><SyntheticReviewsSection reviews={reviews} /></Reveal></div>
        <div className="w-full relative z-10"><Reveal className="w-full"><FeaturedFeature {...content.featuredFeatureSection} /></Reveal></div>
      </div>

      <div className="w-full relative overflow-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-80 dark:opacity-60 bg-group4-pattern pointer-events-none" />
        {isEnabled('video') && <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="w-full max-w-7xl mx-auto"><SyntheticVideoSection title={videoSection?.title} subtitle={videoSection?.subtitle} mediaUrl={videoSection?.mediaUrl} /></Reveal></section>}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="w-full max-w-7xl mx-auto"><DhaServicesSection /></Reveal></section>
      </div>

      <DhaBirdseyeSection>
        <div className="space-y-12 sm:space-y-20">
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="relative z-10 w-full max-w-7xl mx-auto"><WhyChooseUsSection /></Reveal></section>
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto"><Reveal className="w-full max-w-7xl mx-auto"><PersonalizedExperience cards={personalizedCards} className="mx-auto" /></Reveal></section>
        </div>
      </DhaBirdseyeSection>
    </main>
  );
}

function RotatingIntroPhrase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotionPreference = () => setReducedMotion(media.matches);
    syncMotionPreference();
    media.addEventListener?.('change', syncMotionPreference);
    return () => media.removeEventListener?.('change', syncMotionPreference);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion) return undefined;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % introPhrases.length), 3200);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion]);
  return (
    <span className="staging-intro-rotation" onFocusCapture={() => setPaused(true)}>
      <span className="inline-flex h-full w-full items-center justify-center text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl overflow-hidden" aria-live="off">
        <AnimatePresence mode="wait"><motion.span key={active} initial={reducedMotion ? false : { y: 35, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reducedMotion ? undefined : { y: -35, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.45 }} className="gold-text-gradient">{introPhrases[active]}</motion.span></AnimatePresence>
      </span>
      <button type="button" className="staging-rotation-control" onClick={() => setPaused((value) => !value)} aria-label={paused || reducedMotion ? 'Resume headline rotation' : 'Pause headline rotation'}>{paused || reducedMotion ? <Play size={15} /> : <Pause size={15} />}<span>{paused || reducedMotion ? 'Resume' : 'Pause'} headline</span></button>
    </span>
  );
}

function SyntheticCardsSection({ title, description, items, kind, emptyMessage = 'Listings will appear here.' }) {
  const isProperty = kind === 'property';
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left">
        <div className="space-y-4 max-w-2xl"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">{isProperty ? 'Exclusive Estates' : 'Verified Plot Files'}</Badge><h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display text-foreground">{title}</h2><p className="text-sm sm:text-lg text-muted-foreground leading-relaxed">{description}</p></div>
        <Button asChild className="amber-gradient-vibrant text-slate-950 font-extrabold rounded-2xl"><Link to={isProperty ? '/properties' : '/files'}>View All {isProperty ? 'Properties' : 'Files'} <ArrowRight size={18} className="ml-2" /></Link></Button>
      </div>
      {items.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
        {items.map((item) => (
          <Card key={item.slug} className="py-0 gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-xl hover:-translate-y-1 transition-transform">
            <img src={item.image} alt="Property listing visual" className="w-full aspect-[16/10] object-cover" />
            <CardContent className="p-6 space-y-3"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">FEATURED LISTING</Badge><div className="flex flex-wrap gap-2">{item.labels?.filter((label) => label.isBadge).map((label) => <Badge key={label.slug} variant="secondary">{label.name}</Badge>)}</div><h3 className="font-display font-bold text-xl">{item.title}</h3><p className="text-sm text-muted-foreground">{item.short_desc || 'Explore this listing and its available details.'}</p><div className="text-[#D4AF37] font-bold">PKR {Number(item.price).toLocaleString()}</div><Button asChild variant="outline" className="w-full"><Link to={isProperty ? `/properties/${item.slug}` : '/files'}>View details <ArrowRight size={16} className="ml-2" /></Link></Button></CardContent>
          </Card>
        ))}
      </div> : <Card className="rounded-3xl border-border bg-card"><CardContent className="p-8 text-center text-sm text-muted-foreground">{emptyMessage}</CardContent></Card>}
    </section>
  );
}

function SyntheticReviewsSection({ reviews }) {
  const review = reviews[0];
  return (
    <section className="w-full text-white py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')" }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/95 via-slate-950/80 to-slate-950/55" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/40">Testimonials</Badge><h2 className="mt-5 text-3xl sm:text-5xl font-extrabold font-display">What our clients <span className="gold-text-gradient">are saying?</span></h2><div className="grid sm:grid-cols-2 gap-6 mt-8 p-6 rounded-3xl bg-slate-900/90 border border-[#D4AF37]/30"><div><strong className="text-3xl text-[#D4AF37] font-display">5,000+</strong><p className="text-sm text-slate-300">Satisfied Clients</p></div><div><strong className="text-3xl text-[#D4AF37] font-display">4.9/5</strong><p className="text-sm text-slate-300">Overall Rating</p><div className="flex gap-1 mt-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-current" />)}</div></div></div><p className="mt-6 text-sm text-amber-200">Testimonial card below is fabricated for layout review; it is not a customer review.</p></div>
        <Card className="rounded-3xl border-[#D4AF37]/35 bg-slate-900/95 text-white"><CardContent className="p-7 sm:p-9"><Quote className="w-8 h-8 text-[#D4AF37]" /><p className="mt-5 text-base leading-relaxed">“{review.text}”</p><div className="mt-6 border-t border-white/10 pt-5"><strong className="font-display">{review.name}</strong><p className="text-xs text-[#D4AF37] mt-1">{review.role}</p></div><div className="flex justify-between mt-5"><Button variant="outline" size="sm" disabled aria-label="Previous sample review"><ChevronLeft className="w-4 h-4" />Previous</Button><Button variant="outline" size="sm" disabled aria-label="Next sample review">Next<ChevronRight className="w-4 h-4" /></Button></div></CardContent></Card>
      </div>
    </section>
  );
}

function SyntheticMapsSection({ heading, subheading, items }) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 text-left"><div className="space-y-4 max-w-2xl"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">Master Blueprints</Badge><h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display">{heading}</h2><p className="text-sm sm:text-lg text-muted-foreground">{subheading}</p></div><Button asChild className="amber-gradient-vibrant text-slate-950 font-extrabold rounded-2xl"><Link to="/maps">View All Maps <ArrowRight size={18} className="ml-2" /></Link></Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">{items.map((item) => <Card key={item.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl"><img src={item.image} alt="Society map preview" className="w-full aspect-[16/10] object-cover" /><CardContent className="p-6 space-y-3"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">MASTER PLAN</Badge><h3 className="font-display font-bold text-xl">{item.title}</h3><p className="text-sm text-muted-foreground">{item.description}</p><Button asChild variant="outline" className="w-full"><Link to="/maps">View maps</Link></Button></CardContent></Card>)}</div>
    </section>
  );
}

function SyntheticVideoSection({ title, subtitle, mediaUrl }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">Virtual tours</Badge><h2 className="text-3xl sm:text-4xl font-extrabold font-display">{title || <>Experience Luxury in <span className="gold-text-gradient">Motion &amp; Detail</span></>}</h2><p className="text-sm sm:text-base text-muted-foreground">{subtitle || 'Explore the latest property showcase.'}</p></div>
      <Card className="aspect-video max-w-5xl mx-auto rounded-3xl border border-[#D4AF37]/30 shadow-2xl bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.14),rgba(2,6,18,0.96)_65%)]"><CardContent className="h-full flex flex-col items-center justify-center text-center gap-4">{mediaUrl ? <iframe className="h-full w-full rounded-3xl" src={mediaUrl} title={title || 'Featured video'} loading="lazy" allowFullScreen /> : <><span className="w-16 h-16 rounded-full border border-[#D4AF37]/60 text-[#D4AF37] grid place-items-center"><Play aria-hidden="true" /></span><p className="text-sm text-slate-300">Video media is not configured.</p></>}</CardContent></Card>
    </section>
  );
}
