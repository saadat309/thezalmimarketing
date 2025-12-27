import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
import { User, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FaFacebook, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { submitQuery } from "@/lib/api";
import { motion } from "framer-motion";

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | The Zalmi Marketing Lahore - Real Estate Services" },
      {
        name: "description",
        content:
          "Get in touch with The Zalmi Marketing in DHA Lahore. Contact us for property inquiries, DHA Lahore investment advice, and real estate services in Pakistan.",
      },
      {
        name: "keywords",
        content: "Contact Zalmi Marketing, Real Estate Office Lahore, DHA Lahore Phase 6 Office, Property Inquiry Lahore",
      },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://thezalmimarketing.com/contact" },
      { property: "og:title", content: "Contact Us | The Zalmi Marketing" },
      { property: "og:description", content: "Get in touch with The Zalmi Marketing for property inquiries and investment advice." },
      { property: "og:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://thezalmimarketing.com/contact" },
      { name: "twitter:title", content: "Contact Us | The Zalmi Marketing" },
      { name: "twitter:description", content: "Get in touch with The Zalmi Marketing for property inquiries and investment advice." },
      { name: "twitter:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
    ],
    scripts: [
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
              "name": "Contact Us",
              "item": "https://thezalmimarketing.com/contact"
            }
          ]
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <GlobalHero
        image="/images/purchase-3113198_1280.jpg"
        overlay
        height="60vh"
      >
        <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white break-all sm:text-5xl lg:text-6xl">
          Contact Us
        </h1>
      </GlobalHero>
      <Contact />
    </div>
  );
}

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy.",
  }),
});


function Contact() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      agreedToPrivacy: false,
    },
  });

  const mutation = useMutation({
    mutationFn: submitQuery,
    onSuccess: () => {
      // Manually trigger lead event for GA4/Google Ads
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          'event_category': 'form',
          'event_label': 'contact_page'
        });
      }
      toast.success("Your inquiry has been sent successfully!");
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send inquiry. Please try again later.");
    },
  });

  function onSubmit(values) {
    const { firstName, lastName, ...rest } = values;
    mutation.mutate({
      name: `${firstName} ${lastName}`,
      ...rest,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Right Column - Owner Image (now first in source order for mobile-first) */}
          <Reveal className="relative order-1 lg:order-2">
            <div className="overflow-hidden shadow-lg rounded-2xl">
              <img
                src="/owner pic.jpg"
                alt="Owner - The Zalmi Marketing"
                className="h-[600px] w-full object-cover"
              />
            </div>
          </Reveal>

          {/* Left Column - Form (now second in source order for mobile-first) */}
          <Reveal className="order-2 space-y-8 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-tight text-foreground lg:text-4xl">
                Get In Touch About
                <br />
                Your Property Needs
              </h1>
              <p className="leading-relaxed text-muted-foreground">
                Whether you&#39;re interested in buying, selling, renting, or just have questions about our listings—our real estate experts are here to help you every step of the way.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                            <Input
                              placeholder="First Name"
                              {...field}
                              className="h-12 pl-10 border-border bg-card"
                              disabled={mutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                            <Input
                              placeholder="Last Name"
                              {...field}
                              className="h-12 pl-10 border-border bg-card"
                              disabled={mutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                          <Input
                            placeholder="Phone No"
                            type="tel"
                            {...field}
                            className="h-12 pl-10 border-border bg-card"
                            disabled={mutation.isPending}
                          />
                        </div>
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
                        <div className="relative">
                          <Mail className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                          <Input
                            placeholder="Email"
                            type="email"
                            {...field}
                            className="h-12 pl-10 border-border bg-card"
                            disabled={mutation.isPending}
                          />
                        </div>
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
                          placeholder="Your message (e.g. property type, location, budget, or any questions)"
                          {...field}
                          className="resize-none border-border bg-card min-h-32"
                          disabled={mutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreedToPrivacy"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={mutation.isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I have read and agree to the{" "}
                          <Link to="/privacy-policy" className="underline">
                            privacy policy
                          </Link>
                        </FormLabel>
                      </div>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                

                <Button type="submit" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Your Inquiry"
                  )}
                </Button>
              </form>
            </Form>
          </Reveal>
        </div>
        <Reveal className="mt-16">
          <ContactInformation />
        </Reveal>
      </div>
    </div>
  );
};

function ContactInformation() {
    const socialLinks = [
        { name: "Facebook", href: "https://www.facebook.com/share/182ygLHmct/", icon: FaFacebook },
        { name: "Tiktok", href: "https://www.tiktok.com/@thezalmimarketingdha?_r=1&_t=ZS-922kJzik3lf", icon: FaTiktok },
        { name: "Youtube", href: "https://youtube.com/@thezalmimarketing?si=vDrnNAQ9pl9y1DU_", icon: FaYoutube },
        { name: "Whatsapp", href: "https://wa.me/923218446496", icon: FaWhatsapp },
    ];

    const contactDetails = [
        {
            name: "Our Office",
            value: "67MB Commercial, 2nd Floor, Phase 6, DHA Lahore, Pakistan",
            href: "https://maps.app.goo.gl/XdCCsuZ3zNnswVko6?g_st=aw",
            icon: MapPin
        },
        {
            name: "Email Us",
            value: "thezalmimarkettingsajidmahmood@gmail.com",
            href: "mailto:thezalmimarkettingsajidmahmood@gmail.com",
            icon: Mail
        },
        {
            name: "Call Us",
            value: "+92 321 8446496",
            href: "tel:+923218446496",
            icon: Phone
        }
    ];

    return (
        <div className="p-4 space-y-8 md:p-8 shadow-lg bg-[var(--vintage-grape)] text-[var(--white)] rounded-2xl">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold">Contact Information</h2>
                <p className="text-white/80">
                    Find us at our office, drop us an email, or give us a call. We're here to assist you.
                </p>
            </div>

            <Separator className="my-6 bg-white/20" />

            <div className="grid gap-16 lg:grid-cols-2">
                <div className="space-y-8">
                    <div className="space-y-6">
                        {contactDetails.map((item, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <item.icon className="w-6 h-6 mt-1 text-[var(--cream)] shrink-0" />
                                <div className="min-w-0">
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="transition-colors text-white/80 hover:text-[var(--cream)] block w-full break-all"
                                    >
                                        {item.value}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div>
                        <h3 className="font-semibold">Follow Us</h3>
                        <div className="flex mt-4 space-x-4">
                            {socialLinks.map((item, index) => (
                                <Button key={index} variant="outline" size="icon" asChild className="bg-transparent border-white/20 hover:bg-white/10">
                                    <a href={item.href} aria-label={item.name} target="_blank" rel="noopener noreferrer">
                                        <item.icon className="w-8 h-8" />
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold">Our Location</h3>
                    <div className="mt-4 overflow-hidden rounded-lg">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.728744153906!2d74.4473597!3d31.476647200000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391909217dd18527%3A0x293c36dfe672bbde!2sThe%20Zalmi%20Marketing!5e0!3m2!1sen!2s!4v1765237335126!5m2!1sen!2s" width="100%" height="450" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}