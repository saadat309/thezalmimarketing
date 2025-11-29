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
      
      <ReviewsSection reviews={reviews} />

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

      <CardSlider items={properties} // Use fetched properties
        CardComponent={LinkedPropertyCard}
        showViewAll={true}
        viewAllHref="/properties"
        className={"md:px-6 py-4 px-4"}/>

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

