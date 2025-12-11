/**
 prompt to make it reuseable:
hi, do you have access to Navbar.jsx file from the files i uploaded in this project? if yes then read and understand its logic, once you understand its logic then using tailwind and css update the styles of ul and its li. each li item should use tanstack router Link and using its activeprops prop make the active item appear bold and test-primary with underline and also spacing form item to underline too. same effect should happen on hover on all items too and underline should appear to be drawn and float while hovering. make sure the ul component and li item should not tremble and vibrate on text and style transformations on hover and clicks. keep the same file-level names and imports as original file. also make sure to not change anything else in the code except what i asked for. your changes should be trackable and clearly visible with comments. 
 */

import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { FaWhatsapp } from "react-icons/fa";
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // State to control the mobile sheet's open/close state
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const gap = 14; // px
  const phoneNumber = "+923218446496"; // Replace with the actual phone number
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
      <header
        className="fixed top-0 z-50 w-full bg-transparent"
        style={{ top: scrolled ? 0 : `${gap}px`, transition: "top 100ms ease" }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <div
            className={`rounded-full bg-primary shadow-md transition-transform duration-100 ${scrolled ? "translate-y-0" : "translate-y-0"}`}
          >
            <nav className="flex items-center justify-between w-full px-4 py-2">
              <Link to="/" className="flex items-center gap-1">
                <img
                  src="/Zalmi Marketing Logo White.webp"
                  alt="The Zalmi Marketing Logo"
                  className="object-contain w-auto h-10 sm:h-12 md:h-14"
                />
              </Link>

              <ul className="items-center hidden gap-4 text-sm md:flex md:gap-4 lg:gap-6 md:text-base nav-list">
                <li>
                  <Link
                    to="/"
                    className="nav-link text-primary-foreground"
                    activeProps={{
                      className: "nav-link active text-white font-bold",
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/properties"
                    className="nav-link text-primary-foreground"
                    activeProps={{
                      className: "nav-link active text-white font-bold",
                    }}
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    to="/maps"
                    className="nav-link text-primary-foreground"
                    activeProps={{
                      className: "nav-link active text-white font-bold",
                    }}
                  >
                    Maps
                  </Link>
                </li>
                <li>
                  <Link
                    to="/files"
                    className="nav-link text-primary-foreground"
                    activeProps={{
                      className: "nav-link active text-white font-bold",
                    }}
                  >
                    Files
                  </Link>
                </li>
                <li
                  className="lg:hidden"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                    modal={false}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex flex-row items-center gap-1 px-0 py-0 nav-link text-primary-foreground hover:bg-transparent active:text-white text-white data-[state=open]:text-white"
                      >
                        More
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-primary">
                      <DropdownMenuItem>
                        <Link
                          to="/about"
                          className="w-full nav-link text-primary-foreground custom-dropdown-item"
                          activeProps={{
                            className: "nav-link active text-white font-bold",
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          About
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link
                          to="/contact"
                          className="w-full nav-link text-primary-foreground custom-dropdown-item"
                          activeProps={{
                            className: "nav-link active text-white font-bold",
                          }}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Contact
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
                <li className="hidden lg:block">
                    <Link
                        to="/about"
                        className="nav-link text-primary-foreground"
                        activeProps={{
                        className: "nav-link active text-white font-bold",
                        }}
                    >
                        About
                    </Link>
                </li>
                <li className="hidden lg:block">
                    <Link
                        to="/contact"
                        className="nav-link text-primary-foreground"
                        activeProps={{
                        className: "nav-link active text-white font-bold",
                        }}
                    >
                        Contact
                    </Link>
                </li>
              </ul>

              <div className="flex items-center gap-2">
                {/* Add open and onOpenChange props to Sheet */}
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 rounded-xl md:hidden"
                      aria-label="Open menu"
                    >
                      <Menu style={{ width: 30, height: 30, color: "white" }} />
                    </Button>
                  </SheetTrigger>

                  <SheetContent
                    position="right"
                    className="w-[280px] p-6 bg-primary"
                  >
                    <nav className="flex flex-col gap-4 mt-2">
                      <Link
                        to="/"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        Home
                      </Link>
                      <Link
                        to="/properties"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        Properties
                      </Link>
                      <Link
                        to="/maps"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        Maps
                      </Link>
                      <Link
                        to="/files"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        Files
                      </Link>
                      <Link
                        to="/about"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        About
                      </Link>

                      <Link
                        to="/contact"
                        className="py-2 nav-link text-primary-foreground w-fit"
                        activeProps={{
                          className: "nav-link active text-white font-bold",
                        }}
                        // Close sheet on link click
                        onClick={() => setIsOpen(false)}
                      >
                        Contact
                      </Link>
                    </nav>

                    <SheetFooter>
                      <Button asChild className="w-full mt-6">
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 group"
                        >
                          <FaWhatsapp
                            className="text-green-500"
                            style={{ width: 30, height: 30 }}
                          />

                          <span className="text-primary-foreground group-hover:text-green-500">
                            {phoneNumber}
                          </span>
                        </a>
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>

                <div className="hidden md:block">
                  <Button asChild variant="ghost">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 group"
                    >
                      <FaWhatsapp
                        className="text-green-500"
                        style={{ width: 30, height: 30 }}
                      />

                      <span className="text-primary-foreground group-hover:text-green-500">
                        {phoneNumber}
                      </span>
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
