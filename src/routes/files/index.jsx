import React, { useState, useEffect } from "react";
import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchFileProperties, fetchFileFilterOptions } from "@/lib/api";
import PropertyCard from "@/components/global/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, RotateCcw, Warehouse, ShieldCheck, ChevronDown } from 'lucide-react';
import { useDebounce } from "@/hooks/use-debounce";

const filesQueryOptions = (filters) =>
  queryOptions({
    queryKey: ['files', filters],
    queryFn: () => fetchFileProperties(filters),
    refetchOnWindowFocus: false,
  });

const fileFilterOptionsQueryOptions = queryOptions({
  queryKey: ['fileFilterOptions'],
  queryFn: () => fetchFileFilterOptions(),
});

export const Route = createFileRoute("/files/")({
  head: () => ({
    meta: [
      { title: "Real Estate Plot Files for Sale in Pakistan | The Zalmi Marketing" },
      {
        name: "description",
        content:
          "Find plot files and investment opportunities in top housing schemes across Pakistan. Secure your future with verified plot files.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Real Estate Plot Files for Sale in Pakistan | The Zalmi Marketing" },
      { property: "og:description", content: "Explore verified real estate plot files for sale across Pakistan at The Zalmi Marketing." },
      { property: "og:url", content: "https://thezalmimarketing.com/files/" },
      { property: "og:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:url", content: "https://thezalmimarketing.com/files/" },
      { name: "twitter:title", content: "Real Estate Plot Files for Sale in Pakistan | The Zalmi Marketing" },
      { name: "twitter:description", content: "Explore verified real estate plot files for sale across Pakistan at The Zalmi Marketing." },
      { name: "twitter:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
    ],
    links: [
      { rel: "canonical", href: "https://thezalmimarketing.com/files/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
            { "@type": "ListItem", "position": 2, "name": "Files", "item": "https://thezalmimarketing.com/files/" }
          ]
        }),
      },
    ],
  }),
  loader: async ({ context: { queryClient }, search }) => {
    await queryClient.ensureQueryData(fileFilterOptionsQueryOptions);
    return queryClient.ensureQueryData(filesQueryOptions(search));
  },
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const initialSearch = Route.useSearch();
  const scrollToId = initialSearch.scrollTo;

  const { data: fileProperties, isLoading, isFetching } = useQuery(filesQueryOptions(initialSearch));
  const { data: filterOptions } = useQuery(fileFilterOptionsQueryOptions);

  useEffect(() => {
    if (!isLoading && !isFetching && scrollToId && fileProperties) {
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-amber-500', 'ring-offset-4');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-amber-500', 'ring-offset-4');
          }, 2000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isFetching, scrollToId, fileProperties]);

  const [searchQuery, setSearchQuery] = useState(initialSearch.query || "");
  const [selectedCity, setSelectedCity] = useState(initialSearch.city || "");
  const [selectedSociety, setSelectedSociety] = useState(initialSearch.societyName || "");
  const [selectedPhase, setSelectedPhase] = useState(initialSearch.phase || "");
  const [selectedFileType, setSelectedFileType] = useState(initialSearch.file_type || "");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [areaInput, setAreaInput] = useState(initialSearch.area || "");
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(initialSearch.areaUnit || "sqft");

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery !== initialSearch.query) {
      const newSearch = { ...initialSearch, query: debouncedSearchQuery };
      if (!debouncedSearchQuery) {
        delete newSearch.query;
      }
      navigate({ to: "/files", search: newSearch, replace: true });
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
      case 'file_type': setSelectedFileType(value === "all" ? "" : value); break;
      case 'area': setAreaInput(value); break;
      case 'areaUnit': setSelectedAreaUnit(value); break;
    }

    navigate({ to: "/files", search: newSearch, replace: true });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedSociety("");
    setSelectedPhase("");
    setSelectedFileType("");
    setAreaInput("");
    setSelectedAreaUnit("sqft");
    navigate({ to: "/files", search: {}, replace: true });
  };

  const isFilterActive = Object.keys(initialSearch).some(key => initialSearch[key] !== undefined && key !== 'image' && key !== 'categoryName');

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Independent Entry Section with Proper Navbar Spacing */}
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium text-white border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline" /> Verified Plot Files Market Watch
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">
            Plot Files & Investment Inventory
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted">
            Browse verified plot files, allocation letters, and open files across top housing schemes with live market updates.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-muted" />
              <Input
                type="text"
                placeholder="Search files by society, phase, or file type..."
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
                  <Filter className="w-4 h-4 text-[#F5A623] dark:text-[#D4AF37]" /> Filter Files
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

              {/* File Type Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">File Type</Label>
                <Select value={selectedFileType || "all"} onValueChange={(val) => handleFilterChange('file_type', val)}>
                  <SelectTrigger className="w-full h-11 bg-background text-foreground">
                    <SelectValue placeholder="All File Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All File Types</SelectItem>
                    {filterOptions?.fileTypes?.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area Size Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Area Size</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Size"
                    value={areaInput}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                    className="h-11 bg-background text-foreground"
                  />
                  <Select value={selectedAreaUnit} onValueChange={(val) => handleFilterChange('areaUnit', val)}>
                    <SelectTrigger className="w-[100px] h-11 bg-background text-foreground">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sqft">Sqft</SelectItem>
                      <SelectItem value="marla">Marla</SelectItem>
                      <SelectItem value="kanal">Kanal</SelectItem>
                      <SelectItem value="yard">Yards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                Showing <strong className="text-foreground">{fileProperties?.length || 0}</strong> verified plot files
              </span>
              {isFilterActive && (
                <Badge variant="secondary" className="px-3 py-1">Filters Active</Badge>
              )}
            </div>

            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <PropertyCard key={i} isLoading={true} />
                ))}
              </div>
            ) : fileProperties && fileProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {fileProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-border text-center p-8">
                <Warehouse className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Files Found</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  We couldn't find any plot files matching your criteria. Try adjusting your filters or search query.
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
