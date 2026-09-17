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
    <section className="relative w-full min-h-[calc(100vh+200px)] sm:min-h-[calc(100vh+250px)] flex flex-col justify-between overflow-hidden pt-28 sm:pt-36 lg:pt-32 pb-0">
      {/* Background with cinematic luxury overlay */}
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.75) 50%, rgba(11, 15, 25, 0.90) 100%), url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000')`,
        }}
        aria-hidden
      />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* Content container in a side-by-side grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto">
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

      {/* File Marquee positioned at the bottom of the Hero Section (outside first 100vh viewport) */}
      <div className="relative z-20 w-full mt-auto pt-16 sm:pt-28 pb-4 sm:pb-6">
        <FileMarquee items={items} />
      </div>
    </section>
  );
}
