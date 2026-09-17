import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Phone, Mail, MapPin, Loader2, Headphones, ShieldCheck, Clock, Award, ChevronRight, MessageSquare, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaFacebook, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { submitQuery } from "@/lib/api";
import { motion } from "framer-motion";
import content from "@/content/pages/contact.json";

const iconMap = {
  Phone: Phone,
  FaWhatsapp: FaWhatsapp,
  Mail: Mail,
  MapPin: MapPin,
};

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
      { property: "og:title", content: content.seo.ogTitle },
      { property: "og:description", content: content.seo.ogDescription },
      { property: "og:image", content: content.seo.ogImage },
      { name: "twitter:card", content: content.seo.twitterCard },
      { name: "twitter:url", content: content.seo.twitterUrl },
      { name: "twitter:title", content: content.seo.twitterTitle },
      { name: "twitter:description", content: content.seo.twitterDescription },
      { name: "twitter:image", content: content.seo.twitterImage },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
            { "@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://thezalmimarketing.com/contact" }
          ]
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
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

  const whatsappNumber = "+923218446496";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  function onSubmit(values) {
    const { firstName, lastName, ...rest } = values;
    mutation.mutate({
      name: `${firstName} ${lastName}`,
      ...rest,
    });
  }

  const quickContactCards = content.quickContactCards.map(c => ({
    ...c,
    href: c.href === "whatsappUrl" ? whatsappUrl : c.href,
    icon: iconMap[c.icon] || Phone,
  }));

  return (
    <div className="min-h-screen bg-background bg-contact-pattern text-foreground transition-colors duration-300">
      {/* Immersive Cinematic Hero Section */}
      <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 bg-slate-950 dark:bg-slate-950 border-b border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="px-5 py-2 text-xs font-semibold tracking-wider text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10 rounded-full uppercase shadow-lg backdrop-blur-md">
            <Headphones className="w-4 h-4 text-[#D4AF37] mr-2 inline animate-pulse" /> {content.hero.badge}
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-6xl lg:text-7xl font-display tracking-tight text-white">
            {content.hero.headingPre}<span className="gold-text-gradient">{content.hero.headingHighlight}</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-light">
            {content.hero.description}
          </p>
        </div>
      </section>

      {/* Quick Contact Interactive Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickContactCards.map((card, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <Card className="bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-6 hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 hover:shadow-[#F5A623]/10 dark:hover:shadow-[#D4AF37]/10 transition-all duration-300 group flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] flex items-center justify-center group-hover:bg-[#F5A623] dark:group-hover:bg-[#D4AF37] group-hover:!text-slate-950 dark:group-hover:!text-slate-950 transition-all duration-300 shadow-inner">
                    <card.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-lg text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors">{card.title}</h3>
                    <p className="text-sm font-semibold text-[#F5A623] dark:text-[#D4AF37] mt-0.5">{card.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-border/60">
                  <a
                    href={card.href || whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors"
                  >
                    {card.actionText} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Form & CEO Spotlight */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          
          {/* Left Column - Redesigned Advanced Inquiry Form */}
          <Reveal className="lg:col-span-7 space-y-8 bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5A623]/5 dark:bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5A623] dark:text-[#D4AF37]">
                <MessageSquare className="w-4 h-4" /> {content.formSection.badge}
              </div>
              <h2 className="text-3xl font-bold font-display text-foreground sm:text-4xl">
                {content.formSection.heading}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.formSection.description}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute w-5 h-5 text-muted-foreground top-3.5 left-3.5" />
                            <Input
                              placeholder="e.g. Ahmed"
                              {...field}
                              className="h-12 pl-11 bg-background text-foreground border-border rounded-xl focus-visible:ring-[#F5A623]"
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
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute w-5 h-5 text-muted-foreground top-3.5 left-3.5" />
                            <Input
                              placeholder="e.g. Khan"
                              {...field}
                              className="h-12 pl-11 bg-background text-foreground border-border rounded-xl focus-visible:ring-[#F5A623]"
                              disabled={mutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute w-5 h-5 text-muted-foreground top-3.5 left-3.5" />
                            <Input
                              placeholder="+92 300 1234567"
                              type="tel"
                              {...field}
                              className="h-12 pl-11 bg-background text-foreground border-border rounded-xl focus-visible:ring-[#F5A623]"
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
                        <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute w-5 h-5 text-muted-foreground top-3.5 left-3.5" />
                            <Input
                              placeholder="ahmed@example.com"
                              type="email"
                              {...field}
                              className="h-12 pl-11 bg-background text-foreground border-border rounded-xl focus-visible:ring-[#F5A623]"
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
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Requirements / Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Specify property type (villa, plot, commercial), DHA Phase, budget, or specific plot file query..."
                          {...field}
                          className="resize-none bg-background text-foreground border-border min-h-[150px] p-4 rounded-xl focus-visible:ring-[#F5A623]"
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
                    <FormItem className="flex items-center space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={mutation.isPending}
                          className="rounded-md border-border text-[#F5A623] focus:ring-[#F5A623]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs text-muted-foreground cursor-pointer font-normal">
                          I have read and agree to the{" "}
                          <Link to="/privacy-policy" className="underline text-foreground font-semibold hover:text-[#F5A623] dark:hover:text-[#D4AF37] transition-colors">
                            privacy policy & data protection terms
                          </Link>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 amber-gradient-vibrant hover:opacity-90 text-slate-950 font-extrabold rounded-2xl shadow-xl transition-all duration-300 text-base" 
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Secure Inquiry...
                    </>
                  ) : (
                    "Submit Priority Inquiry"
                  )}
                </Button>
              </form>
            </Form>
          </Reveal>

          {/* Right Column - Executive Spotlight */}
          <Reveal className="lg:col-span-5 space-y-8" delay={0.2}>
            <div className="overflow-hidden shadow-2xl rounded-3xl border border-border bg-card group">
              <div className="relative overflow-hidden">
                 <img
                   src="/final Ch sajid.webp"
                   alt="Ch. Sajid Mahmood - Owner & CEO"
                   className="h-[480px] w-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                 />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#D4AF37]/90 text-slate-950 font-bold px-3 py-1 shadow-lg">
                    <Award className="w-3.5 h-3.5 mr-1 inline" /> Founder & CEO
                  </Badge>
                </div>
              </div>
              <div className="p-8 space-y-4 bg-slate-950 text-white relative">
                <h3 className="text-2xl font-bold font-display">Ch. Sajid Mahmood</h3>
                <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold">Chief Executive Officer</p>
                <p className="text-sm text-slate-300 italic leading-relaxed pt-1">
                  "Our doors and direct phone lines are always open for clients seeking secure, high-yield real estate opportunities across Pakistan. Trust and transparency are our legacy."
                </p>
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> 100% Verified Agency</span>
                  <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-[#D4AF37]" /> DHA Phase 6 Flagship</span>
                </div>
              </div>
            </div>
          </Reveal>

        </div>

        {/* Business Hours Card - Full Width */}
        <Reveal delay={0.3}>
          <Card className="p-8 sm:p-10 bg-card border border-border rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 text-[#F5A623] dark:text-[#D4AF37]">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold font-display text-foreground text-xl">{content.officeHours.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{content.officeHours.subtitle}</p>
                </div>
              </div>
              <Badge variant="outline" className="px-4 py-1.5 text-xs font-semibold text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30">
                Official Timings
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              {content.officeHours.schedule.map((sch, i) => (
                <div key={i} className="p-5 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">{sch.days}</span>
                  <span className={`text-base font-bold ${sch.highlight ? 'text-[#F5A623] dark:text-[#D4AF37]' : 'text-foreground'}`}>{sch.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Comprehensive Headquarters & Map Section */}
        <Reveal>
          <ContactInformation />
        </Reveal>

        {/* Frequently Asked Questions Section */}
        <Reveal className="space-y-8 max-w-4xl mx-auto pt-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30">Client Help</Badge>
            <h2 className="text-3xl font-bold font-display text-foreground">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm">Quick answers regarding client inquiries, site visits, and plot file verifications.</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {content.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-2xl px-6 shadow-md data-[state=open]:border-[#F5A623]/50 dark:data-[state=open]:border-[#D4AF37]/50 transition-colors">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-[#F5A623] dark:hover:text-[#D4AF37] py-4 text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </div>
  );
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy.",
  }),
});

function ContactInformation() {
  const socialMap = {
    Facebook: FaFacebook,
    Tiktok: FaTiktok,
    Youtube: FaYoutube,
    Whatsapp: FaWhatsapp,
  };

  const detailMap = {
    MapPin: MapPin,
    Mail: Mail,
    Phone: Phone,
  };

  const socialLinks = content.contactInformation.socialLinks.map(s => ({
    ...s,
    icon: socialMap[s.name] || FaFacebook,
  }));

  const contactDetails = [
    {
      name: content.contactInformation.contactDetails[0].name,
      value: content.contactInformation.contactDetails[0].value,
      href: content.contactInformation.contactDetails[0].href,
      icon: MapPin
    },
    {
      name: content.contactInformation.contactDetails[1].name,
      value: content.contactInformation.contactDetails[1].value,
      href: content.contactInformation.contactDetails[1].href,
      icon: Mail
    },
    {
      name: content.contactInformation.contactDetails[2].name,
      value: content.contactInformation.contactDetails[2].value,
      href: content.contactInformation.contactDetails[2].href,
      icon: Phone
    }
  ];

  return (
    <div className="p-8 sm:p-14 space-y-10 bg-slate-950 dark:bg-slate-950 text-white rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="space-y-3 relative z-10">
        <Badge variant="outline" className="px-3 py-1 text-xs text-amber-400 border-amber-500/30 bg-amber-500/10">{content.contactInformation.badge}</Badge>
        <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight">{content.contactInformation.heading}</h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed font-light">
          {content.contactInformation.description}
        </p>
      </div>

      <Separator className="my-6 bg-white/10" />

      <div className="grid gap-12 lg:grid-cols-2 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-6">
            {contactDetails.map((item, index) => (
              <div key={index} className="flex items-start gap-4 group">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:!text-slate-950 transition-all duration-300 shadow-inner">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-white text-base">{item.name}</h3>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors text-slate-300 hover:text-amber-400 block w-full break-all text-sm mt-1 font-light"
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="font-semibold text-white text-xs uppercase tracking-widest text-amber-400">Connect On Social Channels</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((item, index) => (
                <Button key={index} variant="outline" size="icon" asChild className="bg-white/5 border-white/20 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 rounded-2xl w-14 h-14 transition-all duration-300 shadow-lg">
                  <a href={item.href} aria-label={item.name} target="_blank" rel="noopener noreferrer">
                    <item.icon className="w-6 h-6" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-amber-500/30 shadow-2xl relative group">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.728744153906!2d74.4473597!3d31.476647200000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391909217dd18527%3A0x293c36dfe672bbde!2sThe%20Zalmi%20Marketing!5e0!3m2!1sen!2s!4v1765237335126!5m2!1sen!2s" 
            width="100%" 
            height="420" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="filter contrast-105"
          />
        </div>
      </div>
    </div>
  );
}
