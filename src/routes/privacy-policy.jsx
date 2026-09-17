import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import content from "@/content/pages/privacy-policy.json";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: content.seo.title },
      {
        name: "description",
        content: content.seo.description,
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
    links: [{ rel: "canonical", href: content.seo.canonical }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
            { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://thezalmimarketing.com/privacy-policy" }
          ]
        }),
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const policySections = content.policySections;

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Independent Entry Section with Proper Navbar Spacing */}
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium text-white border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline" /> {content.hero.badge}
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">
            {content.hero.heading}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
            {policySections.map((section, index) => (
                <Card key={index} className="bg-card border border-border shadow-xl rounded-2xl p-2 sm:p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl font-display text-foreground">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert text-muted-foreground leading-relaxed max-w-none text-base" dangerouslySetInnerHTML={{ __html: section.content }} />
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
