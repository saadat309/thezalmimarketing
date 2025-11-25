import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { GlobalHero } from '@/components/global/GlobalHero'
import { propertyCardVariants } from '..'
import SmartImage from '@/components/global/SmartImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Bed, Bath, AreaChart, MapPin } from 'lucide-react';

export const Route = createFileRoute('/properties/$id/')({
  component: RouteComponent,
  loader: ({ params }) => {
    const property = propertyCardVariants.find((p, index) => {
      const slug = `${p.title.toLowerCase().replace(/\s+/g, '-')}-${index}`;
      return slug === params.id;
    });

    if (!property) {
      throw notFound();
    }
    return { property };
  },
  notFoundComponent: () => {
    return <p>Property not found</p>;
  },
})

function RouteComponent() {
  const { property } = Route.useLoaderData();
  const { id } = Route.useParams();

  // Filter out the current property and take the first 4 for the sidebar
  const featuredProperties = propertyCardVariants
    .filter((p, index) => {
      const slug = `${p.title.toLowerCase().replace(/\s+/g, '-')}-${index}`;
      return slug !== id;
    })
    .slice(0, 4);

  return (
    <div>
      <GlobalHero
        image={property.image}
        overlay={true}
        height='60vh'
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-7xl pt-6 px-4 text-white text-left mb-8"
      >
        <div>
          <h1 className="text-5xl font-bold">{property.title}</h1>
          <p className="text-xl">{`${property.location}, ${property.city}`}</p>
        </div>
      </GlobalHero>
      <div className="container py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <h2 className="mb-4 text-3xl font-bold">{property.title}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {property.badges?.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
            <div className="mb-6 text-3xl font-light text-primary">
              {property.currency} {property.price.toLocaleString()}
              {property.priceType === 'rent' && ' / month'}
              {property.priceType === 'installment' && ` / ${property.installmentPeriod}`}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
              {property.beds && (
                <div className="flex items-center gap-2">
                  <Bed className="text-primary" />
                  <span>{property.beds} Beds</span>
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-2">
                  <Bath className="text-primary" />
                  <span>{property.baths} Baths</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-2">
                  <AreaChart className="text-primary" />
                  <span>{property.area.toLocaleString()} {property.areaUnit}</span>
                </div>
              )}
            </div>

            <p className="mb-6 text-lg">{property.description || "No description available."}</p>
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1">
            <div className="p-4 border rounded-lg">
              <h3 className="mb-4 text-2xl font-bold">Location</h3>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-primary" />
                <span>{property.location}, {property.city}</span>
              </div>
              {property.locationMap && (
                <div className="h-64 overflow-hidden rounded-lg">
                  <iframe
                    src={property.locationMap}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              )}
            </div>

            <div className="hidden p-4 mt-8 border rounded-lg lg:block">
              <h3 className="mb-4 text-2xl font-bold">Contact Agent</h3>
              <ContactForm propertyTitle={property.title} />
            </div>

            <div className="p-4 mt-8 border rounded-lg">
              <h3 className="mb-4 text-2xl font-bold">Featured Properties</h3>
              <div>
                {featuredProperties.map((featured, index) => {
                  const featuredId = `${featured.title.toLowerCase().replace(/\s+/g, '-')}-${propertyCardVariants.indexOf(featured)}`;
                  return (
                    <Link to={`/properties/${featuredId}`} key={index} className="block pb-4 mb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
                      <div className="flex gap-4 group">
                        <div className='object-cover w-24 h-24 overflow-hidden rounded-lg'>
                          <SmartImage
                          src={featured.image}
                          alt={featured.title}
                          ratio={1/1}
                          className='object-cover rounded-lg'
                        />
                        </div>
                        
                        <div>
                          <h4 className="font-semibold group-hover:text-primary">{featured.title}</h4>
                          <p className="text-sm text-primary">{featured.currency} {featured.price.toLocaleString()}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {featured.badges?.slice(0, 2).map((badge, badgeIndex) => (
                              <Badge key={badgeIndex} variant={badge.variant} className="text-xs">
                                {badge.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 lg:hidden">
        <Drawer>
            <DrawerTrigger asChild>
                <Button className="w-full text-white bg-green-500">Contact Agent</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Contact Agent</DrawerTitle>
                    <DrawerDescription>Fill out the form below to get in touch.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    <ContactForm propertyTitle={property.title} />
                </div>
            </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}

function ContactForm({ propertyTitle, className }) {
  return (
    <form className={`space-y-4 ${className}`}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your Name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Your Email" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" placeholder="Your Phone" />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder={`I'm interested in "${propertyTitle}"...`}
          />
        </div>
        <Button type="submit" className="w-full">Send Message</Button>
    </form>
  );
}