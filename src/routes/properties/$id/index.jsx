import { createFileRoute, notFound, Link } from '@tanstack/react-router'
import { GlobalHero } from '@/components/global/GlobalHero'

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import SmartImage from '@/components/global/SmartImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import ImageSlider from '@/components/property/ImageSlider'; // Import ImageSlider

import { Bed, Bath, AreaChart, MapPin } from 'lucide-react';

import { queryOptions } from '@tanstack/react-query'
import { fetchProperties, fetchProperty } from '@/lib/api'

const propertyQueryOptions = (id) =>
  queryOptions({
    queryKey: ['properties', id],
    queryFn: () => fetchProperty(id),
  });

const propertiesQueryOptions = () =>
  queryOptions({
    queryKey: ['properties'],
    queryFn: () => fetchProperties(),
  });


export const Route = createFileRoute('/properties/$id/')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const property = await queryClient.ensureQueryData(propertyQueryOptions(params.id))
    const properties = await queryClient.ensureQueryData(propertiesQueryOptions())
    if (!property || property.is_file) {
      throw notFound()
    }

    return { property, properties }
  },
  notFoundComponent: () => {
    return <p>Property not found</p>;
  },
})

function RouteComponent() {
  const { property, properties } = Route.useLoaderData();
  const { id } = Route.useParams();

  // Prepare images for ImageSlider
  const propertyImages = Array.isArray(property.images) ? property.images : (property.image ? [property.image] : []);

  // Filter out the current property and take the first 4 for the sidebar
  const featuredProperties = properties
    .filter((p) => p.id !== property.id && !p.is_file)
    .slice(0, 4);

  return (
    <div className="max-w-[1440px] mx-auto">
      <GlobalHero
        image={property.image}
        overlay={true}
        height='60vh'
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-7xl pt-6 px-4 text-white text-left mb-8"
      >
        <div>
          <h1 className="mb-2 text-5xl font-bold">{property.title}</h1>
          <div className="flex items-center gap-2">
                <MapPin className="text-white" />
                <span>{property.location}, {property.city}</span>
          </div>
        </div>
        
      </GlobalHero>
      <div className="px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <main className="lg:col-span-3">
            
            <ImageSlider images={propertyImages} /> 
            
            <div className="flex flex-wrap gap-2 mb-4">
              {property.badges?.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
            </div>
            
            <div className="mb-6 text-3xl font-bold text-amber-500">
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

            {/* Short Description */}
            {property.shortDescription && (
              <div className="p-6 mb-6 border-l-4 rounded-r-lg bg-muted border-primary">
                <p className="text-lg italic text-foreground/80">{property.shortDescription}</p>
              </div>
            )}

            {/* Features Section */}
            {property.features && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">Features</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-5 h-5 text-white rounded-full bg-primary">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Description */}
            {property.detailedDescription && (
              <div className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">Property Details</h2>
                <div className="prose max-w-none text-foreground/90">
                  <p>{property.detailedDescription}</p>
                </div>
              </div>
            )}
            
            {/* YouTube Video Section */}
            {property.youtubeEmbedLink && (
              <div className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">Video Tour</h2>
                <div className="overflow-hidden rounded-lg aspect-video">
                  <iframe 
                    src={property.youtubeEmbedLink}
                    title="Property Video Tour" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}
            
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1">
            {property.locationMap && ( 
              <div className="p-4 border rounded-lg">
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
            </div> )}

            <div className="hidden p-4 mt-8 border rounded-lg lg:block">
              <h3 className="mb-4 text-2xl font-bold">Contact Agent</h3>
              <ContactForm propertyTitle={property.title} />
            </div>

            <div className="p-4 mt-8 border rounded-lg">
              <h3 className="mb-4 text-2xl font-bold">Featured Properties</h3>
              <div>
                {featuredProperties.map((featured) => {
                  return (
                    <Link to={`/properties/${featured.id}`} key={featured.id} className="block pb-4 mb-4 border-b last:border-b-0 last:pb-0 last:mb-0">
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
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 digits.",
    }),
    message: z.string().min(10, {
      message: "Message must be at least 10 characters.",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'm interested in "${propertyTitle}"...`,
    },
  });

  function onSubmit(values) {
    console.log(values);
    toast.success("Your message has been sent successfully!");
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Your Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your Phone" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={`I'm interested in "${propertyTitle}"...`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Send Message</Button>
      </form>
    </Form>
  );
}