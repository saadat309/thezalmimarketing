import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query'; // Import queryOptions
import { fetchHomeData } from "@/lib/api"; // Import fetchHomeData from your API
import HeroSection from "@/components/home/HeroSection";
import FileMarquee from "@/components/home/FileMarquee";
import CardSlider from "@/components/home/CardSlider";
import PersonalizedExperience from "@/components/home/PersonalizedExperience";
import CategoryCard from "@/components/home/CategoryCard";
import PropertyCard from "@/components/global/PropertyCard";
import CardGrid from "@/components/home/CardGrid";
import MapCard from "@/components/global/MapCard";
import ReviewsSection from "@/components/home/ReviewSection";
import HowItWorksSection from "@/components/home/HowItWorksSection"; // Import HowItWorksSection
import TextSection from "@/components/global/TextSection"; // Import TextSection
import WhyUs from "@/components/global/WhyUs";
import { VideoPlayer } from "@/components/global/VideoPlayer";
import { motion } from "framer-motion";

// Define query options for homepage data
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
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()), // Use queryClient to fetch data
  component: RouteComponent,
});

function LinkedCategoryCard({ id, ...category }) { // Destructure id
  return (
    <Link to={`/properties?category=${category.title}&image=${encodeURIComponent(category.src)}&categoryName=${encodeURIComponent(category.title)}`}> {/* Use title for filtering as per current search logic */}
      <CategoryCard {...category} disableLink />
    </Link>
  );
}

function LinkedPropertyCard({ id, ...property }) {
  if (property.is_file) {
    return <PropertyCard {...property} />;
  }

  return (
    <Link to={`/properties/${id}`}>
      <PropertyCard {...property} />
    </Link>
  );
}

// Sample data for the HowItWorksSection
const howItWorksSectionData = {
  heading: "How It Works",
  subheading: "Simple steps to find your dream property",
  buttonText: "Get Started Now",
  buttonLink: "/properties",
  items: [
    {
      icon: "Search",
      title: "Explore Listings",
      description: "Browse through a wide range of properties tailored to your needs.",
    },
    {
      icon: "Lightbulb",
      title: "Get Expert Advice",
      description: "Connect with our experienced agents for personalized guidance.",
    },
    {
      icon: "Handshake",
      title: "Close the Deal",
      description: "Secure your desired property with our seamless process.",
    },
  ],
};



const dhaServicesContent = {
  title: "DHA Phases: Unmatched Living and Investment",
  subtitle: "Zalmi Marketing specializes in DHA projects, offering comprehensive services in all major phases across Pakistan.",
  content: [
    "Defence Housing Authority (DHA) projects are synonymous with quality living, secure environments, and lucrative investment potential. Spread across Pakistan's key cities, DHA offers meticulously planned communities, state-of-the-art infrastructure, and a high standard of amenities. From residential plots and luxurious homes to commercial areas, DHA continues to be a top choice for discerning buyers and investors.",
    "Zalmi Marketing provides end-to-end services for all DHA-related needs. Our expertise covers buying, selling, and investment consultation for all phases in Lahore, Karachi, Islamabad, and other major cities. We ensure a seamless experience, guiding you through every step of your property journey with transparency and professionalism.",
  ],
  align: "center",
  columns: 2,
};

const servicesOverviewContent = {
  title: "Our Comprehensive Real Estate Services",
  subtitle:
    "From expert advisory to seamless transactions, Zalmi Marketing is your complete real estate solution.",
  content: [
    "Property Buying & Selling: Navigate the market with confidence. We connect buyers with their ideal properties and help sellers achieve the best value for their assets.",
    "Investment Consultation: Maximize your returns with our expert investment strategies tailored to the Pakistani real estate landscape.",
    "DHA Project Specialization: In-depth knowledge and exclusive access to all DHA phases across Pakistan, ensuring prime opportunities.",
    "Land & Commercial Deals: Explore lucrative options in commercial properties and strategic land acquisitions.",
    "Documentation & Legal Support: Our team assists with all necessary paperwork and legalities, ensuring hassle-free transactions.",
    "After-Sales Support: Our commitment extends beyond the sale, providing continuous support and guidance.",
  ],
  align: "center",
  columns: 2,
  maxWidth: "max-w-6xl",
  borderPosition: "left",
};

const investmentOpportunitiesContent = {
  title: "Investment Opportunities with Zalmi Marketing",
  subtitle: "Unlock potential with our curated investment options.",
  content: (
    <ul className="space-y-2 text-left list-disc list-inside">
      <li><strong>High-Growth Areas:</strong> Access to prime locations with significant appreciation potential.</li>
      <li><strong>DHA Projects:</strong> Secure investments in Pakistan's most sought-after housing schemes.</li>
      <li><strong>Commercial Ventures:</strong> Explore lucrative commercial properties in strategic business hubs.</li>
      <li><strong>Expert Guidance:</strong> Receive personalized advice from seasoned real estate investment specialists.</li>
      <li><strong>Diversified Portfolio:</strong> Opportunities in residential plots, apartments, and commercial units.</li>
    </ul>
  ),
  align: "center",
  maxWidth: "max-w-4xl", // Using max-w-4xl for this one
};

const whyChooseUsContent = {
  title: "Why Choose Zalmi Marketing?",
  subtitle: "Experience the difference of dedicated real estate services.",
  content: (
    <p className="text-lg leading-relaxed">
      At <strong>Zalmi Marketing</strong>, we are more than just real estate agents; we are your trusted partners in building a prosperous future. Our commitment to <strong>transparency</strong>, <strong>professionalism</strong>, and <strong>client satisfaction</strong> sets us apart. With an in-depth understanding of the Pakistani real estate market, especially DHA projects, we guarantee a seamless and rewarding experience. Choose us for unparalleled expertise and dedicated support every step of the way.
    </p>
  ),
  align: "center",
  variant: "dark",
  maxWidth: "max-w-5xl", // Using max-w-5xl for this one
};






function RouteComponent() {
  const { 
    propertiesSection, 
    mapsSection, 
    categoriesSection, 
    personalizedCards, 
    reviews, 
    filePropertiesSection, 
    videoSection,
    allFileProperties
  } = Route.useLoaderData(); // Get data from loader

  const videoToDisplay = videoSection 
    ? (videoSection.videoInputMethod === 'upload' 
        ? { path: videoSection.videoMedia?.[0]?.path } 
        : { video_embed_link: videoSection.videoEmbedLink })
    : null;

  return (
    <main className="flex flex-col items-center justify-center w-full text-center max-w-[1440px] mx-auto min-h-screen">
      <HeroSection />
      <FileMarquee items={allFileProperties} />
      
      <Reveal className="max-w-3xl pt-8">
        <h2 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
          Your Trusted Partner in Real Estate
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          We specialize in marketing land files, housing society projects, and
          much more.
        </p>
      </Reveal>

      {categoriesSection?.items?.length > 0 && (
        <Reveal className="w-full py-8">
          <CardSlider
            items={categoriesSection.items} // Use fetched categories
            CardComponent={LinkedCategoryCard}
            autoScrollSpeed={0}
            loop={false}
            heading={categoriesSection.heading}
            subheading={categoriesSection.subheading}
            breakpoints={{ default: 1, sm: 3, md: 4, lg: 5 }}
            customWidths={[{ width: 425, cards: 2 }]}
            showViewAll={false}
            className={"my-8"}
          />
        </Reveal>
      )}

      <Reveal>
        <TextSection {...servicesOverviewContent} className={"my-8"} />
      </Reveal>

      {propertiesSection?.items?.length > 0 && (
        <Reveal className="w-full py-8 bg-primary text-primary-foreground">
          <CardSlider
            items={propertiesSection.items} // Use fetched properties
            CardComponent={LinkedPropertyCard}
            heading={propertiesSection.heading}
            subheading={propertiesSection.subheading}
            showViewAll={true}
            viewAllHref="/properties"
            className={"md:px-6 py-4 px-4"}
            subheadingClassName="text-white/80"
          />
        </Reveal>
      )}

      <Reveal>
        <HowItWorksSection {...howItWorksSectionData} className={"my-8"} />
      </Reveal>

      {filePropertiesSection?.items?.length > 0 && (
        <Reveal className="w-full py-8 bg-primary">
          <CardGrid
            items={filePropertiesSection.items} // Use fetched file properties
            CardComponent={PropertyCard} // Non-clickable
            heading={filePropertiesSection.heading}
            subheading={filePropertiesSection.subheading}
            showViewAll={true}
            viewAllHref="/files"
            maxItems={filePropertiesSection.items.length}
            headingClassName="text-white text-4xl"
            subheadingClassName="text-white text-lg"
          />
        </Reveal>
      )}

      {mapsSection?.items?.length > 0 && (
        <Reveal className="w-full py-8 bg-primary">
          <CardGrid
            items={mapsSection.items}
            CardComponent={MapCard}
            heading={mapsSection.heading}
            subheading={mapsSection.subheading}
            showViewAll={true}
            viewAllHref="/maps"
            maxItems={mapsSection.items.length}
            headingClassName="text-white text-4xl"
            subheadingClassName="text-white text-lg"
          />
        </Reveal>
      )}

      <Reveal>
        <TextSection {...investmentOpportunitiesContent} className={"my-8"} />
      </Reveal>

      {reviews?.length > 0 && (
        <Reveal>
          <ReviewsSection reviews={reviews} />
        </Reveal>
      )}

      {videoSection && videoToDisplay && (
        <Reveal className="w-full px-4 mx-auto my-8">
            <h2 className="mb-4 text-3xl font-bold">{videoSection.heading}</h2>
            <p className="mb-8 text-lg text-muted-foreground">{videoSection.subheading}</p>
            <VideoPlayer video={videoToDisplay} />
        </Reveal>
      )}

      {/* DHA Services Section - */}
      <Reveal>
        <TextSection {...dhaServicesContent} className={"my-8"} />
      </Reveal>

      {/* Why Choose Us Section - New Variant 2 */}
      <Reveal>
        <TextSection {...whyChooseUsContent} className={"my-8"} />
      </Reveal>

      <Reveal>
        <PersonalizedExperience
          cards={personalizedCards}
          className={"px-4 md:px-6 mx-auto"}
        />
      </Reveal>
    </main>
  );
}

