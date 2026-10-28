import { createFileRoute, Link } from '@tanstack/react-router';
import { Building2, CheckCircle2, Compass, ShieldCheck, Target, TrendingUp, Trophy, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Counter } from '@/components/global/Counter';
import TeamSection from '@/components/global/TeamSection';
import content from '@/content/pages/about.json';
import teamContent from '@/content/components/team.json';

const icons = { Trophy, TrendingUp, ShieldCheck, Users };

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About Us | The Zalmi Marketing' }, { name: 'description', content: 'Learn about The Zalmi Marketing and our real estate advisory services.' }, { name: 'robots', content: 'noindex, nofollow' }], links: [{ rel: 'canonical', href: 'https://migration.local.invalid/about' }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-background bg-about-pattern text-foreground">
      <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 bg-slate-950 border-b border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d0fbb18f7253?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-950/50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
          <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10"><Building2 className="w-4 h-4 mr-2 inline" />{content.hero.badge}</Badge>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display max-w-4xl">{content.hero.headingPre}<span className="gold-text-gradient">{content.hero.headingHighlight}</span></h1>
          <p className="max-w-3xl text-base sm:text-xl text-slate-300 leading-relaxed">{content.hero.description}</p>
          <div className="flex flex-wrap gap-4"><Button asChild className="amber-gradient-vibrant text-slate-950 font-extrabold rounded-2xl"><Link to="/contact">{content.hero.whatsappText}<ArrowRight className="w-4 h-4 ml-2" /></Link></Button><Button asChild variant="outline" className="border-[#D4AF37]/40 bg-white/5 text-white rounded-2xl"><Link to="/contact">{content.hero.visitOfficeText}</Link></Button></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {content.stats.map((stat) => { const Icon = icons[stat.icon] || Trophy; return <Card key={stat.label} className="bg-card/95 border-border shadow-xl rounded-3xl p-5 sm:p-6 text-center"><div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto mb-3"><Icon className="w-6 h-6" /></div><div className="text-xl sm:text-3xl font-extrabold font-display"><Counter value={stat.value} /></div><p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p></Card>; })}
      </div>

      <div className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        <Card className="p-0 overflow-hidden border-border bg-card shadow-2xl rounded-3xl"><div className="grid lg:grid-cols-12"><div className="flex flex-col items-center justify-center p-10 sm:p-12 bg-slate-950 text-white lg:col-span-5"><img src={content.founder.image} alt={content.founder.name} className="w-56 h-56 rounded-full object-cover object-top border-2 border-[#D4AF37]/50 shadow-2xl mb-6" /><h2 className="text-2xl sm:text-3xl font-bold font-display text-center">{content.founder.name}</h2><p className="text-xs text-[#D4AF37] uppercase tracking-widest mt-2">{content.founder.role}</p><div className="mt-6 pt-5 border-t border-[#D4AF37]/25 text-center text-xs text-slate-300">Headquartered at {content.founder.address}</div></div><div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-center space-y-6"><Badge variant="outline" className="w-fit text-[#D4AF37] border-[#D4AF37]/30">{content.story.badge}</Badge><h2 className="text-3xl font-bold font-display sm:text-4xl">{content.story.heading}</h2><p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{content.story.content}</p><div className="grid sm:grid-cols-2 gap-6">{[['We Specialize In', content.story.specializesIn], ['Advisory Services', content.story.advisoryServices]].map(([title, entries]) => <div key={title} className="p-5 rounded-2xl bg-muted/40 border border-border/60"><h3 className="font-bold flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />{title}</h3><ul className="space-y-2 text-sm text-muted-foreground">{entries.map((entry) => <li key={entry}>• {entry}</li>)}</ul></div>)}</div></div></div></Card>

        <div className="grid md:grid-cols-2 gap-8">{[[content.mission, Target], [content.vision, Compass]].map(([item, Icon]) => <Card key={item.title} className="p-8 sm:p-10 rounded-3xl bg-card border-border shadow-xl"><div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mb-5"><Icon className="w-7 h-7" /></div><h2 className="text-2xl font-bold font-display">{item.title}</h2><p className="mt-4 leading-relaxed text-muted-foreground">{item.description}</p></Card>)}</div>

        <section className="space-y-10"><div className="text-center max-w-2xl mx-auto"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">Executive Leadership</Badge><h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">Visionary Leadership at the Helm</h2><p className="mt-3 text-sm text-muted-foreground">Guiding The Zalmi Marketing with integrity, market expertise, and strategic vision.</p></div><div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">{teamContent.team.filter((leader) => ['Ch. Sajid Mahmood', 'Abrar Hussain Imran'].includes(leader.name)).map((leader) => <Card key={leader.name} className="p-0 overflow-hidden rounded-3xl border-border bg-card shadow-xl"><img src={leader.image} alt={leader.name} className="w-full aspect-square object-cover object-top" /><CardContent className="p-6 sm:p-8 text-center space-y-2"><h3 className="text-xl sm:text-2xl font-bold font-display">{leader.name}</h3><p className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">{leader.role}</p><p className="text-sm text-muted-foreground">{leader.specialist}</p></CardContent></Card>)}</div></section>

        <section><div className="text-center mb-10"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">Milestones</Badge><h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">Our Journey Since 2020</h2></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{content.timeline.map((item, index) => <Card key={item.year} className="p-7 rounded-3xl bg-card border-border shadow-lg"><div className="text-4xl font-extrabold font-display text-[#D4AF37]">{item.year}</div><h3 className="mt-4 font-bold text-lg">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p><p className="pt-5 mt-5 border-t border-border text-xs text-[#D4AF37]">Milestone #{index + 1}</p></Card>)}</div></section>

        <TeamSection excludeNames={['Ch. Sajid Mahmood', 'Abrar Hussain Imran']} />

        <section className="p-8 sm:p-12 rounded-3xl bg-card border border-border shadow-xl space-y-7"><div><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">The Gold Standard</Badge><h2 className="mt-4 text-3xl font-bold font-display">Why Partner With The Zalmi Marketing?</h2><p className="mt-3 leading-relaxed text-muted-foreground">At The Zalmi Marketing, we transcend conventional brokerage to become your trusted wealth-building partner. Rooted in transparency, rigorous market intelligence, and client dedication.</p></div><div className="grid sm:grid-cols-2 gap-4">{['Absolute Transparency & Honest Advisory', 'Rigorous Legal Title Verification', 'Data-Driven Market Intelligence', 'Exclusive Off-Market Inventory Access'].map((value) => <p key={value} className="flex items-center gap-3 text-sm"><ShieldCheck className="w-5 h-5 text-[#D4AF37]" />{value}</p>)}</div><div className="border-t border-border pt-6"><h3 className="font-bold font-display text-xl">Ready to Invest?</h3><p className="mt-2 text-sm text-muted-foreground">Connect with the advisory team for a portfolio review.</p><Button asChild className="mt-4 amber-gradient-vibrant text-slate-950 font-extrabold rounded-2xl"><Link to="/contact">Schedule Consultation <ArrowRight className="w-4 h-4 ml-2" /></Link></Button></div></section>

        <Card className="p-8 sm:p-12 bg-slate-950 text-white border border-[#D4AF37]/30 rounded-3xl shadow-2xl"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">{content.nationalCoverage.badge}</Badge><h2 className="mt-4 text-3xl font-bold font-display">{content.nationalCoverage.heading}</h2><p className="mt-3 text-slate-300 max-w-2xl">{content.nationalCoverage.description}</p><div className="flex flex-wrap gap-3 mt-7">{content.nationalCoverage.cities.map((city) => <span key={city} className="px-4 py-2 rounded-full bg-white/5 border border-[#D4AF37]/25 text-sm">{city}</span>)}</div></Card>
      </div>
    </main>
  );
}
