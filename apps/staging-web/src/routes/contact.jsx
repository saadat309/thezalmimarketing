import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowRight, Award, Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import content from '@/content/pages/contact.json';

const iconMap = { Phone, FaWhatsapp: MessageCircle, Mail, MapPin };

export const Route = createFileRoute('/contact')({
  head: () => ({
    meta: [
      { title: 'Contact Us | The Zalmi Marketing' },
      { name: 'description', content: 'Contact The Zalmi Marketing for property, plot file, and investment guidance.' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: [{ rel: 'canonical', href: 'https://migration.local.invalid/contact' }],
  }),
  component: ContactPreview,
});

function ContactPreview() {
  const [notice, setNotice] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setNotice('Your message is ready for review. The form is not connected yet, so nothing was sent or saved.');
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-background bg-contact-pattern text-foreground transition-colors duration-300">
      <section className="relative pt-36 pb-24 sm:pt-44 sm:pb-32 bg-slate-950 border-b border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Badge variant="outline" className="px-5 py-2 text-xs font-semibold tracking-wider text-[#D4AF37] border-[#D4AF37]/40 bg-[#D4AF37]/10 rounded-full uppercase">
            <MessageCircle className="w-4 h-4 mr-2 inline" />{content.hero.badge}
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-6xl lg:text-7xl font-display tracking-tight">
            {content.hero.headingPre}<span className="gold-text-gradient">{content.hero.headingHighlight}</span>
          </h1>
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 leading-relaxed font-light">{content.hero.description}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.quickContactCards.map((card, index) => {
            const Icon = iconMap[card.icon] || Phone;
            const href = card.href || 'https://wa.me/923218446496';
            return (
              <Card key={card.title} className="bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300 group flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition-all duration-300"><Icon className="w-7 h-7" /></div>
                  <div>
                    <h2 className="font-bold font-display text-lg text-foreground">{card.title}</h2>
                    <p className="text-sm font-semibold text-[#D4AF37] mt-0.5">{card.subtitle}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-border/60">
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-foreground hover:text-[#D4AF37] transition-colors">
                    {card.actionText}<ArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">The cards show the public contact details already present in the source page. Form submissions below are disabled in staging.</p>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7">
          <div className="mb-8 space-y-3">
            <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">{content.formSection.badge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">{content.formSection.heading}</h2>
            <p className="text-muted-foreground leading-relaxed">{content.formSection.description}</p>
          </div>
          <Card className="rounded-3xl border-border bg-card shadow-xl">
            <CardContent className="p-6 sm:p-9">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="space-y-2 text-sm font-medium">First name<input autoComplete="given-name" required className="staging-contact-input" name="firstName" /></label>
                  <label className="space-y-2 text-sm font-medium">Last name<input autoComplete="family-name" required className="staging-contact-input" name="lastName" /></label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="space-y-2 text-sm font-medium">Phone<input autoComplete="tel" required className="staging-contact-input" name="phone" type="tel" /></label>
                  <label className="space-y-2 text-sm font-medium">Email<input autoComplete="email" required className="staging-contact-input" name="email" type="email" /></label>
                </div>
                <label className="block space-y-2 text-sm font-medium">Your requirements / message<textarea required rows="5" name="message" className="staging-contact-input resize-y" /></label>
                <label className="flex items-start gap-3 text-sm text-muted-foreground"><input required type="checkbox" className="mt-1 accent-amber-500" /> <span>I have read and agree to the <Link to="/privacy-policy" className="underline text-foreground">privacy policy &amp; data protection terms</Link>.</span></label>
                <Button type="submit" size="lg" className="w-full h-14 amber-gradient-vibrant text-slate-950 font-extrabold rounded-2xl shadow-xl">Preview Form (No Sending)</Button>
                <p className="min-h-6 text-center text-sm text-amber-600 dark:text-amber-300" aria-live="polite">{notice}</p>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground flex gap-3"><ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" /><span>Staging-only interaction. Nothing entered here is transmitted, stored, or connected to a backend.</span></div>
        </div>

        <aside className="lg:col-span-5 space-y-8">
          <Card className="rounded-3xl border-border bg-card shadow-xl">
            <CardContent className="p-7 sm:p-9 space-y-5">
              <Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">{content.contactInformation.badge}</Badge>
              <h2 className="text-2xl font-bold font-display">{content.contactInformation.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{content.contactInformation.description}</p>
              <div className="space-y-4 pt-2">
                {content.contactInformation.contactDetails.map((item) => <a key={item.name} href={item.href} className="flex items-start gap-3 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"><MapPin className="w-5 h-5 text-[#D4AF37] shrink-0" /><span><strong className="block text-foreground">{item.name}</strong>{item.value}</span></a>)}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">{content.contactInformation.socialLinks.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-[#D4AF37]/30 px-4 py-2 text-xs font-semibold hover:bg-[#D4AF37]/10">{item.name}</a>)}</div>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-border bg-card shadow-xl">
            <CardContent className="p-7 sm:p-9">
              <div className="flex items-center gap-3 mb-5"><Clock3 className="w-6 h-6 text-[#D4AF37]" /><div><h2 className="font-bold font-display">{content.officeHours.title}</h2><p className="text-xs text-muted-foreground">{content.officeHours.subtitle}</p></div></div>
              <div className="space-y-4">{content.officeHours.schedule.map((item) => <div key={item.days} className="flex justify-between gap-4 border-t border-border pt-4 text-sm"><span>{item.days}</span><span className={item.highlight ? 'text-[#D4AF37]' : 'text-muted-foreground'}>{item.time}</span></div>)}</div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-2xl group">
            <div className="relative overflow-hidden">
              <img src="/final Ch sajid.webp" alt="Ch. Sajid Mahmood - Owner & CEO" className="h-[420px] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <Badge className="absolute top-4 right-4 bg-[#D4AF37]/90 text-slate-950 font-bold px-3 py-1 shadow-lg"><Award className="w-4 h-4 mr-1" />Founder &amp; CEO</Badge>
            </div>
            <CardContent className="p-7 space-y-4 bg-slate-950 text-white">
              <h2 className="text-2xl font-bold font-display">Ch. Sajid Mahmood</h2>
              <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-semibold">Chief Executive Officer</p>
              <p className="text-sm text-slate-300 italic leading-relaxed">“Our doors and direct phone lines are always open for clients seeking secure, high-yield real estate opportunities across Pakistan. Trust and transparency are our legacy.”</p>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 text-xs text-slate-400"><span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#D4AF37]" />100% Verified Agency</span><span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-[#D4AF37]" />DHA Phase 6 Flagship</span></div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-10"><Badge variant="outline" className="text-[#D4AF37] border-[#D4AF37]/30">Helpful answers</Badge><h2 className="mt-4 text-3xl sm:text-4xl font-bold font-display">Frequently Asked Questions</h2></div>
        <div className="space-y-4">{content.faqs.map((item) => <details key={item.q} className="rounded-2xl border border-border bg-card p-5 sm:p-6"><summary className="cursor-pointer font-semibold marker:text-[#D4AF37]">{item.q}</summary><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p></details>)}</div>
      </section>
    </main>
  );
}
