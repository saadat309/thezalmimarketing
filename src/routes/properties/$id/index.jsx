import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";

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

import SmartImage from "@/components/global/SmartImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import ImageSlider from "@/components/property/ImageSlider"; // Import ImageSlider
import { VideoPlayer } from "@/components/global/VideoPlayer";
import RichTextRenderer from "@/components/global/RichTextRenderer";
import NotFound from "@/components/global/NotFound";
import { motion } from "framer-motion";

import { Bed, Bath, AreaChart, MapPin, Loader2, MessageCircle } from "lucide-react";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { fetchProperties, fetchProperty, submitQuery } from "@/lib/api";
import { getEmbedUrl, getAbsoluteUrl } from "@/lib/utils";
const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const propertyQueryOptions = (id) =>
  queryOptions({
    queryKey: ["properties", id],
    queryFn: () => fetchProperty(id),
  });

const propertiesQueryOptions = () =>
  queryOptions({
    queryKey: ["properties"],
    queryFn: () => fetchProperties(),
  });

export const Route = createFileRoute("/properties/$id/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) => {
    const property = await queryClient.ensureQueryData(
      propertyQueryOptions(params.id)
    );
    const properties = await queryClient.ensureQueryData(
      propertiesQueryOptions()
    );
    if (!property || property.is_file) {
      throw notFound();
    }

    return { property, properties };
  },
  head: ({ loaderData }) => {
  if (!loaderData) return {};
  const { property } = loaderData;

  const title = `${property.title} in ${property.location}, ${property.city} | The Zalmi Marketing`;
  const description =
    property.shortDescription ||
    `View details for ${property.title} located in ${property.location}, ${property.city}. Verified listing by The Zalmi Marketing.`;

  const imageUrl = getAbsoluteUrl(property.image);
  const pageUrl = `https://thezalmimarketing.com/properties/${property.slug}/`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "keywords",
        content: `${property.title}, property in ${property.city}, ${property.location}, real estate Pakistan`,
      },

      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: imageUrl },
      { property: "og:url", content: pageUrl },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: pageUrl },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],

    links: [
      {
        rel: "canonical",
        href: pageUrl,
      },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: property.title,
          description: description,
          image: imageUrl,
          offers: {
            "@type": "Offer",
            priceCurrency: "PKR",
            price: property.price,
            availability: "https://schema.org/InStock",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://thezalmimarketing.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Properties",
              "item": "https://thezalmimarketing.com/properties/"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": property.title,
              "item": pageUrl
            }
          ]
        }),
      },
    ],
  };
  },
  notFoundComponent: NotFound,
});

function RouteComponent() {
  const { property, properties } = Route.useLoaderData();
  const { id } = Route.useParams();

  // Prepare images for ImageSlider
  const propertyImages = Array.isArray(property.media)
    ? property.media.filter((m) => m.type === "image" && !m.isPrimary)
    : [];

  // If no separate gallery images, we might want to include the primary one too,
  // but usually ImageSlider shows the gallery.
  // Let's pass all images to ImageSlider for a better experience.
  const allImages = Array.isArray(property.media)
    ? property.media.filter((m) => m.type === "image").map((img) => img.path)
    : [];

  const propertyVideo = Array.isArray(property.media)
    ? property.media.find((m) => m.type === "video")
    : null;

  // Filter out the current property and take the first 4 for the sidebar
  const featuredProperties = properties
    .filter((p) => p.id !== property.id && !p.is_file)
    .slice(0, 4);

  return (
    <div>
      <GlobalHero
        image={property.image}
        overlay={true}
        height="60vh"
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-[1440px] pt-6 px-4 md:px-10 text-white text-left mb-8"
      >
        <div>
          <h1 className="mb-2 text-2xl md:text-5xl font-bold">{property.title}</h1>
          <div className="flex items-center gap-2">
            <MapPin className="text-white" />
            <span>
              {property.location}, {property.city}
            </span>
          </div>
        </div>
      </GlobalHero>
      <div className="px-4 md:px-10 py-8 mx-auto max-w-[1440px]">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Main Content */}
          <main className="lg:col-span-3">
            <Reveal>
              <ImageSlider key={property.id} images={allImages} />
            </Reveal>

            <Reveal className="flex flex-wrap gap-2 mt-4 mb-4">
              {property.badges?.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
              {!!property.is_furnished && (
                <Badge variant="default">Furnished</Badge>
              )}
            </Reveal>

            <Reveal className="mb-6 text-3xl font-bold text-amber-500">
              {property.priceType === "rent" ? (
                <span>
                  {property.currency} {property.price.toLocaleString()}
                  <span className="text-xl font-normal text-muted-foreground">
                    /
                    {property.installmentPeriod ||
                      property.price_period_unit ||
                      "month"}
                  </span>
                </span>
              ) : property.priceType === "installment" ? (
                <div className="flex flex-col gap-1">
                  <span>
                    {property.currency}{" "}
                    {(property.installment_display_mode === "advance"
                      ? property.installment_advance_amount
                      : property.installment_amount || property.price
                    ).toLocaleString()}
                    {property.installment_display_mode === "advance" ? (
                      <span className="ml-2 text-xl font-normal text-muted-foreground">
                        (Advance)
                      </span>
                    ) : (
                      <span className="text-xl font-normal text-muted-foreground">
                        /
                        {property.installmentPeriod ||
                          property.price_period_unit ||
                          "month"}
                      </span>
                    )}
                  </span>
                  {property.installment_total_period_text && (
                    <span className="text-sm font-normal text-muted-foreground">
                      Total Period: {property.installment_total_period_text}
                    </span>
                  )}
                </div>
              ) : (
                <span>
                  {property.currency} {property.price.toLocaleString()}
                </span>
              )}
            </Reveal>

            <Reveal className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
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
                  <span>
                    {property.area.toLocaleString()} {property.areaUnit}
                  </span>
                </div>
              )}
            </Reveal>

            {/* Short Description */}
            {property.shortDescription && (
              <Reveal className="p-6 mb-6 border-l-4 rounded-r-lg bg-muted border-primary">
                <p className="text-lg italic text-foreground/80">
                  {property.shortDescription}
                </p>
              </Reveal>
            )}

            {/* Features Section */}
            {property.features && property.features.length > 0 && (
              <Reveal className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">
                  Features
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-5 h-5 text-white rounded-full bg-primary shrink-0">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Detailed Description */}
            {property.detailedDescription && (
              <Reveal className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">
                  Property Details
                </h2>
                <div className="prose max-w-none text-foreground/90">
                  <RichTextRenderer
                    htmlContent={property.detailedDescription}
                  />
                </div>
              </Reveal>
            )}

            {/* Video Section */}
            {propertyVideo && (
              <Reveal className="mb-8">
                <h2 className="pb-2 mb-4 text-3xl font-bold border-b">
                  Video Tour
                </h2>
                <VideoPlayer video={propertyVideo} />
              </Reveal>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-1">
            {property.locationMap && (
              <Reveal className="p-4 border rounded-lg">
                <div className="h-64 overflow-hidden rounded-lg">
                  <iframe
                    src={getEmbedUrl(property.locationMap)}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </Reveal>
            )}

            <Reveal className="hidden p-4 mt-8 border rounded-lg lg:block">
              <h3 className="mb-4 text-2xl font-bold">Contact Agent</h3>
              <ContactForm
                propertyTitle={property.title}
                propertyId={property.id}
              />
            </Reveal>

            <Reveal className="p-4 mt-8 border rounded-lg">
              <h3 className="mb-4 text-2xl font-bold">Featured Properties</h3>
              <div>
                {featuredProperties.map((featured) => {
                  return (
                    <Link
                      to={`/properties/${featured.slug}`}
                      key={featured.id}
                      className="block pb-4 mb-4 border-b last:border-b-0 last:pb-0 last:mb-0"
                    >
                      <div className="flex gap-4 group">
                        <div className="w-24 h-24 overflow-hidden rounded-lg shrink-0">
                          <SmartImage
                            src={featured.image}
                            alt={featured.title}
                            ratio={1 / 1}
                            className="object-cover rounded-lg"
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold group-hover:text-primary">
                            {featured.title}
                          </h4>
                          <p className="text-sm text-primary">
                            {featured.currency}{" "}
                            {featured.price.toLocaleString()}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {featured.badges
                              ?.slice(0, 2)
                              .map((badge, badgeIndex) => (
                                <Badge
                                  key={badgeIndex}
                                  variant={badge.variant}
                                  className="text-xs"
                                >
                                  {badge.label}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-4 lg:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold shadow-xl gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <MessageCircle className="w-6 h-6" />
              Contact Agent
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Contact Agent</DrawerTitle>
              <DrawerDescription>
                Fill out the form below to get in touch.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <ContactForm
                propertyTitle={property.title}
                propertyId={property.id}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

function ContactForm({ propertyTitle, propertyId, className }) {
  const formSchema = z.object({
    name: z.string().min(2, "Name too short"),

    email: z.string().email("Invalid email"),

    phone: z.string().min(10, "Phone too short"),

    message: z.string().min(10, "Message too short"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: submitQuery,

    onSuccess: () => {
      toast.success("Sent successfully!");

      form.reset({
        name: "",
        email: "",
        phone: "",
        message: `I'm interested in "${propertyTitle}"...`,
      });
    },

    onError: (e) => toast.error(e.message || "Failed to send"),
  });

  const onSubmit = (v) => mutation.mutate({ ...v, property_id: propertyId });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-3 ${className}`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Name"
                  {...field}
                  disabled={mutation.isPending}
                />
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
              <FormControl>
                <Input
                  type="email"
                  placeholder="Email"
                  {...field}
                  disabled={mutation.isPending}
                />
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
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Phone"
                  {...field}
                  disabled={mutation.isPending}
                />
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
              <FormControl>
                <Textarea
                  placeholder="Message"
                  {...field}
                  className="min-h-[150px]"
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </Form>
  );
}
