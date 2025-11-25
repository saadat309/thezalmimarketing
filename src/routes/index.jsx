import { createFileRoute, Link } from "@tanstack/react-router";

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
import MapCard from "@/components/global/MapCard";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const propertyCardVariants = [
  {
    title: "Modern Luxury Villa with Pool",
    price: 25000000,
    priceType: "sale",
    currency: "Rs",
    location: "DHA Phase 5",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 5,
    baths: 4,
    area: 4500,
    areaUnit: "sqft",
    propertyType: "Villa",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    isVisible: true,
    badges: [
      { label: "For Sale", variant: "sale" },
      { label: "Premium", variant: "secondary" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
    title: "Cozy 2-Bed Apartment",
    price: 85000,
    priceType: "rent",
    currency: "Rs",
    location: "Gulberg",
    city: "Lahore",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 2,
    baths: 2,
    area: 1200,
    areaUnit: "sqft",
    propertyType: "Apartment",
    badges: [
      { label: "For Rent", variant: "rent" },
      { label: "Furnished", variant: "secondary" },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7",
    title: "Commercial Plaza Space",
    price: 45000000,
    priceType: "sale",
    currency: "Rs",
    originalPrice: 50000000,
    location: "Blue Area",
    city: "Islamabad",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    area: 8000,
    areaUnit: "sqft",
    propertyType: "Commercial",
badges: [{ label: "For Sale", variant: "sale" }, { label: "Discounted", variant: "discounted" }, { label: "Investment", variant: "outline" }]
  },
  {
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
    title: "Luxury Penthouse Suite",
    price: 150000,
    priceType: "rent",
    currency: "Rs",
    location: "Clifton",
    city: "Karachi",
    locationMap:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108879.79153579057!2d74.22606518174483!3d31.52834570076263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107af%3A0x8610bd995cbf76c6!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1701725064893!5m2!1sen!2s",
    beds: 3,
    baths: 3,
    area: 2200,
    areaUnit: "sqft",
    propertyType: "Penthouse",
    badges: [
      { label: "Rent", variant: "rent" },
      { label: "Luxury", variant: "featured" },
      { label: "Sea View", variant: "default" },
    ],
  },
];

const categoryCardData = [

  {

    title: 'Houses',

    count: 120,

    src: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be',

  },

  {

    title: 'Apartments',

    count: 80,

    src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',

  },

  {

    title: 'Villas',

    count: 45,

    src: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914',

  },

  {

    title: 'Commercial',

    count: 60,

    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',

  },

  {

    title: 'Plots',

    count: 70,

    src: 'https://images.unsplash.com/photo-1509315811345-67de0a30c7b4',

  },

    {

      title: 'Land Files',

      count: 30,

      src: 'https://images.unsplash.com/photo-1583522265352-c8402e82f8fd',

    },

  ];

  

  const mapsData = [

    {

      title: "Phase 8 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

    {

      title: "Phase 7 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

    {

      title: "Phase 6 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

    {

      title: "Phase 5 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

    {

      title: "Phase 6 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

    {

      title: "Phase 7 Map",

      thumb: "/maps/thumbs/PHASE_8_Map.webp",

      pdfPath: "/maps/PHASE_8_Map.pdf",

      description: "Description and metadata about this map.",

    },

  ];

function LinkedCategoryCard(category) {
  return (
    <Link to="/properties">
      <CategoryCard {...category} />
    </Link>
  );
}

function LinkedPropertyCard(property) {
  // Find the index of the current property in the main array to generate a matching ID
  const index = propertyCardVariants.findIndex(p => p.title === property.title && p.price === property.price);
  const id = `${property.title.toLowerCase().replace(/\s+/g, '-')}-${index}`;

  if (index === -1) {
    // Fallback for safety, though it shouldn't happen
    return <PropertyCard {...property} />;
  }

  return (
    <Link to={`/properties/${id}`}>
      <PropertyCard {...property} />
    </Link>
  );
}

function RouteComponent() {
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

      <CardSlider
              items={categoryCardData}
              CardComponent={LinkedCategoryCard}
              autoScrollSpeed={0}
              loop={false}
              heading="Explore Our Categories"
              subheading="Find properties based on your preferred category"
              breakpoints={{ default: 1, sm: 3, md: 4, lg: 5 }}
              customWidths={[{width:425, cards:2}]}
              showViewAll={false}
              className={"my-8"}
            />
    
      <CardSlider
              items={mapsData}
              CardComponent={MapCard}
              autoScrollSpeed={0}
              loop={false}
              heading="Explore Our Maps"
              subheading="Find society maps and plot locations"
              breakpoints={{ default: 1, sm: 2, md: 3, lg: 4 }}
              showViewAll={true}
              viewAllHref="/maps"
              className={"my-8"}
            />

      {/* Data for PersonalizedExperience component */}
            <PersonalizedExperience cards={[
              {
                title: "Looking for the new home?",
                description: "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
                buttonText: "Get Started",
                buttonLink: "/properties", // Example link
                imagePath: "/house1.svg",
                backgroundColor: "bg-[var(--tea-green)]"
              },
              {
                title: "Want to sell your home?",
                description: "10 new offers every day. 350 offers on site, trusted by a community of thousands of users.",
                buttonText: "Get Started",
                buttonLink: "/contact", // Example link
                imagePath: "/house2.svg",
                backgroundColor: "bg-[var(--ash-grey)]"
              },
            ]} className={"px-4 md:px-6 mx-auto"}/>
            
            
      <CardSlider 
        items={propertyCardVariants} 
        CardComponent={LinkedPropertyCard} 
        className={"md:px-6 py-4 px-4"}
      />     
            
                  


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

