import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { FaWhatsapp } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const gap = 14; // px
  const phoneNumber = "+923000000000"; // Replace with the actual phone number
  const whatsappMessage = "Hi, I want to know about your services.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onScroll() {
      const atTop = window.scrollY === 0;
      setScrolled(!atTop);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // initialize
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-transparent" style={{ top: scrolled ? 0 : `${gap}px`, transition: "top 100ms ease" }}>
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div className={`rounded-full bg-card shadow-md transition-transform duration-100 ${scrolled ? "translate-y-0" : "translate-y-0"}`}>
            <nav className="flex items-center justify-between w-full px-4 py-2">
              <Link to="/" className="font-bold text-md sm:text-2xl text-primary">
                The Zalmi Marketing
              </Link>

              <ul className="items-center hidden gap-6 text-sm md:flex lg:gap-8 md:text-base">
                <li>
                  <Link to="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/services" className="hover:underline">
                    Services
                  </Link>
                </li>
                <li>
                  <Link to="/work" className="hover:underline">
                    Work
                  </Link>
                </li>
              </ul>

              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2 rounded-xl md:hidden" aria-label="Open menu">
                      <Menu size={20} />
                    </Button>
                  </SheetTrigger>

                  <SheetContent position="right" className="w-[280px] p-6">
                    <nav className="flex flex-col gap-4 mt-2">
                      <Link to="/about" className="py-2 hover:underline">About</Link>
                      <Link to="/services" className="py-2 hover:underline">Services</Link>
                      <Link to="/work" className="py-2 hover:underline">Work</Link>

                    </nav>

                    <SheetFooter>
                      <Button asChild className="w-full mt-6">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <FaWhatsapp className="text-green-500" size={24} />
                          <span>{phoneNumber}</span>
                        </a>
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="hidden md:block">
                  <Button asChild variant="ghost">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <FaWhatsapp className="text-green-500" size={24} />
                      <span>{phoneNumber}</span>
                    </a>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

    </>
  );
}
