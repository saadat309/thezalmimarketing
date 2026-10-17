import { createFileRoute } from '@tanstack/react-router';
import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import content from '@/content/pages/privacy-policy.json';

export const Route = createFileRoute('/privacy-policy')({
  head: () => ({ meta: [{ title: 'Privacy Policy | The Zalmi Marketing — Staging' }, { name: 'description', content: 'Staging preview of the existing Privacy Policy page.' }, { name: 'robots', content: 'noindex, nofollow' }], links: [{ rel: 'canonical', href: 'https://migration.local.invalid/privacy-policy' }] }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 bg-slate-950 border-b border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10"><ShieldCheck className="w-4 h-4 mr-2 inline" />{content.hero.badge}</Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">{content.hero.heading}</h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>
      <div className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="space-y-8">{content.policySections.map((section) => <Card key={section.title} className="bg-card border border-border shadow-xl rounded-2xl p-2 sm:p-4"><CardHeader><CardTitle className="text-2xl font-display">{section.title}</CardTitle></CardHeader><CardContent><div className="prose dark:prose-invert text-muted-foreground leading-relaxed max-w-none text-base" dangerouslySetInnerHTML={{ __html: section.content }} /></CardContent></Card>)}</div></div>
    </div>
  );
}
