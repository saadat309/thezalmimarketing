import { createFileRoute, notFound, Link } from "@tanstack/react-router";
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import ImageSlider from "@/components/property/ImageSlider";
import { VideoPlayer } from "@/components/global/VideoPlayer";
import RichTextRenderer from "@/components/global/RichTextRenderer";
import NotFound from "@/components/global/NotFound";
import { motion } from "framer-motion";

import { Bed, Bath, AreaChart, MapPin, Loader2, MessageCircle, Home, CheckCircle2, ShieldCheck } from "lucide-react";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { fetchProperties, fetchProperty, submitQuery } from "@/lib/api";
import { getEmbedUrl, getAbsoluteUrl } from "@/lib/utils";

const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
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

  const allImages = Array.isArray(property.media)
    ? property.media.filter((m) => m.type === "image").map((img) => img.path)
    : [];

  const propertyVideo = Array.isArray(property.media)
    ? property.media.find((m) => m.type === "video")
    : null;

  const featuredProperties = properties
    .filter((p) => p.id !== property.id && !p.is_file)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground transition-colors duration-300">
      {/* Immersive Cinematic Hero Section matching other routes */}
      <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/25 dark:border-[#D4AF37]/25 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: `url('${property.image}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#F5A623]/15 dark:bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <Badge variant="outline" className="px-5 py-2 text-xs font-semibold tracking-wider text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full uppercase shadow-xl backdrop-blur-md">
              <Home className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline animate-pulse" /> Verified Property Listing
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold sm:text-5xl lg:text-6xl font-display tracking-tight text-white leading-tight">
            {property.title}
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-slate-300 text-base sm:text-lg">
            <MapPin className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" />
            <span>{property.location}, {property.city}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Content */}
          <main className="lg:col-span-8 space-y-8">
            <Reveal>
              <div className="overflow-hidden rounded-3xl border border-border shadow-2xl bg-card">
                <ImageSlider key={property.id} images={allImages} />
              </div>
            </Reveal>

            <Reveal className="flex flex-wrap gap-2">
              {property.badges?.map((badge, index) => (
                <Badge key={index} variant={badge.variant}>
                  {badge.label}
                </Badge>
              ))}
              {!!property.is_furnished && (
                <Badge variant="default">Furnished</Badge>
              )}
            </Reveal>

            <Reveal className="text-3xl sm:text-4xl font-extrabold font-display text-[#F5A623] dark:text-[#D4AF37]">
              {property.priceType === "rent" ? (
                <span>
                  {property.currency} {property.price.toLocaleString()}
                  <span className="text-lg font-normal text-muted-foreground ml-1">
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
                      <span className="ml-2 text-lg font-normal text-muted-foreground">
                        (Advance)
                      </span>
                    ) : (
                      <span className="text-lg font-normal text-muted-foreground ml-1">
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

            <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 p-6 rounded-3xl bg-card border border-border shadow-xl">
              {property.beds && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Bedrooms</span>
                    <span className="font-bold text-foreground text-base">{property.beds} Beds</span>
                  </div>
                </div>
              )}
              {property.baths && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Bathrooms</span>
                    <span className="font-bold text-foreground text-base">{property.baths} Baths</span>
                  </div>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 flex items-center justify-center text-[#F5A623] dark:text-[#D4AF37]">
                    <AreaChart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Area Size</span>
                    <span className="font-bold text-foreground text-base">
                      {property.area.toLocaleString()} {property.areaUnit}
                    </span>
                  </div>
                </div>
              )}
            </Reveal>

            {/* Short Description */}
            {property.shortDescription && (
              <Reveal className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl border-l-4 border-l-[#F5A623] dark:border-l-[#D4AF37]">
                <p className="text-base sm:text-lg italic text-foreground/90 font-light leading-relaxed">
                  {property.shortDescription}
                </p>
              </Reveal>
            )}

            {/* Features Section */}
            {property.features && property.features.length > 0 && (
              <Reveal className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6">
                <h2 className="text-2xl font-bold font-display text-foreground border-b border-border pb-3">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border border-border/60">
                      <div className="flex items-center justify-center w-6 h-6 text-slate-950 rounded-full bg-[#F5A623] dark:bg-[#D4AF37] shrink-0 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Detailed Description */}
            {property.detailedDescription && (
              <Reveal className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6">
                <h2 className="text-2xl font-bold font-display text-foreground border-b border-border pb-3">
                  Property Details & Overview
                </h2>
                <div className="prose max-w-none text-foreground/90 font-light leading-relaxed">
                  <RichTextRenderer
                    htmlContent={property.detailedDescription}
                  />
                </div>
              </Reveal>
            )}

            {/* Video Section */}
            {propertyVideo && (
              <Reveal className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl space-y-6">
                <h2 className="text-2xl font-bold font-display text-foreground border-b border-border pb-3">
                  Video Tour
                </h2>
                <div className="overflow-hidden rounded-2xl">
                  <VideoPlayer video={propertyVideo} />
                </div>
              </Reveal>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            {property.locationMap && (
              <Card className="p-6 bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 rounded-3xl shadow-xl space-y-4">
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" /> Location Map
                </h3>
                <div className="h-64 overflow-hidden rounded-2xl border border-border">
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
              </Card>
            )}

            <Card className="hidden p-6 bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 rounded-3xl shadow-xl space-y-6 lg:block">
              <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" /> Contact Agent
              </h3>
              <ContactForm
                propertyTitle={property.title}
                propertyId={property.id}
              />
            </Card>

            <Card className="p-6 bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 rounded-3xl shadow-xl space-y-6">
              <h3 className="font-display font-bold text-xl text-foreground">Featured Properties</h3>
              <div className="space-y-4">
                {featuredProperties.map((featured) => {
                  return (
                    <Link
                      to={`/properties/${featured.slug}`}
                      key={featured.id}
                      className="block pb-4 mb-4 border-b border-border last:border-b-0 last:pb-0 last:mb-0 group"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 overflow-hidden rounded-2xl shrink-0 border border-border">
                          <SmartImage
                            src={featured.image}
                            alt={featured.title}
                            ratio={1 / 1}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors truncate">
                            {featured.title}
                          </h4>
                          <p className="text-sm font-bold text-[#F5A623] dark:text-[#D4AF37]">
                            {featured.currency}{" "}
                            {featured.price.toLocaleString()}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {featured.badges
                              ?.slice(0, 2)
                              .map((badge, badgeIndex) => (
                                <Badge
                                  key={badgeIndex}
                                  variant={badge.variant}
                                  className="text-[10px] px-2 py-0.5"
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
            </Card>
          </aside>
        </div>
      </div>

      {/* Sticky Footer for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-background/95 backdrop-blur-xl border-t border-border lg:hidden shadow-2xl">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              size="lg"
              className="w-full h-14 text-base font-bold shadow-xl gap-3 amber-gradient-vibrant hover:opacity-95 text-slate-950 rounded-2xl"
            >
              <MessageCircle className="w-6 h-6" />
              Contact Agent for {property.title}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-card border-t border-border p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <DrawerHeader className="px-0 pb-4">
              <DrawerTitle className="text-2xl font-display font-bold">Contact Agent</DrawerTitle>
              <DrawerDescription>
                Fill out the form below to get in touch regarding this verified property.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-0 pb-6">
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

const formSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone too short"),
  message: z.string().min(10, "Message too short"),
});

function ContactForm({ propertyTitle, propertyId, className }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: `I'm interested in "${propertyTitle}"...`,
    },
  });

  const mutation = useMutation({
    mutationFn: submitQuery,
    onSuccess: () => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          'event_category': 'form',
          'event_label': 'property_page',
          'value': propertyTitle
        });
      }

      toast.success("Inquiry sent successfully!");

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
        className={`space-y-4 ${className}`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Ahmed Khan"
                  {...field}
                  disabled={mutation.isPending}
                  className="h-11 bg-background text-foreground rounded-xl border-border focus-visible:ring-[#F5A623]"
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
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="ahmed@example.com"
                  {...field}
                  disabled={mutation.isPending}
                  className="h-11 bg-background text-foreground rounded-xl border-border focus-visible:ring-[#F5A623]"
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
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+92 300 1234567"
                  {...field}
                  disabled={mutation.isPending}
                  className="h-11 bg-background text-foreground rounded-xl border-border focus-visible:ring-[#F5A623]"
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
              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Message"
                  {...field}
                  className="min-h-[120px] bg-background text-foreground rounded-xl border-border p-3 focus-visible:ring-[#F5A623]"
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-12 amber-gradient-vibrant hover:opacity-95 text-slate-950 font-bold rounded-xl shadow-lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Inquiry...
            </>
          ) : (
            "Submit Priority Inquiry"
          )}
        </Button>
      </form>
    </Form>
  );
}
