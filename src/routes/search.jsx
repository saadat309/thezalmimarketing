import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchGlobalSearch } from '@/lib/api';
import PropertyCard from '@/components/global/PropertyCard';
import MapCard from '@/components/global/MapCard';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryCard from '@/components/home/CategoryCard';
import { GlobalHero } from "@/components/global/GlobalHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
        { title: "Search Properties | The Zalmi Marketing" },
        {
          name: "description",
          content:
            "Search for properties, maps, and investment opportunities across Pakistan with The Zalmi Marketing.",
        },
        { name: "robots", content: "noindex, follow" },
      ],
  }),
  component: SearchResults,
  validateSearch: (search) => {
    return {
      q: search.q || "",
    };
  },
});

function SearchResults() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(q);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    setSearchQuery(q);
  }, [q]);

  useEffect(() => {
    if (debouncedSearchQuery !== q) {
      navigate({
        to: '/search',
        search: { q: debouncedSearchQuery },
        replace: true,
      });
    }
  }, [debouncedSearchQuery, navigate, q]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['globalSearch', q],
    queryFn: () => fetchGlobalSearch(q),
    enabled: !!q,
  });

  const { properties, files, maps, categories, cities, societies, phases, labels, propertyTypes, priceTypes, fileTypes } = data || {};

  const suggestionLists = [
    { title: 'Cities', items: cities, linkPrefix: '/properties?city=' },
    { title: 'Societies', items: societies, linkPrefix: '/properties?societyName=' },
    { title: 'Phases', items: phases, linkPrefix: '/properties?phase=' },
    { title: 'Labels', items: labels, linkPrefix: '/properties?query=' },
    { title: 'Property Types', items: propertyTypes, linkPrefix: '/properties?property_type=' },
    { title: 'Price Types', items: priceTypes, linkPrefix: '/properties?priceType=' },
    { title: 'File Types', items: fileTypes, linkPrefix: '/files?file_type=' },
  ];

  const hasResults = properties?.length || files?.length || maps?.length || categories?.length || suggestionLists.some(list => list.items?.length > 0);

  return (
    <div>
      <GlobalHero
        image={"/images/search_page_hero_bg.jpg"}
        overlay
        height="50vh"
      >
        <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl font-bold md:text-5xl">Search Results</h1>
          <form className="w-full max-w-xl mt-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter Name, Keywords..."
                className="w-full p-5 pr-12 text-black border-0 rounded-full bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute p-3 -translate-y-1/2 rounded-full right-2 top-1/2 bg-muted"
                aria-label="search"
              >
                <Search className="w-5 h-5 text-black" />
              </Button>
            </div>
          </form>
          {q && <p className="mt-4 text-lg">Showing results for: "{q}"</p>}
        </div>
      </GlobalHero>

      {!q ? (
        <div className="container px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Search for anything</h1>
          <p className="text-muted-foreground">
            Enter a search term in the search bar to get started.
          </p>
        </div>
      ) : isLoading ? (
        <div className="container flex justify-center px-4 py-12">
          <Spinner size="large" />
        </div>
      ) : isError ? (
        <div className="container px-4 py-12 text-center text-destructive">
          Error: {error.message}
        </div>
      ) : !hasResults ? (
        <div className="container px-4 py-12 text-center">
          <p className="mt-4">No results found for "{q}".</p>
        </div>
      ) : (
        <div className="container px-4 py-12 mx-auto">
          <div className="grid grid-cols-1 gap-8 mt-8 lg:grid-cols-4">
            <div className="lg:col-span-3">
              {/* Categories results - Moved to main view */}
              {categories && categories.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold">Categories</h2>
                  <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => (
                      <CategoryCard {...category} key={category.id} />
                    ))}
                  </div>
                </section>
              )}

              {/* Main results */}
              {properties && properties.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold">Properties</h2>
                  <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 xl:grid-cols-3">
                    {properties.map((property) => (
                      <Link key={property.id} to={`/properties/${property.slug}`}>
                        <PropertyCard {...property} />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {files && files.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold">Files</h2>
                  <div className="grid grid-cols-1 gap-6 mt-4 md:grid-cols-2 xl:grid-cols-3">
                    {files.map((file) => (
                      <PropertyCard key={file.id} {...file} />
                    ))}
                  </div>
                </section>
              )}

              {maps && maps.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold">Maps</h2>
                  <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                    {maps.map((map) => (
                      <MapCard key={map.id} {...map} />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-6 lg:col-span-1">
              {/* Suggestions and other results */}
              {suggestionLists.map(
                (list) =>
                  list.items &&
                  list.items.length > 0 && (
                    <Card key={list.title}>
                      <CardHeader>
                        <CardTitle>{list.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {list.items.map((item) => (
                            <li key={item}>
                              <Link
                                to={`${list.linkPrefix}${encodeURIComponent(item)}`}
                                className="text-blue-500 hover:underline"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
