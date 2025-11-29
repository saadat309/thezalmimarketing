import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query'; // Import queryOptions
import { fetchProperties } from "@/lib/api"; // Import fetchProperties from your API
import { GlobalHero } from "@/components/global/GlobalHero";
import PropertyCard from "@/components/global/PropertyCard";

// Define query options for properties data
const propertiesQueryOptions = () =>
  queryOptions({
    queryKey: ['properties'],
    queryFn: () => fetchProperties(),
  });

export const Route = createFileRoute("/properties/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(propertiesQueryOptions()), // Use queryClient to fetch data

  component: RouteComponent,
});




import { Badge } from "@/components/ui/badge";

function RouteComponent() {
  const properties = Route.useLoaderData();
  const { image, categoryName } = Route.useSearch();
  return (
    <div>
      <GlobalHero
        image={image || "/images/real-estate-6688945_1280.jpg"}
        overlay
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="px-4 py-4 mx-auto text-4xl text-center text-white">
            Explore Properties
          </h1>
          {categoryName && <Badge variant="secondary" className="text-lg">{categoryName}</Badge>}
        </div>
      </GlobalHero>
      <div className="container py-8 mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {properties.map((property) => (
            property.is_file ? (
              <div key={property.id}>
                <PropertyCard {...property} />
              </div>
            ) : (
              <Link key={property.id} to={`/properties/${property.id}`}>
                <PropertyCard {...property} />
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
