import { createFileRoute, Link } from "@tanstack/react-router";
import { GlobalHero } from "@/components/global/GlobalHero";
import { useState } from "react";
import { User, Phone, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";


export const Route = createFileRoute("/contact")({
  component: RouteComponent,
});

function RouteComponent() {
  
  
  return (
    <div>
      <GlobalHero
        image="/images/purchase-3113198_1280.jpg"
        overlay
      >
        <h1 className="px-4 py-4 mx-auto text-4xl text-center text-white">
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
          <div className="space-y-8">
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

          {/* Right Column - Hero Image */}
          <div className="relative">
            <div className="overflow-hidden shadow-lg rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Modern home exterior representing real estate properties"
                className="h-[600px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
