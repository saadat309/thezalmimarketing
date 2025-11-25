/**
 prompt to make it reuseable:
hi, do you have access to Navbar.jsx file from the files i uploaded in this project? if yes then read and understand its logic, once you understand its logic then using tailwind and css update the styles of ul and its li. each li item should use tanstack router Link and using its activeprops prop make the active item appear bold and test-primary with underline and also spacing form item to underline too. same effect should happen on hover on all items too and underline should appear to be drawn and float while hovering. make sure the ul component and li item should not tremble and vibrate on text and style transformations on hover and clicks. keep the same file-level names and imports as original file. also make sure to not change anything else in the code except what i asked for. your changes should be trackable and clearly visible with comments. 
 */

import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineRealEstateAgent } from "react-icons/md";
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
              <Link to="/" className="flex items-center gap-2 font-medium text-md sm:text-2xl md:text-xl text-primary">
                <MdOutlineRealEstateAgent className="text-primary" style={{ width: 30, height: 30 }} />
                The Zalmi Marketing
              </Link>

             
              <ul className="items-center hidden gap-4 text-sm md:flex md:gap-4 lg:gap-6 md:text-base nav-list">
                <li>

                  <Link
                    to="/"
                    className="nav-link font-base text-muted-foreground"
                    activeProps={{ className: "nav-link active text-primary font-bold" }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/properties"
                    className="nav-link font-base text-muted-foreground"
                    activeProps={{ className: "nav-link active text-primary font-bold" }}
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maps"
                    className="nav-link font-base text-muted-foreground"
                    activeProps={{ className: "nav-link active text-primary font-bold" }}
                  >
                    Maps
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="nav-link font-base text-muted-foreground"
                    activeProps={{ className: "nav-link active text-primary font-bold" }}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="nav-link font-base text-muted-foreground"
                    activeProps={{ className: "nav-link active text-primary font-bold" }}
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2 rounded-xl md:hidden" aria-label="Open menu">
                      <Menu style={{ width: 30, height: 30 }} />
                    </Button>
                  </SheetTrigger>

                  <SheetContent position="right" className="w-[280px] p-6">
                    <nav className="flex flex-col gap-4 mt-2">

                      <Link
                        to="/"
                        className="py-2 nav-link font-base text-muted-foreground w-fit"
                        activeProps={{ className: "nav-link active text-primary font-bold" }}
                      >
                        Home
                      </Link>
                      <Link
                        to="/properties"
                        className="py-2 nav-link font-base text-muted-foreground w-fit"
                        activeProps={{ className: "nav-link active text-primary font-bold" }}
                      >
                        Properties
                      </Link>
                      <Link
                        to="/maps"
                        className="nav-link font-base text-muted-foreground w-fit"
                        activeProps={{ className: "nav-link active text-primary font-bold" }}
                      >
                        Maps
                      </Link>
                      <Link
                        to="/about"
                        className="py-2 nav-link font-base text-muted-foreground w-fit" 
                        activeProps={{ className: "nav-link active text-primary font-bold" }}
                      >
                        About
                      </Link>

                      <Link
                        to="/contact"
                        className="py-2 nav-link font-base text-muted-foreground w-fit"
                        activeProps={{ className: "nav-link active text-primary font-bold" }}
                      >
                        Contact
                      </Link>

                    </nav>

                    <SheetFooter>
                      <Button asChild className="w-full mt-6">
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          
                            <FaWhatsapp className="text-green-500" style={{ width: 30, height: 30 }} />
                          
                          
                          <span>{phoneNumber}</span>
                        </a>
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="hidden md:block">
                  <Button asChild variant="ghost">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      
                            <FaWhatsapp className="text-green-500" style={{ width: 30, height: 30 }} />
                          
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
