import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FaWhatsapp, FaMapMarkerAlt, FaAward, FaHandshake, FaChartLine, FaShieldAlt, FaBuilding, FaCheckCircle, FaStar, FaRegLightbulb, FaRegGem } from "react-icons/fa";
import { MapPin, Building2, CheckCircle2, ShieldCheck, Trophy, Target, Compass, Sparkles, Users, TrendingUp, ArrowRight, Quote } from "lucide-react";
import WhyUs from "@/components/global/WhyUs";
import TeamSection from "@/components/global/TeamSection";
import teamContent from "@/content/components/team.json";
import { Counter } from "@/components/global/Counter";
import { motion } from "framer-motion";
import content from "@/content/pages/about.json";

const iconMap = {
  Trophy: Trophy,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck,
  Users: Users,
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

const whatsappNumber = "+923218446496";
const officeMapLink = "https://maps.app.goo.gl/XdCCsuZ3zNnswVko6?g_st=aw";
const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

export const Route = createFileRoute("/about")({
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
            { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://thezalmimarketing.com/about" }
          ]
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const stats = content.stats.map(s => ({
    ...s,
    icon: iconMap[s.icon] || Trophy,
  }));

  return (
    <div className="min-h-screen bg-background bg-about-pattern text-foreground transition-colors duration-300">
      {/* Immersive Cinematic Hero Section */}
      <section className="relative pt-38 pb-28 sm:pt-48 sm:pb-36 bg-slate-950 dark:bg-slate-950 border-b border-[#D4AF37]/20 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transform hover:scale-100 transition-transform duration-1000"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541888946425-d0fbb18f7253?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-[#D4AF37]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <Badge
              variant="outline"
              className="px-5 py-2 text-xs font-semibold tracking-wider text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10 rounded-full uppercase shadow-xl backdrop-blur-md"
            >
              <Building2 className="w-4 h-4 text-[#D4AF37] mr-2 inline animate-pulse" />{" "}
              {content.hero.badge}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold sm:text-6xl lg:text-7xl font-display max-w-4xl tracking-tight text-white leading-tight">
            {content.hero.headingPre}
            <span className="gold-text-gradient">
              {content.hero.headingHighlight}
            </span>
          </h1>
          <p className="max-w-3xl text-base sm:text-xl text-slate-300 leading-relaxed font-light">
            {content.hero.description}
          </p>
          <div className="flex flex-wrap gap-4 pt-2 justify-center sm:justify-start">
            <Button
              asChild
              className="amber-gradient-vibrant hover:opacity-90 text-slate-950 font-extrabold px-8 py-4 h-14 rounded-2xl shadow-xl transition-all duration-300 text-base"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <FaWhatsapp className="w-6 h-6" /> {content.hero.whatsappText}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-[#D4AF37]/40 bg-white/5 text-white hover:bg-white/10 px-8 py-4 h-14 rounded-2xl backdrop-blur-md transition-all duration-300 text-base"
            >
              <a
                href={officeMapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3"
              >
                <MapPin className="w-5 h-5 text-[#D4AF37]" />{" "}
                {content.hero.visitOfficeText}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <Card className="bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-6 text-center group hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 hover:shadow-[#F5A623]/10 dark:hover:shadow-[#D4AF37]/10 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F5A623] dark:group-hover:bg-[#D4AF37] group-hover:!text-slate-950 dark:group-hover:!text-slate-950 transition-all duration-300">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-foreground">
                  <Counter value={stat.value} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  {stat.label}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Main Content Sections with Adaptive Light/Dark Contrast */}
      <div className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">
        {/* Company Overview & Founder Showcase Card */}
        <Reveal>
          <Card className="p-0 overflow-hidden border border-border bg-card shadow-2xl rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="flex flex-col items-center justify-center p-12 bg-slate-950 text-white lg:col-span-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl mb-6">
                  <img
                    src={content.founder.image}
                    alt={content.founder.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h3 className="text-3xl font-bold font-display text-center relative z-10 text-white">
                  {content.founder.name}
                </h3>
                <p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-2 relative z-10 font-semibold">
                  {content.founder.role}
                </p>
                <div className="mt-8 pt-6 border-t border-[#D4AF37]/25 text-center text-xs text-slate-300 relative z-10 font-light">
                  Headquartered at {content.founder.address}
                </div>
              </div>

              <div className="p-10 sm:p-14 lg:col-span-7 flex flex-col justify-center space-y-8">
                <div className="space-y-3">
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-xs text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30"
                  >
                    {content.story.badge}
                  </Badge>
                  <h2 className="text-3xl font-bold font-display text-foreground sm:text-4xl">
                    {content.story.heading}
                  </h2>
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-muted-foreground font-light">
                  {content.story.content}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                  <div className="space-y-4 p-6 rounded-2xl bg-muted/40 border border-border/60">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-base">
                      <CheckCircle2 className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" />{" "}
                      We Specialize In
                    </h4>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                      {content.story.specializesIn.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4 p-6 rounded-2xl bg-muted/40 border border-border/60">
                    <h4 className="font-bold text-foreground flex items-center gap-2 text-base">
                      <CheckCircle2 className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" />{" "}
                      Advisory Services
                    </h4>
                    <ul className="space-y-2.5 text-sm text-muted-foreground">
                      {content.story.advisoryServices.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Mission & Vision Dual-Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <Card className="p-10 bg-card border border-border shadow-xl h-full rounded-3xl relative overflow-hidden group hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F5A623]/20 dark:group-hover:bg-[#D4AF37]/20 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] flex items-center justify-center mb-6 shadow-inner">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-display text-foreground">
                {content.mission.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-light">
                {content.mission.description}
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card className="p-10 bg-card border border-border shadow-xl h-full rounded-3xl relative overflow-hidden group hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 transition-all duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F5A623]/20 dark:group-hover:bg-[#D4AF37]/20 transition-all" />
              <div className="w-14 h-14 rounded-2xl bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 border border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-[#F5A623] dark:text-[#D4AF37] flex items-center justify-center mb-6 shadow-inner">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-display text-foreground">
                {content.vision.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground font-light">
                {content.vision.description}
              </p>
            </Card>
          </Reveal>
        </div>

        {/* Executive Leadership Section */}
        <Reveal className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30"
            >
              Executive Leadership
            </Badge>
            <h2 className="text-3xl font-bold font-display text-foreground sm:text-4xl">
              Visionary Leadership at the Helm
            </h2>
            <p className="text-muted-foreground text-sm font-light">
              Guiding The Zalmi Marketing with uncompromised integrity, market
              mastery, and strategic vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamContent.team
              .filter((m) =>
                ["Ch. Sajid Mahmood", "Abrar Hussain Imran"].includes(m.name),
              )
              .map((leader, idx) => (
                <Reveal key={idx} delay={idx * 0.1} className="h-full">
                  <Card className="flex flex-col h-full gap-0 p-0 overflow-hidden transition-all duration-500 bg-card border border-border hover:border-[#F5A623]/50 dark:hover:border-[#D4AF37]/50 hover:shadow-2xl hover:shadow-[#F5A623]/10 dark:hover:shadow-[#D4AF37]/10 group rounded-3xl">
                    <div className="relative overflow-hidden aspect-[3/4] sm:aspect-square bg-muted shrink-0">
                      <img
                        src={leader.image}
                        alt={leader.name}
                        className="object-cover object-top w-full h-full transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <CardContent className="flex flex-col justify-center flex-grow p-6 sm:p-8 text-center space-y-2 sm:space-y-3">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground font-display group-hover:text-[#F5A623] dark:group-hover:text-[#D4AF37] transition-colors">
                        {leader.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#F5A623] dark:text-[#D4AF37] uppercase tracking-widest">
                        {leader.role}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-light pt-1">
                        {leader.specialist}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
          </div>
        </Reveal>

        {/* Corporate Journey Timeline: "Our Journey Since 2020" */}
        <Reveal className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs text-[#F5A623] dark:text-[#D4AF37] border-[#F5A623]/30 dark:border-[#D4AF37]/30"
            >
              Milestones
            </Badge>
            <h2 className="text-3xl font-bold font-display text-foreground sm:text-4xl">
              Our Journey Since 2020
            </h2>
            <p className="text-muted-foreground text-sm font-light">
              Key milestones that shaped The Zalmi Marketing into Pakistan's
              premier real estate consultancy.
            </p>
          </div>

          {/* Mobile: Sticky Stacked Cards */}
          <div className="block md:hidden flex flex-col relative pb-12">
            {content.timeline.map((item, idx) => {
              const cardIndex = idx + 1;
              const stickyTop = 120 + idx * 45;
              return (
                <div
                  key={idx}
                  className="sticky w-full transition-all duration-300 mb-6 last:mb-0"
                  style={{
                    top: `${stickyTop}px`,
                    zIndex: cardIndex,
                  }}
                >
                  <Card className="p-8 bg-card border border-border relative overflow-hidden group hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl rounded-3xl flex flex-col justify-between">
                    <div>
                      <div className="text-5xl font-extrabold text-[#F5A623] dark:text-[#D4AF37] font-display mb-4 group-hover:scale-110 transition-transform">
                        {item.year}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3 font-display">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-border/65 flex items-center justify-between text-xs text-[#F5A623] dark:text-[#D4AF37] font-semibold">
                      <span>Milestone #{idx + 1}</span>
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.timeline.map((item, idx) => (
              <Card
                key={idx}
                className="p-8 bg-card border border-border relative overflow-hidden group hover:border-[#F5A623]/60 dark:hover:border-[#D4AF37]/60 transition-all duration-300 shadow-xl rounded-3xl flex flex-col justify-between"
              >
                <div>
                  <div className="text-5xl font-extrabold text-[#F5A623] dark:text-[#D4AF37] font-display mb-4 group-hover:scale-110 transition-transform">
                    {item.year}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-border/65 flex items-center justify-between text-xs text-[#F5A623] dark:text-[#D4AF37] font-semibold">
                  <span>Milestone #{idx + 1}</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        </Reveal>

        {/* Team Section */}
        <TeamSection
          excludeNames={["Ch. Sajid Mahmood", "Abrar Hussain Imran"]}
        />

        {/* Why Trust Us Section */}
        <Reveal>
          <WhyUs />
        </Reveal>

        {/* National Coverage Section */}
        <Reveal>
          <Card className="p-10 sm:p-14 bg-slate-950 dark:bg-slate-950 text-white border border-[#D4AF37]/30 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <Badge
                variant="outline"
                className="px-3 py-1 text-xs text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10"
              >
                {content.nationalCoverage.badge}
              </Badge>
              <h3 className="text-3xl font-bold font-display">
                {content.nationalCoverage.heading}
              </h3>
              <p className="text-base text-slate-300 max-w-2xl font-light leading-relaxed">
                {content.nationalCoverage.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3.5 mt-8 relative z-10">
              {content.nationalCoverage.cities.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold rounded-2xl bg-white/5 border border-[#D4AF37]/25 text-white hover:bg-[#D4AF37] hover:text-slate-950 hover:border-[#D4AF37] transition-all duration-300 shadow-lg group"
                >
                  <FaMapMarkerAlt className="text-[#D4AF37] group-hover:text-slate-950" />{" "}
                  {c}
                </span>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
