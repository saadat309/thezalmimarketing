import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Sun, Moon, Calculator } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDarkLogo, setShowDarkLogo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentTheme = localStorage.getItem("theme") !== "light";
    setIsDarkMode(currentTheme);
    if (currentTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    function onScroll() {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
      const darkModeActive = document.documentElement.classList.contains("dark");
      setShowDarkLogo(!darkModeActive && window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setShowDarkLogo(false);
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setShowDarkLogo(window.scrollY > 80);
    }
  };

  const navLinkClass = scrolled
    ? "px-3.5 py-1.5 rounded-full text-slate-800 dark:text-slate-200 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300 font-medium text-sm md:text-base"
    : "px-3.5 py-1.5 rounded-full text-white hover:text-[#D4AF37] hover:bg-white/10 transition-all duration-300 font-medium text-sm md:text-base";
  const activeNavLinkClass = "px-3.5 py-1.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 text-sm md:text-base";

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-500  ${scrolled ? "py-3 px-3 sm:px-6" : "py-5 px-3 sm:px-8"}`}>
        <div className="mx-auto max-w-7xl">
              <div className={`transition-all duration-500  ${
                scrolled
                  ? "bg-slate-950/90 dark:bg-slate-950/90 bg-white/95 backdrop-blur-2xl border border-[#D4AF37]/30 shadow-[0_10px_35px_rgba(0,0,0,0.35),0_0_30px_rgba(212,175,55,0.18)] rounded-full px-4 sm:px-6 py-2.5"
                  : "bg-transparent rounded-none px-2 sm:px-4 py-2"
              }`}>
                <nav className="flex items-center justify-between w-full">
                  <Link to="/" className="flex items-center gap-2 group">
                    <img
                      src={showDarkLogo ? "/Zalmi Marketing Logo Black.webp" : "/Zalmi Marketing Logo White.webp"}
                      alt="The Zalmi Marketing Logo"
                      className="object-contain w-auto h-10 sm:h-12 transition-all duration-300 group-hover:scale-105"
                    />
                  </Link>

                  <ul className="items-center hidden gap-1 md:flex lg:gap-2 nav-list">
                    <li>
                      <Link
                        to="/"
                        className={navLinkClass}
                        activeProps={{
                          className: activeNavLinkClass,
                        }}
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/properties"
                        className={navLinkClass}
                        activeProps={{
                          className: activeNavLinkClass,
                        }}
                      >
                        Properties
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/maps"
                        className={navLinkClass}
                        activeProps={{
                          className: activeNavLinkClass,
                        }}
                      >
                        Maps
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/files"
                        className={navLinkClass}
                        activeProps={{
                          className: activeNavLinkClass,
                        }}
                      >
                        Files
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/calculator"
                        className={navLinkClass + " flex items-center gap-2"}
                        activeProps={{
                          className: activeNavLinkClass,
                        }}
                      >
                        <Calculator className="w-4 h-4" />
                        Zalmi Calculator
                      </Link>
                    </li>
                    <li
                      className="relative"
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
                            className={navLinkClass + " hover:bg-[#D4AF37]/10 data-[state=open]:bg-[#D4AF37]/20 data-[state=open]:text-[#D4AF37] cursor-pointer"}
                          >
                            More
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-slate-950/95 backdrop-blur-2xl border border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-1.5 mt-2">
                          <DropdownMenuItem asChild>
                            <Link
                              to="/about"
                              className="w-full px-4 py-2 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
                            >
                              About Us
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              to="/contact"
                              className="w-full px-4 py-2 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors cursor-pointer"
                            >
                              Contact Us
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  </ul>

                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Theme Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleTheme}
                      className="p-2.5 text-[#D4AF37] border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] rounded-full shadow-lg transition-all duration-300 cursor-pointer h-10 w-10 sm:h-11 sm:w-11"
                      aria-label="Toggle theme"
                    >
                      {isDarkMode ? <Sun className="w-5 h-5 text-[#D4AF37]" /> : <Moon className="w-5 h-5 text-[#D4AF37]" />}
                    </Button>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-11 w-11 p-2 rounded-full bg-slate-900/80 border border-[#D4AF37]/30 text-white hover:bg-[#D4AF37]/20 md:hidden shadow-md flex items-center justify-center"
                          aria-label="Open menu"
                        >
                          {isOpen ? (
                            <X className="w-6 h-6 text-[#D4AF37]" />
                          ) : (
                            <Menu className="w-6 h-6 text-[#D4AF37]" />
                          )}
                        </Button>
                      </SheetTrigger>

                      <SheetContent
                        position="right"
                        className="w-[300px] p-6 bg-slate-950/98 backdrop-blur-3xl border-l border-[#D4AF37]/30 text-white flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#D4AF37]/20">
                            <span className="text-sm font-display font-semibold tracking-wider uppercase text-[#D4AF37]">Navigation</span>
                          </div>
                          <nav className="flex flex-col gap-3">
                            <Link
                              to="/"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              Home
                            </Link>
                            <Link
                              to="/properties"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              Properties
                            </Link>
                            <Link
                              to="/maps"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              Maps
                            </Link>
                            <Link
                              to="/files"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              Files
                            </Link>
                            <Link
                            to="/calculator"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                            activeProps={{
                            className: "flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                            }}
                            onClick={() => setIsOpen(false)}
                            >
                            <Calculator className="w-5 h-5" />
                              Zalmi Calculator
                             </Link>
                            <Link
                              to="/about"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              About Us
                            </Link>
                            <Link
                              to="/contact"
                              className="px-4 py-2.5 rounded-xl text-white hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all font-medium"
                              activeProps={{
                                className: "px-4 py-2.5 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] font-bold border border-[#D4AF37]/40",
                              }}
                              onClick={() => setIsOpen(false)}
                            >
                              Contact Us
                            </Link>
                          </nav>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </nav>
              </div>
        </div>
      </header>
    </>
  );
}


