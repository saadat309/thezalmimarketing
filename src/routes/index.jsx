import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query';
import { fetchHomeData } from "@/lib/api";
import HeroSection from "@/components/home/HeroSection";
import DhaBirdseyeSection from "@/components/home/DhaBirdseyeSection";
import CategoryCard from "@/components/home/CategoryCard";
import PropertyCard from "@/components/global/PropertyCard";
import CategoriesSection from "@/components/home/CategoriesSection";
import ServicesOverviewSection from "@/components/home/ServicesOverviewSection";
import CalculatorFeatureSection from "@/components/home/CalculatorFeatureSection";
import CalculatorMobileCta from "@/components/home/CalculatorMobileCta";
import ReviewsSection from "@/components/home/ReviewSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import InvestmentOpportunitiesSection from "@/components/home/InvestmentOpportunitiesSection";
import FeaturedPropertiesSection from "@/components/home/FeaturedPropertiesSection";
import FeaturedFilesSection from "@/components/home/FeaturedFilesSection";
import FeaturedMapsSection from "@/components/home/FeaturedMapsSection";
import FeaturedVideoSection from "@/components/home/FeaturedVideoSection";
import DhaServicesSection from "@/components/home/DhaServicesSection";
import WhyChooseUsSection from "@/components/home/WhyChooseUsSection";
import PersonalizedExperience from "@/components/home/PersonalizedExperience";
import FeaturedFeature from "@/components/home/FeaturedFeature";
import ShapeShifterSection from "@/components/home/ShapeShifterSection";
import ShortSlideDown from "@/components/animata/text/short-slide-down";
import Popup from "@/components/global/popup";
import { motion } from "framer-motion";
import content from "@/content/pages/home.json";

const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['homeData'],
    queryFn: () => fetchHomeData(),
  });

const Reveal = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()),
  head: () => ({
    meta: [
      { title: content.seo.title },
      {
        name: "description",
        content: content.seo.description,
      },
      {
        name: "keywords",
        content: content.seo.keywords,
      },
      { property: "og:type", content: content.seo.ogType },
      { property: "og:url", content: content.seo.ogUrl },
      {
        property: "og:title",
        content: content.seo.ogTitle,
      },
      {
        property: "og:description",
        content: content.seo.ogDescription,
      },
      {
        property: "og:image",
        content: content.seo.ogImage,
      },
      { name: "twitter:card", content: content.seo.twitterCard },
      { name: "twitter:url", content: content.seo.twitterUrl },
      {
        property: "twitter:title",
        content: content.seo.twitterTitle,
      },
      {
        property: "twitter:description",
        content: content.seo.twitterDescription,
      },
      {
        property: "twitter:image",
        content: content.seo.twitterImage,
      },
    ],
    links: [{ rel: "canonical", href: content.seo.canonical }],
  }),
  component: RouteComponent,
});

const howItWorksSectionData = content.howItWorksSection;

function RouteComponent() {
  const { 
    propertiesSection, 
    mapsSection, 
    categoriesSection, 
    personalizedCards, 
    reviews, 
    filePropertiesSection, 
    videoSection,
    popupSection,
    allFileProperties
  } = Route.useLoaderData();

  const videoToDisplay = videoSection 
    ? (videoSection.videoInputMethod === 'upload' 
        ? { path: videoSection.videoMedia?.[0]?.path } 
        : { video_embed_link: videoSection.videoEmbedLink })
    : null;

  return (
    <main className="flex flex-col items-center justify-center w-full text-center mx-auto bg-background text-foreground transition-colors duration-300">
      <HeroSection categories={categoriesSection?.items} items={allFileProperties} />

      {/* Group 1 (Intro, ShapeShifter, Categories, Services Overview) */}
      <div className="w-full relative overflow-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-60 dark:opacity-30 bg-group1-pattern pointer-events-none" />

        {/* 1. Intro Section (Responsive Brand Intro) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto py-10 sm:py-16">
          <Reveal className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <div className="mb-4 sm:mb-6">
              <img
                src="/Zalmi Marketing Logo White.webp"
                alt="The Zalmi Marketing Logo"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain hidden dark:block drop-shadow-[0_10px_25px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105"
              />
              <img
                src="/Zalmi Marketing Logo Black.webp"
                alt="The Zalmi Marketing Logo"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain block dark:hidden drop-shadow-[0_10px_25px_rgba(212,175,55,0.3)] transition-transform duration-500 hover:scale-105"
              />
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-foreground flex flex-col items-center justify-center px-2">
              <span>{content.introSection.headingPre}</span>
              <div className="h-[8em] sm:h-[4.5em] py-2 sm:py-4 overflow-visible my-2 w-full flex items-center justify-center">
                <ShortSlideDown
                  phrases={[
                    ["Discover", "Luxury", "Living"],
                    ["Premium", "DHA", "Homes"],
                    ["Your", "Dream", "Property"],
                    ["Elite", "Residential", "Estates"],
                  ]}
                  build={{ lineGapPx: 2, firstWordYPx: -2, entryOffsetYPx: -8 }}
                  className="inline-flex h-full w-full items-center justify-center text-center text-2xl sm:text-4xl md:text-5xl lg:text-6xl"
                  titleClassName="gold-text-gradient"
                />
              </div>
            </h2>
          </Reveal>
        </section>

        {/* 2. ShapeShifter Section */}
        <div className="relative z-10 w-full py-4 sm:py-8">
          <ShapeShifterSection />
        </div>

        {/* 3. Categories Section */}
        {categoriesSection?.items?.length > 0 && (
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="w-full">
              <CategoriesSection
                items={categoriesSection.items}
                heading={categoriesSection.heading}
                subheading={categoriesSection.subheading}
                className="my-0"
              />
            </Reveal>
          </section>
        )}

        {/* 4. Services Overview */}
        <div className="w-full relative z-10">
          <Reveal className="w-full">
            <ServicesOverviewSection />
          </Reveal>
        </div>

        {/* 5. Calculator Feature Announcement */}
        <div className="w-full relative z-10">
          <Reveal className="w-full">
            <CalculatorFeatureSection {...content.calculatorFeatureSection} />
          </Reveal>
        </div>
      </div>

      <CalculatorMobileCta />

      {/* Group 2 (Properties, Files, Investment Opportunities, How It Works) */}
      <div className="w-full relative overflow-x-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-60 dark:opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nNjAnIHZpZXdCb3g9JzAgMCA2MCA2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZyBmaWxsPSdub25lJyBmaWxsLXJ1bGU9J2V2ZW5vZGQnPjxnIGZpbGw9JyNEMEFGMzcnIGZpbGwtb3BhY2l0eT0nMC4xNic+PHBhdGggZD0nTTM2IDM0di00aC0ydi00aC00djJoNHY0aDJ2LTRoNHYyaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNHY0aC00di0yek02IDM0di00SDR2NGgtNHYyaDR2NGgydi00aDR2LTJINnptNi0zMFYwSDR2NGgtNHYyaDR2NGgyVjZoNHY0aC00di0yeicvPjwvZz48L2c+PC9zdmc+')] bg-repeat pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(212,175,55,0.18)_0%,transparent_50%,rgba(245,166,35,0.15)_100%)] pointer-events-none" />

        {/* Properties Section */}
        {propertiesSection?.items?.length > 0 && (
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="w-full max-w-7xl mx-auto">
              <FeaturedPropertiesSection
                items={propertiesSection.items}
                heading={propertiesSection.heading}
                subheading={propertiesSection.subheading}
              />
            </Reveal>
          </section>
        )}

        {/* File Properties Section */}
        {filePropertiesSection?.items?.length > 0 && (
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="relative z-10 w-full max-w-7xl mx-auto">
              <FeaturedFilesSection
                items={filePropertiesSection.items}
                heading={filePropertiesSection.heading}
                subheading={filePropertiesSection.subheading}
              />
            </Reveal>
          </section>
        )}

        {/* Investment Opportunities Section (Hidden on mobile screens) */}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto hidden md:block">
          <Reveal className="w-full max-w-7xl mx-auto">
            <InvestmentOpportunitiesSection />
          </Reveal>
        </section>
      </div>

      {/* Group 3 (3 Sections: Maps, How It Works, Reviews) */}
      <div className="w-full relative bg-background text-foreground py-0 overflow-visible">
        <div className="absolute inset-0 opacity-55 dark:opacity-28 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nODAnIGhlaWdodD0nODAnIHZpZXdCb3g9JzAgMCA4MCA4MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cGF0aCBkPSdNNDAgMGw0MCA0MC00MCA0MEwwIDQweiUnIGZpbGw9JyNEMEFGMzcnIGZpbGwtb3BhY2l0eT0nMC4xMicgZmlsbC1ydWxlPSdldmVub2RkJy8+PGNpcmNsZSBjeD0nNDAnIGN5PSc0MCcgcj0nMTUnIGZpbGw9J25vbmUnIHN0cm9rZT0nI0QwQUYzNycgc3Ryb2tlLW9wYWNpdHk9JzAuMjUnIHN0cm9rZS13aWR0aD0nMS41Jy8+PC9zdmc+')] bg-repeat pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,166,35,0.2),transparent_70%)] pointer-events-none" />

        {/* Maps Section */}
        {mapsSection?.items?.length > 0 && (
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="w-full max-w-7xl mx-auto">
              <FeaturedMapsSection
                items={mapsSection.items}
                heading={mapsSection.heading}
                subheading={mapsSection.subheading}
              />
            </Reveal>
          </section>
        )}

        {/* How It Works Section */}
        <div className="w-full relative bg-transparent text-foreground py-0 overflow-visible">
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <HowItWorksSection {...howItWorksSectionData} className={"my-0"} />
          </section>
        </div>

        {/* Reviews Section (Full Width) */}
        {reviews?.length > 0 && (
          <div className="w-full relative z-10">
            <Reveal className="w-full">
              <ReviewsSection reviews={reviews} className={"my-0"} />
            </Reveal>
          </div>
        )}

        {/* Featured Feature Section (Full Width, Fixed BG with Reviews) */}
        <div className="w-full relative z-10">
          <Reveal className="w-full">
            <FeaturedFeature />
          </Reveal>
        </div>
      </div>

      {/* Group 4 (2 Sections: Video, DHA Services) */}
      <div className="w-full relative overflow-hidden bg-background text-foreground py-0">
        <div className="absolute inset-0 opacity-80 dark:opacity-60 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGcgZmlsbD0nI0QwQUYzNycgZmlsbC1vcGFjaXR5PScwLjU1Jz48Y2lyY2xlIGN4PScyMCcgY3k9JzIwJyByPScyLjUnLz48Y2lyY2xlIGN4PS87MCcgY3k9JzMwJyByPScyJy8+PGNpcmNsZSBjeD0nNTAnIGN5PSc3MCcgcj0nMycvPjxjaXJjbGUgY3g9Jzg1JyBjeT0nODUnIHI9JzEuNScvPjxwYXRoIGQ9J00yMCAyMEw1MCA3ME04MCAzMEw1MCA3ME01MCA3MEw4NSA4NScgc3Ryb2tlPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgc3Ryb2tlLW9wYWNpdHk9JzAuNDUnIHN0cm9rZS13aWR0aD0nMS4yNScgZmlsbD0nbm9uZScvPjwvZz48L3N2Zz4=')] bg-repeat pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.35),transparent_70%)] pointer-events-none" />

        {/* Video Section */}
        {videoSection && videoToDisplay && (
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="w-full max-w-7xl mx-auto">
              <FeaturedVideoSection
                heading={videoSection.heading}
                subheading={videoSection.subheading}
                video={videoToDisplay}
              />
            </Reveal>
          </section>
        )}

        {/* DHA Services Section */}
        <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
          <Reveal className="w-full max-w-7xl mx-auto">
            <DhaServicesSection />
          </Reveal>
        </section>
      </div>

      {/* Group 5 (Why Choose Us, Personalized Experience) with DhaBirdseyeSection as Background */}
      <DhaBirdseyeSection>
        <div className="space-y-12 sm:space-y-20">
          {/* Why Choose Us Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="relative z-10 w-full max-w-7xl mx-auto">
              <WhyChooseUsSection />
            </Reveal>
          </section>

          {/* Personalized Experience */}
          <section className="w-full px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto">
            <Reveal className="w-full max-w-7xl mx-auto">
              <PersonalizedExperience
                cards={personalizedCards}
                className={"mx-auto"}
              />
            </Reveal>
          </section>
        </div>
      </DhaBirdseyeSection>

      {popupSection && (
        <Popup
          isVisible={popupSection.isVisible}
          title={popupSection.heading}
          description={popupSection.subheading}
          delayMs={(popupSection.delayMs || 5000) + 3000}
          mediaType={popupSection.mediaType}
          mediaPath={popupSection.mediaPath}
        />
      )}
    </main>
  );
}
