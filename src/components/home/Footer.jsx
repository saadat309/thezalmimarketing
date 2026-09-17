import { Link } from '@tanstack/react-router';
import { FaFacebook, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { Building, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import content from "@/content/components/footer.json";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="relative bg-luxury-bg text-luxury-text border-t border-luxury-border overflow-hidden bg-grid-pattern">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-luxury-bg pointer-events-none" />

      <div className="relative container px-4 py-20 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Branding Section */}
          <div className="space-y-6 lg:col-span-4">
            <Link to="/" className="inline-block">
              <img
                src="/Zalmi Marketing Logo White.webp"
                alt="The Zalmi Marketing Logo"
                className="object-contain w-auto h-12 sm:h-14"
              />
            </Link>
            <p className="max-w-sm text-luxury-muted leading-relaxed text-sm sm:text-base">
              {content.brandDescription}
            </p>

            {/* Brand Motto in Nastaleeq Urdu */}
            <div className="p-4 rounded-2xl bg-white/5 border border-[#D4AF37]/20 backdrop-blur-xl shadow-[0_0_20px_rgba(212,175,55,0.08)]">
              <p dir="rtl" className="text-base sm:text-lg text-[#D4AF37] leading-loose text-right" style={{ fontFamily: '"Noto Nastaliq Urdu", serif' }}>
                {content.brandMotto}
              </p>
            </div>

            <div className="flex pt-2 space-x-3">
              <Button variant="ghost" size="icon" className="rounded-full border border-[#D4AF37]/30 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 transition-all duration-300" asChild>
                <a href="https://www.facebook.com/share/182ygLHmct/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FaFacebook className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-[#D4AF37]/30 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 transition-all duration-300" asChild>
                <a href="https://www.tiktok.com/@thezalmimarketingdha?_r=1&_t=ZS-922kJzik3lf" target="_blank" rel="noopener noreferrer" aria-label="Tiktok">
                  <FaTiktok className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-[#D4AF37]/30 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 transition-all duration-300" asChild>
                <a href="https://youtube.com/@thezalmimarketing?si=vDrnNAQ9pl9y1DU_" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                  <FaYoutube className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-[#D4AF37]/30 text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 transition-all duration-300" asChild>
                <a href="https://wa.me/923218446496" target="_blank" rel="noopener noreferrer" aria-label="Whatsapp">
                  <FaWhatsapp className="w-4 h-4 text-green-500" />
                </a>
              </Button>
            </div>
          </div>

          {/* Links & Newsletter Section */}
          <div className="grid grid-cols-1 gap-8 lg:col-span-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-display font-bold tracking-widest uppercase text-[#D4AF37]">{content.quickLinksHeading}</h3>
              <div className="w-12 h-0.5 bg-[#D4AF37]/40 mt-2 mb-4" />
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Home</Link></li>
                <li><Link to="/about" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">About Us</Link></li>
                <li><Link to="/properties" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Properties</Link></li>
                <li><Link to="/maps" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Maps Directory</Link></li>
                <li><Link to="/files" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Plot Files</Link></li>
                <li><Link to="/contact" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Contact Us</Link></li>
                <li><Link to="/privacy-policy" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-display font-bold tracking-widest uppercase text-[#D4AF37]">{content.headquartersHeading}</h3>
              <div className="w-12 h-0.5 bg-[#D4AF37]/40 mt-2 mb-4" />
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-[#D4AF37]" />
                  <a href="https://maps.app.goo.gl/XdCCsuZ3zNnswVko6?g_st=aw" target="_blank" rel="noopener noreferrer" className="transition-colors text-luxury-muted hover:text-[#D4AF37] leading-relaxed">
                    {content.headquartersAddress}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 shrink-0 text-[#D4AF37]" />
                  <a href="tel:+923218446496" className="transition-colors text-luxury-muted hover:text-[#D4AF37]">{content.phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 shrink-0 text-[#D4AF37]" />
                  <a href="mailto:thezalmimarkettingsajidmahmood@gmail.com" className="break-all transition-colors text-luxury-muted hover:text-[#D4AF37] text-xs">
                    {content.email}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter Section */}
            <div>
              <h3 className="text-sm font-display font-bold tracking-widest uppercase text-[#D4AF37]">{content.marketIntelligence.heading}</h3>
              <div className="w-12 h-0.5 bg-[#D4AF37]/40 mt-2 mb-4" />
              <p className="text-sm text-luxury-muted leading-relaxed">
                {content.marketIntelligence.description}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={content.marketIntelligence.placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#D4AF37]/30 text-white placeholder:text-luxury-muted focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/40 transition-all duration-300 text-sm"
                  required
                />
                <Button
                  type="submit"
                  className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-950 font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  {subscribed ? content.marketIntelligence.subscribedMessage : content.marketIntelligence.subscribeButton}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="section-divider-gold my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-luxury-muted">
            &copy; {new Date().getFullYear()} {content.copyright}
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-[#D4AF37] font-medium shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {content.verifiedBadge}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
