import { createFileRoute } from "@tanstack/react-router";
import { queryOptions } from '@tanstack/react-query';
import { fetchFileProperties } from "@/lib/api"; // Import fetchFileProperties
import { GlobalHero } from "@/components/global/GlobalHero";
import PropertyCard from "@/components/global/PropertyCard";
import { Badge } from "@/components/ui/badge";

const filesQueryOptions = () =>
  queryOptions({
    queryKey: ['files'], // Changed queryKey for files
    queryFn: () => fetchFileProperties(),
  });

export const Route = createFileRoute("/files/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(filesQueryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const fileProperties = Route.useLoaderData();

  return (
    <div>
      <GlobalHero
        image={"/images/real-estate-6688945_1280.jpg"}
        overlay
        height="60vh"
      >
        <div className="flex flex-col items-center justify-center">
          <h1 className="px-4 py-4 mx-auto text-4xl font-extrabold text-center text-white pt-18">
            Explore Files
          </h1>
        </div>
      </GlobalHero>
      <div className="container py-8 mx-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {fileProperties.map((property) => (
            <div key={property.id}>
              <PropertyCard {...property} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
