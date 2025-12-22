import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { GlobalHero } from "@/components/global/GlobalHero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FaWhatsapp,

  FaMapMarkerAlt,

} from "react-icons/fa";
import { MapPin } from "lucide-react";
import WhyUs from "@/components/global/WhyUs";
import { motion } from "framer-motion";

const Reveal = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
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


const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`; // Remove non-digits


export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <GlobalHero image="/images/business-7111770_1280.jpg" overlay height="60vh">
        <div className="relative z-10 px-6 py-12 text-white md:px-12 md:py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
              The Zalmi Marketing
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/90">
              A trusted and dynamic real estate agency delivering excellence
              across Pakistan since 2020.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">

              <Badge variant="secondary">Premium DHA Properties</Badge>
              <Badge variant="default">Since 2020</Badge>
            </div>
          </div>
        </div>
      </GlobalHero>
      <AboutPage />
      
    </div>
  );
}




function AboutPage() {
  return (
    <div className="py-16 antialiased sm:py-24">
      <div className="flex flex-col gap-24 px-4 mx-auto max-w-7xl lg:px-8">
        {/* Company Overview Section */}
        <Reveal>
          <Card className="p-0 overflow-hidden border-0 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="flex items-center justify-center p-8 bg-primary lg:col-span-1">
                <img
                  src="/Zalmi Marketing Logo White.webp"
                  alt="The Zalmi Marketing Logo"
                  className="object-contain w-auto h-full max-h-48 lg:max-h-full"
                />
              </div>

              <div className="p-8 lg:col-span-2">
                <p className="text-base leading-relaxed text-muted-foreground">
                  The Zalmi Marketing is a premier, trusted, and dynamic real
                  estate agency, passionately committed to delivering an
                  unparalleled standard of excellence in property services across
                  Pakistan. Since our establishment in 2020, we have meticulously
                  built a strong reputation founded on the cornerstones of
                  unwavering integrity, uncompromising professionalism, and
                  exceptional, in-depth market knowledge. Under the guidance of
                  our visionary CEO, Ch. Sajid Mahmood, our core mission is to
                  empower our esteemed clients by providing them with secure, profitable,
                  and completely hassle-free real estate solutions, ensuring a
                  seamless journey from start to finish.
                </p>

                <div className="grid grid-cols-1 gap-8 mt-8 sm:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold">We specialize in</h3>
                    <ul className="mt-4 space-y-2 text-base list-disc list-inside text-muted-foreground">
                      <li>Bungalows, Villas & Houses</li>
                      <li>Portions & Apartments</li>
                      <li>Farmhouses</li>
                      <li>Commercial Properties</li>
                      <li>Residential Plots</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Services</h3>
                    <ul className="mt-4 space-y-2 text-base list-disc list-inside text-muted-foreground">
                      <li>Sale, Purchase & Investment Advisory</li>
                      <li>Property Assessment & Valuation</li>
                      <li>Exclusive Listings & Network Access</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <Button asChild variant="outline" size="lg">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <FaWhatsapp /> Message CEO
                    </a>
                  </Button>

                  <Button asChild variant="ghost" size="lg">
                    <a
                      href={officeMapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      <MapPin /> View Office
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Reveal>
            <Card className="p-8 bg-[var(--vintage-grape)] text-[var(--white)] h-full">
              <h3 className="text-2xl font-bold">Our Mission</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--white)]">
                Our mission is to empower our clients by safeguarding their
                investments and maximizing their returns. We are dedicated to
                facilitating seamless and transparent property transactions,
                underpinned by profound market expertise, data-driven insights,
                and an unwavering commitment to ethical and principled business
                practices. We strive to build lasting relationships based on trust
                and mutual success.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={0.2}>
            <Card className="p-8 bg-[var(--vintage-grape)] text-[var(--white)] h-full">
              <h3 className="text-2xl font-bold">Our Vision</h3>
              <p className="mt-4 text-base leading-relaxed text-[var(--white)]">
                Our vision is to be universally recognized as the most trusted,
                innovative, and client-centric real estate service provider in
                Pakistan. We aim to continuously redefine the industry landscape
                by setting new benchmarks for professionalism, technological
                integration, and unparalleled customer satisfaction. We aspire to
                create a legacy where every client's experience is a testament to
                our dedication to excellence.
              </p>
            </Card>
          </Reveal>
        </div>

        {/* Why Trust Us Section */}
        <Reveal>
          <WhyUs/>
        </Reveal>

        {/* Coverage Section */}
        <Reveal>
          <Card className="p-8 bg-[var(--vintage-grape)] text-[var(--white)]">
            <h3 className="text-2xl font-bold">Our Coverage</h3>
            <p className="mt-2 text-lg text-white/80">
              We operate across major DHA branches and top societies in Pakistan.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              {[
                "DHA Lahore",
                "DHA Islamabad",
                "DHA Karachi",
                "DHA Multan",
                "DHA Peshawar",
                "DHA Quetta",
                "Top Lahore Societies",
              ].map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-3 px-4 py-2 text-base font-medium rounded-lg bg-[var(--ash-grey)] text-[var(--vintage-grape)]"
                >
                  <FaMapMarkerAlt /> {c}
                </span>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

