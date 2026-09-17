import React, { useState, useEffect } from "react";
import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchMaps, fetchMapFilterOptions } from "@/lib/api";
import MapCard from "@/components/global/MapCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RotateCcw, MapPin, Compass, ChevronDown } from 'lucide-react';
import { useDebounce } from "@/hooks/use-debounce";

const mapsQueryOptions = (filters) =>
  queryOptions({
    queryKey: ['maps', filters],
    queryFn: () => fetchMaps(filters),
    refetchOnWindowFocus: false,
  });

const mapFilterOptionsQueryOptions = queryOptions({
  queryKey: ['mapFilterOptions'],
  queryFn: () => fetchMapFilterOptions(),
});

export const Route = createFileRoute("/maps/")({
  head: ({ loaderData }) => {
    const maps = loaderData || [];
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": maps.map((map, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://thezalmimarketing.com/maps/`,
        "name": map.title
      }))
    };

    return {
      title: "Society Maps & Master Plans in Pakistan | The Zalmi Marketing",
      meta: [
        { title: "Society Maps & Master Plans in Pakistan | The Zalmi Marketing" },
        {
          name: "description",
          content:
            "Browse and download official master plans and society maps for DHA, Bahria Town, and other major housing societies in Pakistan.",
        },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "Society Maps & Master Plans in Pakistan | The Zalmi Marketing" },
        { property: "og:description", content: "Access official society maps and master plans across Pakistan at The Zalmi Marketing." },
        { property: "og:url", content: "https://thezalmimarketing.com/maps/" },
        { property: "og:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: "https://thezalmimarketing.com/maps/" },
        { name: "twitter:title", content: "Society Maps & Master Plans in Pakistan | The Zalmi Marketing" },
        { name: "twitter:description", content: "Access official society maps and master plans across Pakistan at The Zalmi Marketing." },
        { name: "twitter:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
      ],
      links: [
        { rel: "canonical", href: "https://thezalmimarketing.com/maps/" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
              { "@type": "ListItem", "position": 2, "name": "Maps", "item": "https://thezalmimarketing.com/maps/" }
            ]
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(itemListSchema),
        },
      ],
    };
  },
  loader: async ({ context: { queryClient }, search }) => {
    await queryClient.ensureQueryData(mapFilterOptionsQueryOptions);
    return queryClient.ensureQueryData(mapsQueryOptions(search));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const initialSearch = Route.useSearch();

  const { data: maps, isLoading, isFetching } = useQuery(mapsQueryOptions(initialSearch));
  const { data: filterOptions } = useQuery(mapFilterOptionsQueryOptions);

  const [searchQuery, setSearchQuery] = useState(initialSearch.query || "");
  const [selectedCity, setSelectedCity] = useState(initialSearch.city || "");
  const [selectedSociety, setSelectedSociety] = useState(initialSearch.societyName || "");
  const [selectedPhase, setSelectedPhase] = useState(initialSearch.phase || "");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery !== initialSearch.query) {
      const newSearch = { ...initialSearch, query: debouncedSearchQuery };
      if (!debouncedSearchQuery) {
        delete newSearch.query;
      }
      navigate({ to: "/maps", search: newSearch, replace: true });
    }
  }, [debouncedSearchQuery, navigate, initialSearch]);

  const handleFilterChange = (filterName, value) => {
    let newSearch = { ...initialSearch };
    if (value && value !== "all") {
      newSearch[filterName] = value;
    } else {
      delete newSearch[filterName];
    }

    switch (filterName) {
      case 'query': setSearchQuery(value); break;
      case 'city': setSelectedCity(value === "all" ? "" : value); break;
      case 'societyName': setSelectedSociety(value === "all" ? "" : value); break;
      case 'phase': setSelectedPhase(value === "all" ? "" : value); break;
    }

    navigate({ to: "/maps", search: newSearch, replace: true });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSociety("");
    setSelectedPhase("");
    navigate({ to: "/maps", search: {}, replace: true });
  };

  const isFilterActive = Object.keys(initialSearch).some(key => initialSearch[key] !== undefined && key !== 'image' && key !== 'categoryName');

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Independent Entry Section with Proper Navbar Spacing */}
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium text-white border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full">
            <Compass className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline" /> Official Society Master Plans
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">
            Society Maps & Blueprints
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted">
            Explore verified master plans, phase layouts, and high-resolution blueprint maps across DHA and major housing societies.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-muted" />
              <Input
                type="text"
                placeholder="Search maps by title, society name, or phase..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/10 border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-[#F5A623] dark:focus:border-[#D4AF37] rounded-2xl text-base shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Split-View Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sticky Filter Sidebar */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-lg space-y-6">
              <div 
                className="flex items-center justify-between pb-4 border-b border-border lg:cursor-default cursor-pointer"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37]" /> Filter Maps
                  {isFilterActive && <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block lg:hidden" />}
                </h3>
                <div className="flex items-center gap-2">
                  {isFilterActive && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="text-xs text-[#F5A623] dark:text-[#D4AF37] hover:text-[#F5A623]/80 h-8 px-2">
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                    </Button>
                  )}
                  <ChevronDown className={`w-5 h-5 text-muted-foreground lg:hidden transition-transform duration-200 ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>

              <div className={`space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden'} lg:block`}>

              {/* City Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</Label>
                <Select value={selectedCity || "all"} onValueChange={(val) => handleFilterChange('city', val)}>
                  <SelectTrigger className="w-full h-11 bg-background text-foreground">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {filterOptions?.cities?.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Society Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Society</Label>
                <Select value={selectedSociety || "all"} onValueChange={(val) => handleFilterChange('societyName', val)}>
                  <SelectTrigger className="w-full h-11 bg-background text-foreground">
                    <SelectValue placeholder="All Societies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Societies</SelectItem>
                    {filterOptions?.societyNames?.map(society => (
                      <SelectItem key={society} value={society}>{society}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phase Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phase</Label>
                <Select value={selectedPhase || "all"} onValueChange={(val) => handleFilterChange('phase', val)}>
                  <SelectTrigger className="w-full h-11 bg-background text-foreground">
                    <SelectValue placeholder="All Phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    {filterOptions?.phases?.map(phase => (
                      <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isFilterActive && (
                <Button variant="destructive" className="w-full h-11" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              )}
              </div>
            </div>
          </div>

          {/* Right Main Content Grid */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
              <span className="text-sm font-medium text-muted-foreground">
                Showing <strong className="text-foreground">{maps?.length || 0}</strong> verified society maps
              </span>
              {isFilterActive && (
                <Badge variant="secondary" className="px-3 py-1">Filters Active</Badge>
              )}
            </div>

            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <MapCard key={i} isLoading={true} />
                ))}
              </div>
            ) : maps && maps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {maps.map((item) => (
                  <MapCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border text-center p-8">
                <MapPin className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Maps Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  We couldn't find any maps matching your selected criteria. Try adjusting your filters or search query.
                </p>
                <Button onClick={handleClearFilters} className="mt-6 bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-bold">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
