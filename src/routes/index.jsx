import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query'; // Import queryOptions
import { fetchHomeData } from "@/lib/api"; // Import fetchHomeData from your API

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import HeroSection from "@/components/home/HeroSection";
import CardSlider from "@/components/home/CardSlider";
import PersonalizedExperience from "@/components/home/PersonalizedExperience";
import CategoryCard from "@/components/home/CategoryCard";
import PropertyCard from "@/components/global/PropertyCard";
import CardGrid from "@/components/home/CardGrid";
import MapCard from "@/components/global/MapCard";
import ReviewsSection from "@/components/home/ReviewSection";
import HowItWorksSection from "@/components/home/HowItWorksSection"; // Import HowItWorksSection
import TextSection from "@/components/global/TextSection"; // Import TextSection

// Define query options for homepage data
const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['homeData'],
    queryFn: () => fetchHomeData(),
  });

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(homeQueryOptions()), // Use queryClient to fetch data
  component: RouteComponent,
});

function LinkedCategoryCard({ id, ...category }) { // Destructure id
  return (
    <Link to={`/properties?category=${id}&image=${encodeURIComponent(category.src)}&categoryName=${encodeURIComponent(category.title)}`}> {/* Use id for link */}
      <CategoryCard {...category} />
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

const pakistanRealEstateContent = {
  title: "Real Estate in Pakistan: Your Gateway to Opportunity",
  subtitle: "Explore the dynamic property market with Zalmi Marketing, your trusted partner across major cities.",
  content:
    "Pakistan's real estate sector is a rapidly growing industry, offering diverse investment opportunities from bustling urban centers to serene residential communities. Whether you're looking for commercial ventures, family homes, or strategic land investments, the market presents a wide spectrum of choices. Zalmi Marketing is at the forefront, providing unparalleled guidance and access to prime properties nationwide. We pride ourselves on connecting our clients with opportunities that match their aspirations and investment goals.",
  align: "center",
  maxWidth: "max-w-5xl",
};

const dhaServicesContent = {
  title: "DHA Phases: Unmatched Living and Investment",
  subtitle: "Zalmi Marketing specializes in DHA projects, offering comprehensive services in all major phases across Pakistan.",
  content: [
    "Defence Housing Authority (DHA) projects are synonymous with quality living, secure environments, and lucrative investment potential. Spread across Pakistan's key cities, DHA offers meticulously planned communities, state-of-the-art infrastructure, and a high standard of amenities. From residential plots and luxurious homes to commercial areas, DHA continues to be a top choice for discerning buyers and investors.",
    "Zalmi Marketing provides end-to-end services for all DHA-related needs. Our expertise covers buying, selling, and investment consultation for all phases in Lahore, Karachi, Islamabad, and other major cities. We ensure a seamless experience, guiding you through every step of your property journey with transparency and professionalism.",
  ],
  align: "left",
  columns: 2,
};

const servicesOverviewContent = {
  title: "Our Comprehensive Real Estate Services",
  subtitle: "From expert advisory to seamless transactions, Zalmi Marketing is your complete real estate solution.",
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
};

const investmentOpportunitiesContent = {
  title: "Investment Opportunities with Zalmi Marketing",
  subtitle: "Unlock potential with our curated investment options.",
  content: (
    <ul className="list-disc list-inside text-left space-y-2">
      <li><strong>High-Growth Areas:</strong> Access to prime locations with significant appreciation potential.</li>
      <li><strong>DHA Projects:</strong> Secure investments in Pakistan's most sought-after housing schemes.</li>
      <li><strong>Commercial Ventures:</strong> Explore lucrative commercial properties in strategic business hubs.</li>
      <li><strong>Expert Guidance:</strong> Receive personalized advice from seasoned real estate investment specialists.</li>
      <li><strong>Diversified Portfolio:</strong> Opportunities in residential plots, apartments, and commercial units.</li>
    </ul>
  ),
  align: "left",
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
  maxWidth: "max-w-3xl", // Using max-w-3xl for this one
};

const globalReachContent = {
  title: "Our Global Reach",
  subtitle: "Connecting you to opportunities beyond borders.",
  content: (
    <ul className="list-disc list-inside text-left space-y-2">
      <li><strong>International Investors:</strong> Facilitating property acquisition for overseas Pakistanis.</li>
      <li><strong>Partnerships:</strong> Collaborating with international real estate networks.</li>
      <li><strong>Online Presence:</strong> Reaching a global audience through digital platforms.</li>
      <li><strong>Expert Liaison:</strong> Bridging the gap for clients with international investment interests.</li>
    </ul>
  ),
  align: "left",
  variant: "dark",
  maxWidth: "max-w-4xl",
};

const clientTestimonialsContent = {
  title: "What Our Clients Say",
  subtitle: "Hear from those who've experienced the Zalmi difference.",
  content: (
    <>
      <p className="text-lg leading-relaxed italic mb-4">
        "Zalmi Marketing provided exceptional service. Their knowledge of DHA projects is unmatched, and they guided me to the perfect investment."
        <br />
        <span className="font-semibold not-italic">- Ayesha Khan, Investor</span>
      </p>
      <p className="text-lg leading-relaxed italic">
        "Selling my property through Zalmi Marketing was seamless and stress-free. Highly professional and efficient!"
        <br />
        <span className="font-semibold not-italic">- Ali Raza, Seller</span>
      </p>
    </>
  ),
  align: "center",
  variant: "dark",
  maxWidth: "max-w-3xl",
};


function RouteComponent() {
  const { properties, maps, categories, personalizedCards, reviews, fileProperties } = Route.useLoaderData(); // Get data from loader

  return (
    <main className="flex flex-col items-center justify-center w-full text-center max-w-[1440px] mx-auto min-h-screen">
      <HeroSection />

      <div className="max-w-3xl pt-8">
        <h2 className="text-4xl font-extrabold text-primary sm:text-5xl md:text-6xl">
          Your Trusted Partner in Real Estate
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          We specialize in marketing land files, housing society projects, and
          much more.
        </p>
      </div>

      {/* Real Estate in Pakistan Overview - Placed early */}
      <TextSection {...pakistanRealEstateContent} className={"my-8"} />

      <Card className="w-full max-w-md mt-12">
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription>
            Our new website is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are working hard to bring you an amazing online experience. Stay
            tuned for our launch.
          </p>
          <Button className="w-full mt-6">Notify Me</Button>
        </CardContent>
      </Card>

      <CardSlider items={categories} // Use fetched categories
              CardComponent={LinkedCategoryCard}
              autoScrollSpeed={0}
              loop={false}
              heading={null}
              subheading={null}
              breakpoints={{ default: 1, sm: 3, md: 4, lg: 5 }}
              customWidths={[{width:425, cards:2}]}
              showViewAll={false}
              className={"my-8"}/>
              
      <CardGrid items={categories}
              CardComponent={LinkedCategoryCard}
              heading="Explore Our Categories"
              subheading="Find properties based on your preferred category"
              showViewAll={true}
              viewAllHref="/properties"
              className={"my-8"}
              />

      <CardSlider items={maps} // Use fetched maps
              CardComponent={MapCard}
              autoScrollSpeed={0}
              loop={false}
              heading="Explore Our Maps"
              subheading="Find society maps and plot locations"
              breakpoints={{ default: 1, sm: 2, md: 3, lg: 4 }}
              showViewAll={true}
              viewAllHref="/maps"
              className={"my-8"}/>

      <PersonalizedExperience cards={personalizedCards} className={"px-4 md:px-6 mx-auto"}/> {/* Use fetched personalizedCards */}
      
      {/* Comprehensive Services Overview - Placed after PersonalizedExperience */}
      <TextSection {...servicesOverviewContent} className={"my-8"} />

      {/* How It Works Section */}
      <HowItWorksSection {...howItWorksSectionData} className={"my-8"} />

      <ReviewsSection reviews={reviews} />

      {/* DHA Services Section - Placed after ReviewsSection */}
      <TextSection {...dhaServicesContent} className={"my-8"} />

      <CardGrid items={fileProperties} // Use fetched file properties
        CardComponent={PropertyCard} // Non-clickable
        heading="Featured Files"
        subheading="Important documents and land files"
        showViewAll={true}
        viewAllHref="/files"
        maxItems={3}
        className={"my-8"}
        />

      <CardGrid items={properties} // Use fetched properties
        CardComponent={LinkedPropertyCard}
        heading="Featured Properties"
        subheading="Discover our hand-picked selection of properties"
        showViewAll={true}
        viewAllHref="/properties"
        className={"my-8"}
        />

      {/* Investment Opportunities Section - New Variant 1 */}
      <TextSection {...investmentOpportunitiesContent} className={"my-8"} />

      <CardSlider items={properties} // Use fetched properties
        CardComponent={LinkedPropertyCard}
        showViewAll={true}
        viewAllHref="/properties"
        className={"md:px-6 py-4 px-4"}/>

      {/* Why Choose Us Section - New Variant 2 */}
      <TextSection {...whyChooseUsContent} className={"my-8"} />

      {/* Global Reach Section - New Dark Variant 1 */}
      <TextSection {...globalReachContent} className={"my-8"} />

      {/* Client Testimonials Section - New Dark Variant 2 */}
      <TextSection {...clientTestimonialsContent} className={"my-8"} />

      <div className="flex flex-wrap justify-center gap-4 mt-12">
        <Button variant="default">Default Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="link">Link Button</Button>
      </div>

      <div className="flex flex-wrap justify-center gap-6 mt-12 mb-12">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms1" />
          <Label htmlFor="terms1">Default Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms2" checked />
          <Label htmlFor="terms2">Checked Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms3" disabled />
          <Label htmlFor="terms3">Disabled Checkbox</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms4" checked disabled />
          <Label htmlFor="terms4">Disabled & Checked Checkbox</Label>
        </div>
      </div>

    </main>
  );
}

