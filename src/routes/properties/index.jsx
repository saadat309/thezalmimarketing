import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchProperties, fetchFilterOptions } from "@/lib/api";
import { GlobalHero } from "@/components/global/GlobalHero";
import PropertyCard from "@/components/global/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Bed, Bath, AreaChart, ChevronDown } from 'lucide-react';
import { useDebounce } from "@/hooks/use-debounce";



// Define query options for properties data
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

        // Open Graph
        { property: "og:type", content: "website" },
        {
          property: "og:title",
          content: "Properties for Sale & Rent in Pakistan | The Zalmi Marketing",
        },
        {
          property: "og:description",
          content:
            "Browse verified property listings across Pakistan by The Zalmi Marketing.",
        },
              {
                property: "og:url",
                content: "https://thezalmimarketing.com/properties/",
              },
              { property: "og:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
              // Twitter
              { name: "twitter:card", content: "summary_large_image" },
              { name: "twitter:url", content: "https://thezalmimarketing.com/properties/" },
              { name: "twitter:title", content: "Properties for Sale & Rent in Pakistan | The Zalmi Marketing" },
              { name: "twitter:description", content: "Browse verified property listings across Pakistan by The Zalmi Marketing." },
              { name: "twitter:image", content: "https://thezalmimarketing.com/Zalmi Marketing Logo Black.webp" },
            ],      links: [
        {
          rel: "canonical",
          href: "https://thezalmimarketing.com/properties/",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://thezalmimarketing.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Properties",
                "item": "https://thezalmimarketing.com/properties/"
              }
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

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isBedsDropdownOpen, setIsBedsDropdownOpen] = useState(false);
  const [isBathsDropdownOpen, setIsBathsDropdownOpen] = useState(false);
  const [isPropertyTypeDropdownOpen, setIsPropertyTypeDropdownOpen] = useState(false);
  const [isPriceTypeDropdownOpen, setIsPriceTypeDropdownOpen] = useState(false);
  const [isAreaUnitDropdownOpen, setIsAreaUnitDropdownOpen] = useState(false);
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);


  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Debounce for search query
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
    if (value) {
      newSearch[filterName] = value;
    } else {
      delete newSearch[filterName];
    }

    // Reset current component's state as well for immediate UI feedback
    switch (filterName) {
      case 'query': setSearchQuery(value); break;
      case 'category': setSelectedCategory(value); break;
      case 'city': setSelectedCity(value); break;
      case 'beds': setSelectedBeds(value); break;
      case 'baths': setSelectedBaths(value); break;
      case 'property_type': setSelectedPropertyType(value); break;
      case 'priceType': setSelectedPriceType(value); break;
      case 'area': setAreaInput(value); break;
      case 'areaUnit': setSelectedAreaUnit(value); break;
      case 'societyName': setSelectedSociety(value); break;
      case 'phase': setSelectedPhase(value); break;
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
    <div>
      <GlobalHero
        image={initialSearch.image || "/images/apartments-1845884_1280.jpg"}
        overlay
        height="65vh"
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-7xl pt-6 px-4 text-white text-left mb-8"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white wrap-break-word sm:text-5xl lg:text-6xl">
            Explore Properties
          </h1>
          {initialSearch.categoryName && (
            <Badge variant="secondary" className="text-lg">
              {initialSearch.categoryName}
            </Badge>
          )}

          <div className="relative w-full max-w-4xl px-4 mt-8">
            <Search className="absolute -translate-y-1/2 text-muted-foreground left-7 top-1/2" />
            <Input
              type="text"
              placeholder="Search properties, cities, categories..."
              className="w-full py-6 pr-4 text-black rounded-full shadow-lg pl-14 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Popovers / Sheet */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <div className="flex-wrap items-center justify-center hidden gap-2 lg:flex">
              <DropdownMenu
                modal={false}
                open={isCategoryDropdownOpen}
                onOpenChange={setIsCategoryDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between bg-background text-black"
                  >
                    {selectedCategory || "Category"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("category", "");
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {filterOptions?.categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onClick={() => {
                        handleFilterChange("category", cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      {cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isCityDropdownOpen}
                onOpenChange={setIsCityDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between bg-background text-black"
                  >
                    {selectedCity || "City"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("city", "");
                      setIsCityDropdownOpen(false);
                    }}
                  >
                    All Cities
                  </DropdownMenuItem>
                  {filterOptions?.cities.map((city) => (
                    <DropdownMenuItem
                      key={city}
                      onClick={() => {
                        handleFilterChange("city", city);
                        setIsCityDropdownOpen(false);
                      }}
                    >
                      {city}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isSocietyDropdownOpen}
                onOpenChange={setIsSocietyDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between bg-background text-black"
                  >
                    {selectedSociety || "Society"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("societyName", "");
                      setIsSocietyDropdownOpen(false);
                    }}
                  >
                    All Societies
                  </DropdownMenuItem>
                  {filterOptions?.societyNames.map((society) => (
                    <DropdownMenuItem
                      key={society}
                      onClick={() => {
                        handleFilterChange("societyName", society);
                        setIsSocietyDropdownOpen(false);
                      }}
                    >
                      {society}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isPhaseDropdownOpen}
                onOpenChange={setIsPhaseDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] justify-between bg-background text-black"
                  >
                    {selectedPhase || "Phase"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("phase", "");
                      setIsPhaseDropdownOpen(false);
                    }}
                  >
                    All Phases
                  </DropdownMenuItem>
                  {filterOptions?.phases.map((phase) => (
                    <DropdownMenuItem
                      key={phase}
                      onClick={() => {
                        handleFilterChange("phase", phase);
                        setIsPhaseDropdownOpen(false);
                      }}
                    >
                      {phase}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isPropertyTypeDropdownOpen}
                onOpenChange={setIsPropertyTypeDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between bg-background text-black"
                  >
                    {selectedPropertyType || "Property Type"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("property_type", "");
                      setIsPropertyTypeDropdownOpen(false);
                    }}
                  >
                    All Types
                  </DropdownMenuItem>
                  {filterOptions?.propertyTypes.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => {
                        handleFilterChange("property_type", type);
                        setIsPropertyTypeDropdownOpen(false);
                      }}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isPriceTypeDropdownOpen}
                onOpenChange={setIsPriceTypeDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] justify-between bg-background text-black"
                  >
                    {selectedPriceType || "Price Type"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("priceType", "");
                      setIsPriceTypeDropdownOpen(false);
                    }}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("priceType", "rent");
                      setIsPriceTypeDropdownOpen(false);
                    }}
                  >
                    Rent
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("priceType", "sale");
                      setIsPriceTypeDropdownOpen(false);
                    }}
                  >
                    Sale
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("priceType", "installment");
                      setIsPriceTypeDropdownOpen(false);
                    }}
                  >
                    Installment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isBedsDropdownOpen}
                onOpenChange={setIsBedsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[120px] justify-between bg-background text-black"
                  >
                    {selectedBeds ? `${selectedBeds}+ Beds` : "Beds"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("beds", "");
                      setIsBedsDropdownOpen(false);
                    }}
                  >
                    Any
                  </DropdownMenuItem>
                  {[1, 2, 3, 4, 5].map((bed) => (
                    <DropdownMenuItem
                      key={bed}
                      onClick={() => {
                        handleFilterChange("beds", String(bed));
                        setIsBedsDropdownOpen(false);
                      }}
                    >
                      {bed}+
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu
                modal={false}
                open={isBathsDropdownOpen}
                onOpenChange={setIsBathsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[120px] justify-between bg-background text-black"
                  >
                    {selectedBaths ? `${selectedBaths}+ Baths` : "Baths"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("baths", "");
                      setIsBathsDropdownOpen(false);
                    }}
                  >
                    Any
                  </DropdownMenuItem>
                  {[1, 2, 3, 4, 5].map((bath) => (
                    <DropdownMenuItem
                      key={bath}
                      onClick={() => {
                        handleFilterChange("baths", String(bath));
                        setIsBathsDropdownOpen(false);
                      }}
                    >
                      {bath}+
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                type="number"
                placeholder="Area Size"
                className="w-[120px] bg-background text-black"
                value={areaInput}
                onChange={(e) => handleFilterChange("area", e.target.value)}
              />
              <DropdownMenu
                modal={false}
                open={isAreaUnitDropdownOpen}
                onOpenChange={setIsAreaUnitDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[100px] justify-between bg-background text-black"
                  >
                    {selectedAreaUnit || "Unit"}
                    <ChevronDown className="w-4 h-4 ml-2 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "sqft");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Sqft
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "marla");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Marla
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "kanal");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Kanal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "yard");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Sq Yards
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "hectare");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Hectare
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("areaUnit", "acre");
                      setIsAreaUnitDropdownOpen(false);
                    }}
                  >
                    Acre
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isFilterActive && (
                <Button variant="destructive" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Mobile Filter Sheet */}

            <div className="flex gap-2 lg:hidden">
              {" "}
              {/* Added flex and gap-2 */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 text-black bg-background"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {isFilterActive && (
                      <Badge className="px-2 ml-1">Active</Badge>
                    )}
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Properties</SheetTitle>

                    <SheetDescription>
                      Apply filters to narrow down your property search.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="category-mobile" className="text-right">
                        Category
                      </Label>

                      <Select
                        id="category-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("category", value)
                        }
                        value={selectedCategory}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>

                        <SelectContent>
                          {filterOptions?.categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="city-mobile" className="text-right">
                        City
                      </Label>

                      <Select
                        id="city-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("city", value)
                        }
                        value={selectedCity}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="City" />
                        </SelectTrigger>

                        <SelectContent>
                          {filterOptions?.cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="society-mobile" className="text-right">
                        Society
                      </Label>

                      <Select
                        id="society-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("societyName", value)
                        }
                        value={selectedSociety}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Society" />
                        </SelectTrigger>

                        <SelectContent>
                          {filterOptions?.societyNames.map((society) => (
                            <SelectItem key={society} value={society}>
                              {society}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="phase-mobile" className="text-right">
                        Phase
                      </Label>

                      <Select
                        id="phase-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("phase", value)
                        }
                        value={selectedPhase}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Phase" />
                        </SelectTrigger>

                        <SelectContent>
                          {filterOptions?.phases.map((phase) => (
                            <SelectItem key={phase} value={phase}>
                              {phase}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label
                        htmlFor="property-type-mobile"
                        className="text-right"
                      >
                        Property Type
                      </Label>

                      <Select
                        id="property-type-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("property_type", value)
                        }
                        value={selectedPropertyType}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Property Type" />
                        </SelectTrigger>

                        <SelectContent>
                          {filterOptions?.propertyTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="price-type-mobile" className="text-right">
                        Price Type
                      </Label>

                      <Select
                        id="price-type-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("priceType", value)
                        }
                        value={selectedPriceType}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Price Type" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="rent">Rent</SelectItem>

                          <SelectItem value="sale">Sale</SelectItem>

                          <SelectItem value="installment">
                            Installment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="beds-mobile" className="text-right">
                        Beds
                      </Label>

                      <Select
                        id="beds-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("beds", value)
                        }
                        value={selectedBeds}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Beds" />
                        </SelectTrigger>

                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((bed) => (
                            <SelectItem key={bed} value={String(bed)}>
                              {bed}+
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="baths-mobile" className="text-right">
                        Baths
                      </Label>

                      <Select
                        id="baths-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("baths", value)
                        }
                        value={selectedBaths}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Baths" />
                        </SelectTrigger>

                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((bath) => (
                            <SelectItem key={bath} value={String(bath)}>
                              {bath}+
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="area-mobile" className="text-right">
                        Area Size
                      </Label>

                      <Input
                        id="area-mobile"
                        type="number"
                        placeholder="Size"
                        className="col-span-3"
                        value={areaInput}
                        onChange={(e) =>
                          handleFilterChange("area", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="area-unit-mobile" className="text-right">
                        Unit
                      </Label>

                      <Select
                        id="area-unit-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("areaUnit", value)
                        }
                        value={selectedAreaUnit}
                      >
                        <SelectTrigger className="col-span-3">
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
                </SheetContent>
              </Sheet>
              {isFilterActive && (
                <Button variant="destructive" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </GlobalHero>
      <div className="container px-4 py-8 mx-auto">
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <PropertyCard key={i} isLoading={true} />
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {properties.map((property) => (
              <Link key={property.id} to={`/properties/${property.slug}`}>
                <PropertyCard {...property} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">
              No properties found matching your criteria.
            </p>
            <Button onClick={handleClearFilters} className="mt-4">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
