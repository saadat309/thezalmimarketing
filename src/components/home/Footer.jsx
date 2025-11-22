import { Link } from '@tanstack/react-router';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Building, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

const Footer = () => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values) {
    console.log(values);
    // Handle form submission
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Branding Section */}
          <div className="space-y-4 lg:col-span-4">
            <h2 className="text-3xl font-bold tracking-tight">The Zalmi Marketing</h2>
            <p className="max-w-sm text-primary-foreground/80">
              Your trusted partner in finding the perfect property. We are dedicated to providing the best real estate services and opportunities.
            </p>
            <div className="flex mt-4 space-x-4">
              <Button variant="ghost" size="icon" className={"hover:hover:bg-transparent"} asChild>
                <a href="#" aria-label="Facebook" className="transition-colors hover:text-secondary">
                  <FaFacebook />
                </a>
              </Button>
              <Button variant="ghost" className={"hover:hover:bg-transparent"} size="icon" asChild>
                <a href="#" aria-label="Twitter" className="transition-colors hover:text-secondary">
                  <FaTwitter />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className={"hover:bg-transparent"} asChild>
                <a href="#" aria-label="Instagram" className="transition-colors hover:text-secondary">
                  <FaInstagram />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className={"hover:bg-transparent"} asChild>
                <a href="#" aria-label="LinkedIn" className="transition-colors hover:text-secondary">
                  <FaLinkedin />
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
                    <span className="text-primary-foreground/80">123 Real Estate Avenue, DHA Phase 6, Lahore, Pakistan</span>
                </li>
                <li className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 shrink-0" />
                    <a href="tel:+1234567890" className="transition-colors text-primary-foreground/80 hover:text-secondary">(123) 456-7890</a>
                </li>
                <li className="flex items-center">
                    <Mail className="w-5 h-5 mr-3 shrink-0" />
                     <a href="mailto:info@zalmimarketing.com" className="transition-colors text-primary-foreground/80 hover:text-secondary">info@zalmimarketing.com</a>
                </li>
              </ul>
            </div>

            {/* In the image, there's no fourth column for links, but a "Subscribe" section. I will add it. */}
             <div>
                <h3 className="text-lg font-semibold tracking-wider uppercase">Newsletter</h3>
                <p className="mt-4 text-primary-foreground/80">Stay updated with our latest properties and news.</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 mt-4 sm:flex-row">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input type="email" placeholder="Enter your email" {...field} className="border-transparent bg-primary-foreground/10 focus-visible:ring-secondary text-primary-foreground placeholder:text-primary-foreground/50" />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" variant="secondary">
                            Subscribe
                        </Button>
                    </form>
                </Form>
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