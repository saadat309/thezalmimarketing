import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
import { useState } from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FaFacebook, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";


export const Route = createFileRoute("/contact")({
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
        <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white sm:text-5xl lg:text-6xl break-all">
          Contact Us
        </h1>
      </GlobalHero>
      <Contact />
    </div>
  );
}

function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
    agreedToPrivacy: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset form
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
      agreedToPrivacy: false,
    });
  };

  const handleChange = function (field, value) {
    setFormData(function (prev) {
      return { ...prev, [field]: value };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* Right Column - Owner Image (now first in source order for mobile-first) */}
          <div className="relative order-1 lg:order-2">
            <div className="overflow-hidden shadow-lg rounded-2xl">
              <img
                src="/owner pic.jpg"
                alt="Owner - The Zalmi Marketing"
                className="h-[600px] w-full object-cover"
              />
            </div>
          </div>

          {/* Left Column - Form (now second in source order for mobile-first) */}
          <div className="space-y-8 order-2 lg:order-1">
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <User className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    className="h-12 pl-10 border-border bg-card"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    className="h-12 pl-10 border-border bg-card"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <Phone className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                <Input
                  placeholder="Phone No"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="h-12 pl-10 border-border bg-card"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute w-5 h-5 text-muted-foreground top-3 left-3" />
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-12 pl-10 border-border bg-card"
                  required
                />
              </div>

              <div>
                <Textarea
                  placeholder="Your message (e.g. property type, location, budget, or any questions)"
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="resize-none border-border bg-card min-h-32"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="privacy"
                  checked={formData.agreedToPrivacy}
                  onCheckedChange={(checked) => handleChange("agreedToPrivacy", checked)}
                />
                <label htmlFor="privacy" className="text-sm leading-relaxed text-muted-foreground">
                  I have read and agree to the{" "}
                  <Link href="#" className="underline">
                    privacy policy
                  </Link>
                </label>
              </div>

              <Button type="submit" size="lg">
                Send Your Inquiry
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-16">
          <ContactInformation />
        </div>
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