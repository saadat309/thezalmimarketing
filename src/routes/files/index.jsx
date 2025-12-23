import React, { useState, useEffect } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchFileProperties, fetchFileFilterOptions } from "@/lib/api";
import { GlobalHero } from "@/components/global/GlobalHero";
import PropertyCard from "@/components/global/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, ChevronDown } from 'lucide-react';
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
      // Small delay to ensure the DOM is rendered
      const timer = setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Highlight effect
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

  const [areaInput, setAreaInput] = useState(initialSearch.area || "");
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(initialSearch.areaUnit || "sqft");

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSocietyDropdownOpen, setIsSocietyDropdownOpen] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [isFileTypeDropdownOpen, setIsFileTypeDropdownOpen] = useState(false);
  const [isAreaUnitDropdownOpen, setIsAreaUnitDropdownOpen] = useState(false);

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
      case 'file_type': setSelectedFileType(value); break;
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
    <div>
      <GlobalHero
        image={"/images/real-estate-6688945_1280.jpg"}
        overlay
        height="60vh"
        contentWrapperClass="relative z-10 w-full h-full flex items-end"
        contentInnerClass="w-full max-w-7xl pt-6 px-4 text-white text-left mb-8"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className="px-4 py-4 pt-24 mx-auto text-4xl font-extrabold text-center text-white wrap-break-word sm:text-5xl lg:text-6xl">
            Explore Files
          </h1>
          <div className="relative w-full max-w-4xl px-4 mt-8">
            <Search className="absolute text-muted-foreground -translate-y-1/2 left-7 top-1/2" />
            <Input
              type="text"
              placeholder="Search files, societies, phases..."
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

              <DropdownMenu
                modal={false}
                open={isFileTypeDropdownOpen}
                onOpenChange={setIsFileTypeDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] justify-between bg-background text-black"
                  >
                    {selectedFileType || "File Type"}
                    <ChevronDown className="ml-2 h-4 w-4 text-black" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      handleFilterChange("file_type", "");
                      setIsFileTypeDropdownOpen(false);
                    }}
                  >
                    All File Types
                  </DropdownMenuItem>
                  {filterOptions?.fileTypes.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => {
                        handleFilterChange("file_type", type);
                        setIsFileTypeDropdownOpen(false);
                      }}
                    >
                      {type}
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
                    <ChevronDown className="ml-2 h-4 w-4 text-black" />
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
                    <SheetTitle>Filter Files</SheetTitle>
                    <SheetDescription>
                      Apply filters to narrow down your file search.
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

                    <div className="grid items-center grid-cols-4 gap-4">
                      <Label htmlFor="file-type-mobile" className="text-right">
                        File Type
                      </Label>
                      <Select
                        id="file-type-mobile"
                        onValueChange={(value) =>
                          handleFilterChange("file_type", value)
                        }
                        value={selectedFileType}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="File Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions?.fileTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
      <div className="container py-8 px-4 mx-auto">
        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <PropertyCard key={i} isLoading={true} />
            ))}
          </div>
        ) : fileProperties && fileProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {fileProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Search className="w-16 h-16 mb-4" />
            <p className="text-xl font-semibold">
              No files found matching your criteria.
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
