import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchProperties, fetchFilterOptions } from "@/lib/api";
import PropertyCard from "@/components/global/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Home, ChevronDown } from 'lucide-react';
import { useDebounce } from "@/hooks/use-debounce";
import content from "@/content/pages/properties.json";

const propertiesQueryOptions = (filters) =>
  queryOptions({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    refetchOnWindowFocus: false,
  });

const filterOptionsQueryOptions = queryOptions({
  queryKey: ['filterOptions'],
  queryFn: () => fetchFilterOptions(),
});

export const Route = createFileRoute("/properties/")({
  head: ({ loaderData }) => {
    const properties = loaderData || [];
    
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": properties.map((property, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://thezalmimarketing.com/properties/${property.slug}/`,
        "name": property.title
      }))
    };

    return {
      meta: [
        {title: "Properties for Sale & Rent in Pakistan | The Zalmi Marketing"},
        {
          name: "description",
          content:
            "Browse properties for sale, rent, and installment plans across Pakistan. Filter by city, price, area, and type.",
        },
        { name: "robots", content: "index, follow" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "Properties for Sale & Rent in Pakistan | The Zalmi Marketing" },
        { property: "og:description", content: "Browse verified property listings across Pakistan by The Zalmi Marketing." },
        { property: "og:url", content: "https://thezalmimarketing.com/properties/" },
        { property: "og:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:url", content: "https://thezalmimarketing.com/properties/" },
        { name: "twitter:title", content: "Properties for Sale & Rent in Pakistan | The Zalmi Marketing" },
        { name: "twitter:description", content: "Browse verified property listings across Pakistan by The Zalmi Marketing." },
        { name: "twitter:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
      ],
      links: [
        { rel: "canonical", href: "https://thezalmimarketing.com/properties/" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://thezalmimarketing.com/" },
              { "@type": "ListItem", "position": 2, "name": "Properties", "item": "https://thezalmimarketing.com/properties/" }
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
    await queryClient.ensureQueryData(filterOptionsQueryOptions);
    return queryClient.ensureQueryData(propertiesQueryOptions(search));
  },

  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = useNavigate();
  const initialSearch = Route.useSearch();

  const { data: properties, isLoading, isFetching } = useQuery(propertiesQueryOptions(initialSearch));
  const { data: filterOptions } = useQuery(filterOptionsQueryOptions);

  const [searchQuery, setSearchQuery] = useState(initialSearch.query || "");
  const [selectedCategory, setSelectedCategory] = useState(initialSearch.category || "");
  const [selectedCity, setSelectedCity] = useState(initialSearch.city || "");
  const [selectedBeds, setSelectedBeds] = useState(initialSearch.beds || "");
  const [selectedBaths, setSelectedBaths] = useState(initialSearch.baths || "");
  const [selectedPropertyType, setSelectedPropertyType] = useState(initialSearch.property_type || "");
  const [selectedPriceType, setSelectedPriceType] = useState(initialSearch.priceType || "");
  const [selectedSociety, setSelectedSociety] = useState(initialSearch.societyName || "");
  const [selectedPhase, setSelectedPhase] = useState(initialSearch.phase || "");

  const [areaInput, setAreaInput] = useState(initialSearch.area || "");
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(initialSearch.areaUnit || "sqft");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery !== initialSearch.query) {
      const newSearch = { ...initialSearch, query: debouncedSearchQuery };
      if (!debouncedSearchQuery) {
        delete newSearch.query;
      }
      navigate({ to: "/properties", search: newSearch, replace: true });
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
      case 'category': setSelectedCategory(value === "all" ? "" : value); break;
      case 'city': setSelectedCity(value === "all" ? "" : value); break;
      case 'beds': setSelectedBeds(value === "all" ? "" : value); break;
      case 'baths': setSelectedBaths(value === "all" ? "" : value); break;
      case 'property_type': setSelectedPropertyType(value === "all" ? "" : value); break;
      case 'priceType': setSelectedPriceType(value === "all" ? "" : value); break;
      case 'area': setAreaInput(value); break;
      case 'areaUnit': setSelectedAreaUnit(value); break;
      case 'societyName': setSelectedSociety(value === "all" ? "" : value); break;
      case 'phase': setSelectedPhase(value === "all" ? "" : value); break;
    }
    
    navigate({ to: "/properties", search: newSearch, replace: true });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedCity("");
    setSelectedBeds("");
    setSelectedBaths("");
    setAreaInput("");
    setSelectedAreaUnit("sqft");
    setSelectedPropertyType("");
    setSelectedPriceType("");
    setSelectedSociety("");
    setSelectedPhase("");

    navigate({ to: "/properties", search: {}, replace: true });
  };

  const isFilterActive = Object.keys(initialSearch).some(key => initialSearch[key] !== undefined && key !== 'image' && key !== 'categoryName');

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Independent Entry Section with Proper Navbar Spacing (matching Maps and Files) */}
      <section className="relative pt-36 pb-20 sm:pt-40 sm:pb-24 bg-slate-950 dark:bg-slate-950 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 scale-105 transform hover:scale-100 transition-transform duration-1000" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="outline" className="px-4 py-1.5 text-xs font-medium text-white border-[#F5A623]/40 dark:border-[#D4AF37]/40 bg-[#F5A623]/10 dark:bg-[#D4AF37]/10 rounded-full">
            <Home className="w-3.5 h-3.5 text-[#F5A623] dark:text-[#D4AF37] mr-2 inline" /> {content.hero.badge}
          </Badge>
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl font-display">
            {content.hero.heading}
          </h1>
          {initialSearch.categoryName && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {initialSearch.categoryName}
            </Badge>
          )}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-luxury-muted">
            {content.hero.subheading}
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-muted" />
              <Input
                type="text"
                placeholder={content.hero.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white/10 border-[#F5A623]/30 dark:border-[#D4AF37]/30 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-[#F5A623] dark:focus:border-[#D4AF37] rounded-2xl text-base shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left-hand Advanced Filter Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div 
              className="flex items-center justify-between pb-4 border-b border-[#F5A623]/20 dark:border-[#D4AF37]/20 lg:cursor-default cursor-pointer"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <h2 className="text-lg font-display font-bold text-card-foreground flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#F5A623] dark:text-[#D4AF37]" />
                Advanced Filters
                {isFilterActive && <span className="w-2 h-2 rounded-full bg-[#F5A623] inline-block lg:hidden" />}
              </h2>
              <div className="flex items-center gap-2">
                {isFilterActive && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleClearFilters(); }} className="text-xs text-[#F5A623] dark:text-[#D4AF37] hover:text-[#F5A623]/80 hover:bg-[#F5A623]/10 dark:hover:bg-[#D4AF37]/10">
                    Reset All
                  </Button>
                )}
                <ChevronDown className={`w-5 h-5 text-muted-foreground lg:hidden transition-transform duration-200 ${isMobileFilterOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <div className={`space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden'} lg:block`}>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
              <Select
                onValueChange={(value) => handleFilterChange("category", value === "all" ? "" : value)}
                value={selectedCategory || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filterOptions?.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</Label>
              <Select
                onValueChange={(value) => handleFilterChange("city", value === "all" ? "" : value)}
                value={selectedCity || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {filterOptions?.cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Society Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Society</Label>
              <Select
                onValueChange={(value) => handleFilterChange("societyName", value === "all" ? "" : value)}
                value={selectedSociety || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Societies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Societies</SelectItem>
                  {filterOptions?.societyNames.map((society) => (
                    <SelectItem key={society} value={society}>{society}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phase Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phase</Label>
              <Select
                onValueChange={(value) => handleFilterChange("phase", value === "all" ? "" : value)}
                value={selectedPhase || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Phases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {filterOptions?.phases.map((phase) => (
                    <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Property Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property Type</Label>
              <Select
                onValueChange={(value) => handleFilterChange("property_type", value === "all" ? "" : value)}
                value={selectedPropertyType || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions?.propertyTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Type Filter */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price Type</Label>
              <Select
                onValueChange={(value) => handleFilterChange("priceType", value === "all" ? "" : value)}
                value={selectedPriceType || "all"}
              >
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="All Price Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Price Types</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="installment">Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Beds & Baths */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Beds</Label>
                <Select
                  onValueChange={(value) => handleFilterChange("beds", value === "all" ? "" : value)}
                  value={selectedBeds || "all"}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((bed) => (
                      <SelectItem key={bed} value={String(bed)}>{bed}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Baths</Label>
                <Select
                  onValueChange={(value) => handleFilterChange("baths", value === "all" ? "" : value)}
                  value={selectedBaths || "all"}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    {[1, 2, 3, 4, 5].map((bath) => (
                      <SelectItem key={bath} value={String(bath)}>{bath}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Size & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Area Size</Label>
                <Input
                  type="number"
                  placeholder="Size"
                  className="bg-background text-foreground border-input"
                  value={areaInput}
                  onChange={(e) => handleFilterChange("area", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Unit</Label>
                <Select
                  onValueChange={(value) => handleFilterChange("areaUnit", value)}
                  value={selectedAreaUnit || "sqft"}
                >
                  <SelectTrigger className="bg-background text-foreground">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqft">Sqft</SelectItem>
                    <SelectItem value="marla">Marla</SelectItem>
                    <SelectItem value="kanal">Kanal</SelectItem>
                    <SelectItem value="yard">Sq Yards</SelectItem>
                    <SelectItem value="hectare">Hectare</SelectItem>
                    <SelectItem value="acre">Acre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isFilterActive && (
              <Button variant="destructive" className="w-full mt-2" onClick={handleClearFilters}>
                Clear All Filters
              </Button>
            )}
            </div>
          </aside>

          {/* Right-hand Dynamic Property Grid */}
          <main className="lg:col-span-8 w-full">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground font-sans">
                Showing <span className="font-bold text-foreground">{properties?.length || 0}</span> verified properties
              </p>
            </div>

            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <PropertyCard key={i} isLoading={true} />
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {properties.map((property) => (
                  <Link key={property.id} to={`/properties/${property.slug}`}>
                    <PropertyCard {...property} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-[#F5A623]/20 dark:border-[#D4AF37]/20 rounded-2xl p-8">
                <Search className="w-16 h-16 mb-4 text-[#F5A623] dark:text-[#D4AF37]" />
                <p className="text-xl font-semibold text-card-foreground">
                  No properties found matching your criteria.
                </p>
                <p className="text-sm mt-2 text-muted-foreground">Try broadening your search or resetting filters.</p>
                <Button onClick={handleClearFilters} className="mt-6 bg-[#F5A623] dark:bg-[#D4AF37] hover:bg-[#F5A623]/90 dark:hover:bg-[#D4AF37]/90 text-slate-950 font-bold">
                  Clear Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
