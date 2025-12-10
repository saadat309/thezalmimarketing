import { Link } from '@tanstack/react-router';
import { FaFacebook, FaTiktok, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { Building, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Branding Section */}
          <div className="space-y-4 lg:col-span-4">
            <img
              src="/Zalmi Marketing Logo White.webp"
              alt="The Zalmi Marketing Logo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
            />
            <p className="max-w-sm text-primary-foreground/80">
              Your trusted partner in finding the perfect property. We are dedicated to providing the best real estate services and opportunities.
            </p>
            <div className="flex mt-4 space-x-4">
              <Button variant="ghost" size="icon" className={"hover:hover:bg-transparent"} asChild>
                <a href="https://www.facebook.com/share/182ygLHmct/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="transition-colors hover:text-secondary">
                  <FaFacebook />
                </a>
              </Button>
              <Button variant="ghost" className={"hover:hover:bg-transparent"} size="icon" asChild>
                <a href="https://www.tiktok.com/@thezalmimarketingdha?_r=1&_t=ZS-922kJzik3lf" target="_blank" rel="noopener noreferrer" aria-label="Tiktok" className="transition-colors hover:text-secondary">
                  <FaTiktok />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className={"hover:bg-transparent"} asChild>
                <a href="https://youtube.com/@thezalmimarketing?si=vDrnNAQ9pl9y1DU_" target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="transition-colors hover:text-secondary">
                  <FaYoutube />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className={"hover:bg-transparent"} asChild>
                <a href="https://wa.me/923218446496" target="_blank" rel="noopener noreferrer" aria-label="Whatsapp" className="transition-colors hover:text-secondary">
                  <FaWhatsapp />
                </a>
              </Button>
            </div>
          </div>

          {/* Links Section */}
          <div className="grid grid-cols-1 gap-8 lg:col-span-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold tracking-wider uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/" className="transition-colors text-primary-foreground/80 hover:text-secondary">Home</Link></li>
                <li><Link to="/about" className="transition-colors text-primary-foreground/80 hover:text-secondary">About Us</Link></li>
                <li><Link to="/properties" className="transition-colors text-primary-foreground/80 hover:text-secondary">Properties</Link></li>
                <li><Link to="/contact" className="transition-colors text-primary-foreground/80 hover:text-secondary">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold tracking-wider uppercase">Contact Us</h3>
              <ul className="mt-4 space-y-3">
                 <li className="flex items-start">
                    <Building className="w-5 h-5 mt-1 mr-3 shrink-0" />
                    <a href="https://maps.app.goo.gl/XdCCsuZ3zNnswVko6?g_st=aw" target="_blank" rel="noopener noreferrer" className="transition-colors text-primary-foreground/80 hover:text-secondary">67MB Commercial, 2nd Floor, Phase 6, DHA Lahore, Pakistan</a>
                </li>
                <li className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 shrink-0" />
                    <a href="tel:+923218446496" className="transition-colors text-primary-foreground/80 hover:text-secondary">+92 321 8446496</a>
                </li>
                <li className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 shrink-0" />
                     <a href="mailto:thezalmimarkettingsajidmahmood@gmail.com" className="transition-colors text-primary-foreground/80 hover:text-secondary break-all">thezalmimarkettingsajidmahmood@gmail.com</a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-12 text-sm text-center border-t border-primary-foreground/20 text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} The Zalmi Marketing. All Rights Reserved. Built by <a href="tel:+923145982936" className="transition-colors text-primary-foreground/80 hover:text-secondary">WeBuildWeb</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;