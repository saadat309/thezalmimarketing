import React, { useState, useEffect } from "react";
import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchMaps, fetchMapFilterOptions } from "@/lib/api";
import { GlobalHero } from "@/components/global/GlobalHero";
import MapCard from "@/components/global/MapCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown } from 'lucide-react';
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

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);

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
    if (value) {
      newSearch[filterName] = value;
    } else {
      delete newSearch[filterName];
    }

    switch (filterName) {
      case 'query': setSearchQuery(value); break;
      case 'city': setSelectedCity(value); break;
      case 'societyName': setSelectedSociety(value); break;
      case 'phase': setSelectedPhase(value); break;
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
    <div>
      <GlobalHero
        image="/images/maps-page-image.jpg"
        overlay
        height="60vh"
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-7xl pt-6 px-4 text-white text-left mb-8"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white wrap-break-word sm:text-5xl lg:text-6xl">
            All Maps
          </h1>
          <div className="relative w-full max-w-4xl px-4 mt-8">
            <Search className="absolute text-muted-foreground -translate-y-1/2 left-7 top-1/2" />
            <Input
              type="text"
              placeholder="Search maps, cities, societies, phases..."
              className="w-full py-6 pl-14 pr-4 rounded-full shadow-lg bg-background text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Popovers / Sheet */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <div className="hidden lg:flex flex-wrap items-center justify-center gap-2">
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
                    <ChevronDown className="ml-2 h-4 w-4 text-black" />
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
                    <ChevronDown className="ml-2 h-4 w-4 text-black" />
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
                    <ChevronDown className="ml-2 h-4 w-4 text-black" />
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

              {isFilterActive && (
                <Button variant="destructive" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Mobile Filter Sheet */}
            <div className="lg:hidden flex gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-background text-black"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {isFilterActive && (
                      <Badge className="ml-1 px-2">Active</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter Maps</SheetTitle>
                    <SheetDescription>
                      Apply filters to narrow down your map search.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
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
      <div className="container py-8 px-4 mx-auto">
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <MapCard key={i} isLoading={true} />
            ))}
          </div>
        ) : maps && maps.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {maps.map((item) => (
              <MapCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">
              No maps found matching your criteria.
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
