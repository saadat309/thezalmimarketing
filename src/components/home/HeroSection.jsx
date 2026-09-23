import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Search, Home, Building2, Warehouse, ShieldCheck, TrendingUp, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Counter } from '@/components/global/Counter';
import FileMarquee from '@/components/home/FileMarquee';
import content from '@/content/pages/home.json';

const iconMap = {
  ShieldCheck: ShieldCheck,
  TrendingUp: TrendingUp,
  Compass: Compass,
  Home: Home,
  Building2: Building2,
  Warehouse: Warehouse,
};

const defaultCategoryIcons = [Home, Building2, Warehouse, Compass];

const AnimatedBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="inline-block mb-4"
  >
    
  </motion.div>
);

const RotatingHeadline = () => {
  const words = [
    "Dream Property",
    "Luxury Villa",
    "Prime Plot File",
    "Commercial Plaza",
    "Modern Penthouse",
    "DHA Estate",
    "Elite Residence"
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className="inline-block relative overflow-hidden h-[1.2em] align-top">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIndex]}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="block gold-text-gradient"
        >
          {words[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

const SearchField = ({ icon: Icon = Search, placeholder, className = "", value, onChange }) => (
  <div className={`relative flex-1 ${className}`}>
    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Icon className="w-4 h-4 text-white/70" />
    </div>
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-12 pl-10 pr-4 bg-white/5 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 focus:bg-white/10 focus:backdrop-blur-md focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/40 rounded-xl transition-all duration-300 text-sm font-medium shadow-inner"
    />
  </div>
);

export default function HeroSection({ categories = [], items = [] }) {
  const [activeTab, setActiveTab] = useState('properties');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const routeMap = {
      properties: '/properties',
      files: '/files',
      maps: '/maps'
    };
    navigate({
      to: routeMap[activeTab] || '/properties',
      search: searchQuery ? { query: searchQuery } : {},
    });
  };

  // Use first 4 categories from CategoriesSection if available, otherwise fallback to static shortcuts
  const shortcutsToDisplay = categories && categories.length > 0
    ? categories.slice(0, 3).map((cat, idx) => ({
        label: cat.title,
        to: '/properties',
        search: { category: cat.title, categoryName: cat.title, image: cat.src },
        icon: defaultCategoryIcons[idx % defaultCategoryIcons.length]
      }))
    : content.hero.trendingShortcuts.map((shortcut, i) => ({
        ...shortcut,
        icon: iconMap[shortcut.icon] || Home
      }));

  return (
    <section className="relative w-full flex flex-col overflow-hidden bg-[#0B0F19]">
      {/* Background with cinematic luxury overlay */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 50%, rgba(11, 15, 25, 0.90) 100%), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000')`,
        }}
        aria-hidden
      />

      {/* Mobile First View: Exactly 100vh, showing only headline and statistics with space to breathe */}
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-start items-center px-4 sm:px-6 pt-34 sm:pt-4 pb-20 lg:hidden text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <AnimatedBadge />

          <h1 className="text-3xl sm:text-5xl font-extrabold leading-12 text-white font-display tracking-tight">
            {content.hero.headlineMain} <br />
            <RotatingHeadline /> <br />
            {content.hero.headlineEnd}
          </h1>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-[#D4AF37]/20 max-w-md mx-auto">
            {content.hero.trustBadges.map((badge, i) => {
              const IconComponent = iconMap[badge.icon] || ShieldCheck;
              return (
                <div key={i} className="space-y-1 flex flex-col items-center text-center">
                  <div className="flex items-center justify-center text-[#D4AF37] font-bold text-sm sm:text-lg">
                    <IconComponent className="w-4 h-4 mr-1.5 shrink-0" /> <Counter value={badge.value} />
                  </div>
                  <div className="text-[11px] sm:text-xs text-luxury-muted">{badge.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white/50 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest mb-1">Scroll to Explore</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Desktop View: Side-by-side grid */}
      <div className="hidden lg:flex relative z-10 w-full min-h-[calc(100vh+10px)] flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-0">
        <div className="my-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Side: Headline, Value Proposition, Trust Badges */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              <AnimatedBadge />

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white font-display tracking-tight">
                {content.hero.headlineMain} <br />
                <RotatingHeadline /> <br />
                {content.hero.headlineEnd}
              </h1>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-[#D4AF37]/20 max-w-lg mx-auto lg:mx-0">
                {content.hero.trustBadges.map((badge, i) => {
                  const IconComponent = iconMap[badge.icon] || ShieldCheck;
                  return (
                    <div key={i} className="space-y-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start text-[#D4AF37] font-bold text-sm sm:text-lg lg:text-xl">
                        <IconComponent className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1.5 shrink-0" /> <Counter value={badge.value} />
                      </div>
                      <div className="text-[11px] sm:text-xs text-luxury-muted">{badge.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side: Interactive Search Console in Floating Glass Card */}
            <div className="lg:col-span-6 w-full">
              <div className="p-4 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 text-left">

                {/* Multi-Tab Switcher */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/5 border border-[#D4AF37]/20">
                  {content.hero.tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-sm font-semibold truncate transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-[#D4AF37] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  <SearchField
                    icon={Search}
                    placeholder={`Search ${activeTab === 'properties' ? 'properties, locations...' : activeTab === 'files' ? 'plot files, phases...' : 'master plans...'}`}
                    className="w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-950 font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-sm sm:text-base"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </Button>
                </form>

                {/* Quick Filter Pills (Dynamic from CategoriesSection) */}
                <div className="pt-2 text-left">
                  <span className="text-xs text-luxury-muted uppercase tracking-wider block mb-3">Trending Shortcuts:</span>
                  <div className="flex flex-wrap gap-2">
                    {shortcutsToDisplay.map((shortcut, i) => {
                      const IconComp = typeof shortcut.icon === 'function' ? shortcut.icon : (iconMap[shortcut.icon] || Home);
                      return (
                        <Link key={i} to={shortcut.to} search={shortcut.search}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs border-[#D4AF37]/20 bg-white/5 text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-300 rounded-full"
                          >
                            <IconComp className="w-3 h-3 mr-1.5" />
                            {shortcut.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* File Marquee positioned at the bottom of the Hero Section */}
        {/* (Moved to full-width section bottom) */}
      </div>

      {/* Mobile Below First View Content: Search Console & File Marquee */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12 lg:hidden">
        {/* Search Console for Mobile */}
        <div className="w-full">
          <div className="p-4 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-6 text-left">

            {/* Multi-Tab Switcher */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/5 border border-[#D4AF37]/20">
              {content.hero.tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 sm:px-3 rounded-xl text-[11px] sm:text-sm font-semibold truncate transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#D4AF37] text-slate-950 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <SearchField
                icon={Search}
                placeholder={`Search ${activeTab === 'properties' ? 'properties, locations...' : activeTab === 'files' ? 'plot files, phases...' : 'master plans...'}`}
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-slate-950 font-bold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-sm sm:text-base"
              >
                <Search className="w-5 h-5 mr-2" />
                Search {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Button>
            </form>

            {/* Quick Filter Pills */}
            <div className="pt-2 text-left">
              <span className="text-xs text-luxury-muted uppercase tracking-wider block mb-3">Trending Shortcuts:</span>
              <div className="flex flex-wrap gap-2">
                {shortcutsToDisplay.map((shortcut, i) => {
                  const IconComp = typeof shortcut.icon === 'function' ? shortcut.icon : (iconMap[shortcut.icon] || Home);
                  return (
                    <Link key={i} to={shortcut.to} search={shortcut.search}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-[#D4AF37]/20 bg-white/5 text-white hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all duration-300 rounded-full"
                      >
                        <IconComp className="w-3 h-3 mr-1.5" />
                        {shortcut.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Full width File Marquee for both mobile and desktop below respective content */}
      <div className="relative z-20 w-full pt-8 pb-6">
        <FileMarquee items={items} />
      </div>
    </section>
  );
}
